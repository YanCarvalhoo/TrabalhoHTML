// ===============================
// CHAVES DO STORAGE
// ===============================
const STORAGE_KEY_USUARIOS         = 'sysprod_usuarios';
const STORAGE_KEY_LEMBRAR          = 'lembrarSenha';
const STORAGE_KEY_USUARIO_LEMBRADO = 'usuarioGuardado';
const STORAGE_KEY_SENHA_LEMBRADA   = 'senhaGuardada';
const SESSION_USUARIO_LOGADO       = 'usuarioLogado';


// ===============================
// CARREGAR / SALVAR USUÁRIOS
// ===============================
function carregarUsuarios() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USUARIOS)) || [];
}

function salvarUsuarios(usuarios) {
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(usuarios));
}


// ===============================
// CONTROLE DE PAINÉIS
// ===============================
function showPanel(id) {
    document.querySelectorAll('.login-panel').forEach(p => p.classList.remove('active'));
    const alvo = document.getElementById(id);
    if (alvo) alvo.classList.add('active');
}


// ===============================
// VALIDAÇÃO — compatível com
// md-outlined-text-field e inputs nativos
// ===============================
function showError(inputEl, errEl, msg) {
    if (inputEl) inputEl.classList.add('error-field');
    if (errEl) {
        if (msg) errEl.textContent = msg;
        errEl.classList.add('show');
    }
}

function clearError(inputEl, errEl) {
    if (inputEl) inputEl.classList.remove('error-field');
    if (errEl) errEl.classList.remove('show');
}


// ===============================
// HELPERS — md Web Components
// ===============================

// Valor de md-outlined-text-field ou input nativo
function getValue(el)    { return el ? (el.value || '').trim() : ''; }
function getRawValue(el) { return el ? (el.value || '') : ''; }
function clearValue(el)  { if (el) el.value = ''; }

// Estado checked de md-checkbox ou input nativo
function isChecked(el)         { return el ? el.checked : false; }
function setChecked(el, value) { if (el) el.checked = value; }


// ===============================
// LOADING STATE NO BOTÃO
// ===============================
function setBtnLoading(btn, loading, texto) {
    if (!btn) return;
    if (loading) {
        btn.classList.add('loading');
        btn.textContent = 'Aguarde...';
    } else {
        btn.classList.remove('loading');
        btn.textContent = texto;
    }
}


// ===============================
// TRANSIÇÃO HERO → LOGIN
// ===============================
(function iniciarTransicao() {
    const heroWrapper = document.getElementById('hero-wrapper');
    const appWrapper  = document.getElementById('app-wrapper');
    const scrollHint  = document.getElementById('scrollHint');

    if (!heroWrapper || !appWrapper) return;

    let transitioned = false;

    function triggerTransition() {
        if (transitioned) return;
        transitioned = true;

        heroWrapper.classList.add('hero-hidden');

        setTimeout(() => {
            appWrapper.classList.add('app-visible');
        }, 100);
    }

    // Roda do mouse para baixo
    window.addEventListener('wheel', e => {
        if (e.deltaY > 0) triggerTransition();
    }, { passive: true });

    // Swipe para baixo no touch
    let touchStartY = 0;
    window.addEventListener('touchstart', e => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', e => {
        if (touchStartY - e.changedTouches[0].clientY > 40) triggerTransition();
    }, { passive: true });

    // Clique no botão scroll
    if (scrollHint) scrollHint.addEventListener('click', triggerTransition);

    // Teclas: seta baixo, espaço, page down
    window.addEventListener('keydown', e => {
        if (['ArrowDown', ' ', 'PageDown'].includes(e.key)) {
            e.preventDefault();
            triggerTransition();
        }
    });
})();


// ===============================
// CARREGAR MAIN.HTML
// ===============================
fetch('main.html')
    .then(r => r.text())
    .then(data => {
        document.getElementById('main').innerHTML = data;
    });


// ===============================
// INICIALIZAÇÃO — espera o DOM
// do main.html via MutationObserver
// ===============================
const observer = new MutationObserver(() => {
    if (!document.getElementById('panel-login')) return;
    observer.disconnect();
    iniciarLogin();
});

observer.observe(document.getElementById('main'), { childList: true, subtree: true });


// ===============================
// FUNÇÃO PRINCIPAL
// ===============================
function iniciarLogin() {

    // — Painel Login —
    const inputUsuario    = document.getElementById('inputUsuario');
    const inputSenha      = document.getElementById('inputSenha');
    const chkLembrar      = document.getElementById('lembrarSenha');
    const btnLogin        = document.getElementById('btnLogin');
    const alertMsg        = document.getElementById('alertMsg');
    const linkCadastrar   = document.getElementById('linkCadastrar');
    const linkRecuperar   = document.getElementById('linkRecuperar');

    // — Painel Cadastro —
    const cadNome         = document.getElementById('cadNome');
    const cadUsuario      = document.getElementById('cadUsuario');
    const cadEmail        = document.getElementById('cadEmail');
    const cadSenha        = document.getElementById('cadSenha');
    const cadConfSenha    = document.getElementById('cadConfSenha');
    const btnCadastrar    = document.getElementById('btnCadastrar');
    const alertCadastro   = document.getElementById('alertCadastro');
    const linkVoltarLogin = document.getElementById('linkVoltarLogin');

    // — Painel Recuperar —
    const recEmail          = document.getElementById('recEmail');
    const btnRecuperar      = document.getElementById('btnRecuperar');
    const alertRecuperar    = document.getElementById('alertRecuperar');
    const linkVoltarLogin2  = document.getElementById('linkVoltarLogin2');


    // ===============================
    // LEMBRAR-ME — restaurar dados
    // Aguarda custom elements M3
    // ===============================
    if (localStorage.getItem(STORAGE_KEY_LEMBRAR) === 'true') {
        const u = localStorage.getItem(STORAGE_KEY_USUARIO_LEMBRADO);
        const s = localStorage.getItem(STORAGE_KEY_SENHA_LEMBRADA);

        const definirValores = () => {
            setChecked(chkLembrar, true);
            if (u && inputUsuario) inputUsuario.value = u;
            if (s && inputSenha)   inputSenha.value   = s;
        };

        // Tenta via customElements, com fallback imediato
        Promise.all([
            customElements.whenDefined('md-outlined-text-field').catch(() => {}),
            customElements.whenDefined('md-checkbox').catch(() => {})
        ]).then(definirValores).catch(definirValores);
    }


    // ===============================
    // LIMPAR ERROS AO DIGITAR
    // ===============================
    inputUsuario?.addEventListener('input', () =>
        clearError(inputUsuario, document.getElementById('erroUsuario')));
    inputSenha?.addEventListener('input', () =>
        clearError(inputSenha, document.getElementById('erroSenha')));

    cadNome?.addEventListener('input',      () => clearError(cadNome,      document.getElementById('erroCadNome')));
    cadUsuario?.addEventListener('input',   () => clearError(cadUsuario,   document.getElementById('erroCadUsuario')));
    cadEmail?.addEventListener('input',     () => clearError(cadEmail,     document.getElementById('erroCadEmail')));
    cadSenha?.addEventListener('input',     () => clearError(cadSenha,     document.getElementById('erroCadSenha')));
    cadConfSenha?.addEventListener('input', () => clearError(cadConfSenha, document.getElementById('erroCadConfSenha')));
    recEmail?.addEventListener('input',     () => clearError(recEmail,     document.getElementById('erroRecEmail')));


    // ===============================
    // NAVEGAÇÃO ENTRE PAINÉIS
    // ===============================
    linkCadastrar?.addEventListener('click', e => {
        e.preventDefault();
        if (alertCadastro) alertCadastro.className = 'alert-msg';
        showPanel('panel-cadastro');
    });

    linkRecuperar?.addEventListener('click', e => {
        e.preventDefault();
        if (alertRecuperar) alertRecuperar.className = 'alert-msg';
        showPanel('panel-recuperar');
    });

    linkVoltarLogin?.addEventListener('click',  e => { e.preventDefault(); showPanel('panel-login'); });
    linkVoltarLogin2?.addEventListener('click', e => { e.preventDefault(); showPanel('panel-login'); });


    // ===============================
    // EVENTO: ENTRAR NO SISTEMA
    // ===============================
    btnLogin?.addEventListener('click', function () {

        let valido = true;

        if (alertMsg) { alertMsg.className = 'alert-msg'; alertMsg.textContent = ''; }

        if (!getValue(inputUsuario)) {
            showError(inputUsuario, document.getElementById('erroUsuario'),
                'Por favor, informe seu usuário.');
            valido = false;
        }

        if (!getRawValue(inputSenha)) {
            showError(inputSenha, document.getElementById('erroSenha'),
                'Por favor, informe sua senha.');
            valido = false;
        }

        if (!valido) return;

        setBtnLoading(btnLogin, true, 'Entrar no Sistema');

        setTimeout(() => {
            const usuarios = carregarUsuarios();
            const usuario  = usuarios.find(
                u => u.usuario === getValue(inputUsuario) &&
                     u.senha   === getRawValue(inputSenha)
            );

            if (!usuario) {
                setBtnLoading(btnLogin, false, 'Entrar no Sistema');
                if (alertMsg) {
                    alertMsg.textContent = 'Usuário ou senha incorretos.';
                    alertMsg.className   = 'alert-msg error';
                }
                showError(inputUsuario, document.getElementById('erroUsuario'), ' ');
                showError(inputSenha,   document.getElementById('erroSenha'),   ' ');
                return;
            }

            // Lembrar-me
            if (isChecked(chkLembrar)) {
                localStorage.setItem(STORAGE_KEY_LEMBRAR,           'true');
                localStorage.setItem(STORAGE_KEY_USUARIO_LEMBRADO,  getValue(inputUsuario));
                localStorage.setItem(STORAGE_KEY_SENHA_LEMBRADA,    getRawValue(inputSenha));
            } else {
                localStorage.removeItem(STORAGE_KEY_LEMBRAR);
                localStorage.removeItem(STORAGE_KEY_USUARIO_LEMBRADO);
                localStorage.removeItem(STORAGE_KEY_SENHA_LEMBRADA);
            }

            sessionStorage.setItem(SESSION_USUARIO_LOGADO,
                usuario.nome || getValue(inputUsuario));

            if (alertMsg) {
                alertMsg.textContent = 'Login realizado! Redirecionando...';
                alertMsg.className   = 'alert-msg success';
            }

            setTimeout(() => { window.location.href = '../Index/index.html'; }, 1000);

        }, 400);
    });


    // ===============================
    // EVENTO: CRIAR CONTA
    // ===============================
    btnCadastrar?.addEventListener('click', function () {

        let valido = true;
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (alertCadastro) { alertCadastro.className = 'alert-msg'; alertCadastro.textContent = ''; }

        if (!getValue(cadNome)) {
            showError(cadNome, document.getElementById('erroCadNome'), 'Por favor, informe seu nome.');
            valido = false;
        }
        if (!getValue(cadUsuario)) {
            showError(cadUsuario, document.getElementById('erroCadUsuario'), 'Por favor, informe um nome de usuário.');
            valido = false;
        }
        if (!regexEmail.test(getValue(cadEmail))) {
            showError(cadEmail, document.getElementById('erroCadEmail'), 'Informe um e-mail válido.');
            valido = false;
        }
        if (getRawValue(cadSenha).length < 6) {
            showError(cadSenha, document.getElementById('erroCadSenha'), 'A senha precisa ter ao menos 6 caracteres.');
            valido = false;
        }
        if (getRawValue(cadConfSenha) !== getRawValue(cadSenha)) {
            showError(cadConfSenha, document.getElementById('erroCadConfSenha'), 'As senhas não coincidem.');
            valido = false;
        }

        if (!valido) return;

        setBtnLoading(btnCadastrar, true, 'Criar Conta');

        setTimeout(() => {
            const usuarios = carregarUsuarios();

            if (usuarios.some(u => u.usuario === getValue(cadUsuario))) {
                setBtnLoading(btnCadastrar, false, 'Criar Conta');
                if (alertCadastro) {
                    alertCadastro.textContent = 'Este usuário já está em uso. Escolha outro.';
                    alertCadastro.className   = 'alert-msg error';
                }
                return;
            }

            usuarios.push({
                nome:    getValue(cadNome),
                usuario: getValue(cadUsuario),
                email:   getValue(cadEmail),
                senha:   getRawValue(cadSenha)
            });

            salvarUsuarios(usuarios);
            setBtnLoading(btnCadastrar, false, 'Criar Conta');

            if (alertCadastro) {
                alertCadastro.textContent = 'Conta criada! Faça login para continuar.';
                alertCadastro.className   = 'alert-msg success';
            }

            [cadNome, cadUsuario, cadEmail, cadSenha, cadConfSenha].forEach(clearValue);

            setTimeout(() => showPanel('panel-login'), 1500);

        }, 400);
    });


    // ===============================
    // EVENTO: RECUPERAR SENHA (POC)
    // ===============================
    btnRecuperar?.addEventListener('click', function () {

        if (alertRecuperar) { alertRecuperar.className = 'alert-msg'; alertRecuperar.textContent = ''; }

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const email = getValue(recEmail);

        if (!regexEmail.test(email)) {
            showError(recEmail, document.getElementById('erroRecEmail'), 'Informe um e-mail válido.');
            return;
        }

        setBtnLoading(btnRecuperar, true, 'Enviar Instruções');

        setTimeout(() => {
            setBtnLoading(btnRecuperar, false, 'Enviar Instruções');

            if (alertRecuperar) {
                alertRecuperar.textContent = 'Instruções enviadas para ' + email + '. Verifique sua caixa de entrada.';
                alertRecuperar.className   = 'alert-msg success';
            }

            clearValue(recEmail);
        }, 600);
    });
}