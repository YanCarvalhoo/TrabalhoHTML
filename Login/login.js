// ===============================
// CARREGAMENTO DO HTML PRINCIPAL
// ===============================

// Carrega o conteúdo de main.html dentro da <main id="main">
fetch('main.html')
.then(response => response.text())
.then(data => {
    document.getElementById('main').innerHTML = data;
});

// ===============================
// CHAVES DO STORAGE
// ===============================
const STORAGE_KEY_USUARIOS = 'sysprod_usuarios';   // localStorage — array de usuários cadastrados
const STORAGE_KEY_LEMBRAR  = 'lembrarSenha';       // localStorage — flag lembrar-me
const STORAGE_KEY_USUARIO_LEMBRADO  = 'usuarioGuardado'; // localStorage — usuário lembrado
const STORAGE_KEY_SENHA_LEMBRADA    = 'senhaGuardada';   // localStorage — senha lembrada
const SESSION_USUARIO_LOGADO = 'usuarioLogado';    // sessionStorage — nome do usuário ativo


// ===============================
// CARREGAR USUÁRIOS SALVOS
// ===============================

/**
 * Retorna o array de usuários cadastrados no localStorage.
 * Caso não haja nada, retorna array vazio.
 * @returns {Array}
 */
function carregarUsuarios() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USUARIOS)) || [];
}


/**
 * Persiste o array de usuários no localStorage.
 * @param {Array} usuarios
 */
function salvarUsuarios(usuarios) {
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(usuarios));
}


// ===============================
// CONTROLE DE PAINÉIS
// ===============================

/**
 * Exibe apenas o painel com o id informado.
 * Oculta todos os outros painéis (.login-panel).
 * @param {string} id — ex: 'panel-login', 'panel-cadastro', 'panel-recuperar'
 */
function showPanel(id) {
    document.querySelectorAll('.login-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    const alvo = document.getElementById(id);
    if (alvo) alvo.classList.add('active');
}


// ===============================
// FUNÇÕES DE VALIDAÇÃO DE CAMPO
// ===============================

/**
 * Marca um campo como inválido: borda vermelha + mensagem de erro.
 * @param {HTMLElement} inputEl — o <input>
 * @param {HTMLElement} errEl   — o <div class="field-error">
 * @param {string}      msg     — texto da mensagem (opcional; usa o texto já no HTML se omitido)
 */
function showError(inputEl, errEl, msg) {
    inputEl.classList.add('error-field');
    if (msg) errEl.textContent = msg;
    errEl.classList.add('show');
}


/**
 * Remove o estado de erro de um campo.
 * @param {HTMLElement} inputEl
 * @param {HTMLElement} errEl
 */
function clearError(inputEl, errEl) {
    inputEl.classList.remove('error-field');
    errEl.classList.remove('show');
}


// ===============================
// INICIALIZAÇÃO (após fetch do HTML)
// ===============================

// login.js é carregado ANTES do fetch terminar,
// portanto toda a lógica fica dentro do MutationObserver
// que aguarda os elementos aparecerem no DOM.
const observer = new MutationObserver(() => {

    // Aguarda o elemento-raiz do painel de login aparecer
    if (!document.getElementById('panel-login')) return;

    // Elementos existem — para o observer e inicia
    observer.disconnect();
    iniciarLogin();
});

observer.observe(document.getElementById('main'), { childList: true, subtree: true });


// ===============================
// FUNÇÃO PRINCIPAL
// ===============================
function iniciarLogin() {

    // ===============================
    // SELEÇÃO DE ELEMENTOS
    // ===============================

    // — Painel Login —
    const inputUsuario = document.getElementById('inputUsuario');
    const inputSenha   = document.getElementById('inputSenha');
    const chkLembrar   = document.getElementById('lembrarSenha');
    const btnLogin     = document.getElementById('btnLogin');
    const alertMsg     = document.getElementById('alertMsg');
    const linkCadastrar  = document.getElementById('linkCadastrar');
    const linkRecuperar  = document.getElementById('linkRecuperar');

    // — Painel Cadastro —
    const cadNome      = document.getElementById('cadNome');
    const cadUsuario   = document.getElementById('cadUsuario');
    const cadEmail     = document.getElementById('cadEmail');
    const cadSenha     = document.getElementById('cadSenha');
    const cadConfSenha = document.getElementById('cadConfSenha');
    const btnCadastrar = document.getElementById('btnCadastrar');
    const alertCadastro = document.getElementById('alertCadastro');
    const linkVoltarLogin = document.getElementById('linkVoltarLogin');

    // — Painel Recuperar —
    const recEmail     = document.getElementById('recEmail');
    const btnRecuperar = document.getElementById('btnRecuperar');
    const alertRecuperar = document.getElementById('alertRecuperar');
    const linkVoltarLogin2 = document.getElementById('linkVoltarLogin2');


    // ===============================
    // CARREGAR DADOS SALVOS (LEMBRAR-ME)
    // ===============================

    const lembrado = localStorage.getItem(STORAGE_KEY_LEMBRAR);

    if (lembrado === 'true') {
        // Marca o checkbox
        chkLembrar.checked = true;

        // Preenche os campos automaticamente
        const usuarioGuardado = localStorage.getItem(STORAGE_KEY_USUARIO_LEMBRADO);
        const senhaGuardada   = localStorage.getItem(STORAGE_KEY_SENHA_LEMBRADA);

        if (usuarioGuardado) inputUsuario.value = usuarioGuardado;
        if (senhaGuardada)   inputSenha.value   = senhaGuardada;
    }


    // ===============================
    // REMOVER ERROS AO DIGITAR — LOGIN
    // ===============================
    inputUsuario.addEventListener('input', () => clearError(inputUsuario, document.getElementById('erroUsuario')));
    inputSenha.addEventListener('input',   () => clearError(inputSenha,   document.getElementById('erroSenha')));


    // ===============================
    // NAVEGAÇÃO ENTRE PAINÉIS
    // ===============================

    // Ir para cadastro
    linkCadastrar.addEventListener('click', e => {
        e.preventDefault();
        alertCadastro.className = 'alert-msg';
        showPanel('panel-cadastro');
    });

    // Ir para recuperar senha
    linkRecuperar.addEventListener('click', e => {
        e.preventDefault();
        alertRecuperar.className = 'alert-msg';
        showPanel('panel-recuperar');
    });

    // Voltar para login (do cadastro)
    linkVoltarLogin.addEventListener('click', e => {
        e.preventDefault();
        showPanel('panel-login');
    });

    // Voltar para login (do recuperar)
    linkVoltarLogin2.addEventListener('click', e => {
        e.preventDefault();
        showPanel('panel-login');
    });


    // ===============================
    // EVENTO: ENTRAR NO SISTEMA
    // ===============================
    btnLogin.addEventListener('click', function () {

        let valido = true;

        // Limpa alerta anterior
        alertMsg.className = 'alert-msg';
        alertMsg.textContent = '';

        // — Valida usuário —
        if (!inputUsuario.value.trim()) {
            showError(inputUsuario, document.getElementById('erroUsuario'), 'Por favor, informe seu usuário.');
            valido = false;
        }

        // — Valida senha —
        if (!inputSenha.value.trim()) {
            showError(inputSenha, document.getElementById('erroSenha'), 'Por favor, informe sua senha.');
            valido = false;
        }

        if (!valido) return;

        // ===============================
        // VERIFICAR CREDENCIAIS
        // ===============================
        const usuarios = carregarUsuarios();
        const usuario = usuarios.find(
            u => u.usuario === inputUsuario.value.trim() && u.senha === inputSenha.value
        );

        if (!usuario) {
            alertMsg.textContent = 'Usuário ou senha incorretos.';
            alertMsg.classList.add('error');
            return;
        }

        // ===============================
        // LEMBRAR-ME (LOCALSTORAGE)
        // ===============================
        if (chkLembrar.checked) {
            localStorage.setItem(STORAGE_KEY_LEMBRAR,          'true');
            localStorage.setItem(STORAGE_KEY_USUARIO_LEMBRADO, inputUsuario.value.trim());
            localStorage.setItem(STORAGE_KEY_SENHA_LEMBRADA,   inputSenha.value);
        } else {
            localStorage.removeItem(STORAGE_KEY_LEMBRAR);
            localStorage.removeItem(STORAGE_KEY_USUARIO_LEMBRADO);
            localStorage.removeItem(STORAGE_KEY_SENHA_LEMBRADA);
        }

        // ===============================
        // SESSÃO DO USUÁRIO (SESSIONSTORAGE)
        // ===============================
        sessionStorage.setItem(SESSION_USUARIO_LOGADO, usuario.nome || inputUsuario.value.trim());

        // ===============================
        // FEEDBACK + REDIRECIONAMENTO
        // ===============================
        alertMsg.textContent = 'Login realizado com sucesso! Redirecionando...';
        alertMsg.classList.add('success');

        setTimeout(() => {
            window.location.href = '../Index/index.html';
        }, 1000);

    });


    // ===============================
    // REMOVER ERROS AO DIGITAR — CADASTRO
    // ===============================
    cadNome.addEventListener('input',      () => clearError(cadNome,      document.getElementById('erroCadNome')));
    cadUsuario.addEventListener('input',   () => clearError(cadUsuario,   document.getElementById('erroCadUsuario')));
    cadEmail.addEventListener('input',     () => clearError(cadEmail,     document.getElementById('erroCadEmail')));
    cadSenha.addEventListener('input',     () => clearError(cadSenha,     document.getElementById('erroCadSenha')));
    cadConfSenha.addEventListener('input', () => clearError(cadConfSenha, document.getElementById('erroCadConfSenha')));


    // ===============================
    // EVENTO: CRIAR CONTA
    // ===============================
    btnCadastrar.addEventListener('click', function () {

        let valido = true;

        // Limpa alerta anterior
        alertCadastro.className = 'alert-msg';
        alertCadastro.textContent = '';

        // — Valida nome —
        if (!cadNome.value.trim()) {
            showError(cadNome, document.getElementById('erroCadNome'), 'Por favor, informe seu nome.');
            valido = false;
        }

        // — Valida usuário —
        if (!cadUsuario.value.trim()) {
            showError(cadUsuario, document.getElementById('erroCadUsuario'), 'Por favor, informe um nome de usuário.');
            valido = false;
        }

        // — Valida e-mail —
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(cadEmail.value.trim())) {
            showError(cadEmail, document.getElementById('erroCadEmail'), 'Informe um e-mail válido.');
            valido = false;
        }

        // — Valida senha —
        if (cadSenha.value.length < 6) {
            showError(cadSenha, document.getElementById('erroCadSenha'), 'A senha precisa ter ao menos 6 caracteres.');
            valido = false;
        }

        // — Valida confirmação de senha —
        if (cadConfSenha.value !== cadSenha.value) {
            showError(cadConfSenha, document.getElementById('erroCadConfSenha'), 'As senhas não coincidem.');
            valido = false;
        }

        if (!valido) return;

        // ===============================
        // VERIFICAR USUÁRIO JÁ EXISTENTE
        // ===============================
        const usuarios = carregarUsuarios();
        const jaExiste = usuarios.some(u => u.usuario === cadUsuario.value.trim());

        if (jaExiste) {
            alertCadastro.textContent = 'Este nome de usuário já está em uso. Escolha outro.';
            alertCadastro.classList.add('error');
            return;
        }

        // ===============================
        // SALVAR NOVO USUÁRIO
        // ===============================
        usuarios.push({
            nome:    cadNome.value.trim(),
            usuario: cadUsuario.value.trim(),
            email:   cadEmail.value.trim(),
            senha:   cadSenha.value
        });

        salvarUsuarios(usuarios);

        // Feedback de sucesso
        alertCadastro.textContent = 'Conta criada com sucesso! Faça login para continuar.';
        alertCadastro.classList.add('success');

        // Limpa campos
        cadNome.value = cadUsuario.value = cadEmail.value = cadSenha.value = cadConfSenha.value = '';

        // Volta para o login após 1,5s
        setTimeout(() => showPanel('panel-login'), 1500);
    });


    // ===============================
    // REMOVER ERRO AO DIGITAR — RECUPERAR
    // ===============================
    recEmail.addEventListener('input', () => clearError(recEmail, document.getElementById('erroRecEmail')));


    // ===============================
    // EVENTO: RECUPERAR SENHA (POC — SIMULADO)
    // ===============================
    btnRecuperar.addEventListener('click', function () {

        // Limpa alerta anterior
        alertRecuperar.className = 'alert-msg';
        alertRecuperar.textContent = '';

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regexEmail.test(recEmail.value.trim())) {
            showError(recEmail, document.getElementById('erroRecEmail'), 'Informe um e-mail válido.');
            return;
        }

        // Simula envio (POC — sem backend)
        alertRecuperar.textContent = 'Instruções enviadas para ' + recEmail.value.trim() + '. Verifique sua caixa de entrada.';
        alertRecuperar.classList.add('success');

        recEmail.value = '';
    });
}

