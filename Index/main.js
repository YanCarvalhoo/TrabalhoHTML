// ===============================
// INICIALIZAÇÃO DO SISTEMA
// Aguarda o DOM estar pronto
// ===============================
document.addEventListener("DOMContentLoaded", async function () {

    // ===============================
    // CARREGAR HTMLs DINÂMICOS
    // Ordem importa: header > main > footer
    // ===============================
    await fetch('header.html')
        .then(r => r.text())
        .then(data => document.getElementById('header').innerHTML = data);

    await fetch('main.html')
        .then(r => r.text())
        .then(data => document.getElementById('main').innerHTML = data);

    await fetch('footer.html')
        .then(r => r.text())
        .then(data => document.getElementById('footer').innerHTML = data);

    // Após carregar todos os fragmentos HTML, inicia a lógica
    iniciarSistema();
});


// ===============================
// FUNÇÃO PRINCIPAL DO SISTEMA
// Toda a lógica fica aqui para
// garantir que o DOM já foi montado
// ===============================
function iniciarSistema() {

    // ===============================
    // CONFIGURAÇÕES
    // ===============================
    const STORAGE_KEY = 'sysprod_produtos'; // chave do localStorage

    /** @type {Array} Lista de produtos em memória */
    let produtos = carregarProdutos();

    /** @type {number|null} ID do produto que será excluído pelo modal */
    let idParaDeletar = null;


    // ===============================
    // USUÁRIO LOGADO (sessionStorage)
    // Carrega o nome salvo no login
    // ===============================
    const nomeUsuario = sessionStorage.getItem('usuarioLogado');

    if (nomeUsuario) {
        const el = document.getElementById('nomeUsuario');
        if (el) el.textContent = nomeUsuario;
    }


    // ===============================
    // LOGO → RECARREGA A HOMEPAGE
    // ===============================
    const logo = document.getElementById('logoLink');

    if (logo) {
        logo.addEventListener('click', e => {
            e.preventDefault();
            location.reload(); // recarrega como a especificação exige
        });
    }


    // ===============================
    // NAVEGAÇÃO ENTRE TELAS
    // ===============================

    /**
     * Troca a tela ativa pelo id informado.
     * Atualiza também o link ativo no menu.
     * @param {string} screen — 'home' | 'produtos' | 'cadastrar'
     */
    function navegar(screen) {

        // Remove classe .active de todas as telas e links
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

        // Ativa a tela correspondente
        const tela = document.getElementById('screen-' + screen);
        if (tela) tela.classList.add('active');

        // Ativa o link do menu correspondente
        const link = document.querySelector(`[data-screen="${screen}"]`);
        if (link) link.classList.add('active');

        // Ações específicas por tela
        if (screen === 'produtos') renderTabela();
        if (screen === 'cadastrar') limparForm2();
    }

    // Clique nos links do menu
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navegar(link.dataset.screen);
        });
    });

    // Clique nos cards da tela Home
    document.querySelectorAll('[data-goto]').forEach(card => {
        card.addEventListener('click', () => navegar(card.dataset.goto));
    });


    // ===============================
    // BOTÕES — FORMULÁRIO PRINCIPAL
    // (tela de listagem de produtos)
    // ===============================

    // Abre o formulário para novo produto
    document.getElementById('btnNovoProduto')?.addEventListener('click', () => {
        const card = document.getElementById('cardCriar');
        card.style.display = 'block';
        limparForm();
        document.getElementById('editandoId').value = '';
        document.getElementById('formTitulo').textContent = 'Novo Produto';
    });

    // Salvar (form principal)
    document.getElementById('btnSalvar')?.addEventListener('click', () => {
        salvarProduto(
            document.getElementById('inputNome'),
            document.getElementById('inputPreco'),
            document.getElementById('inputEstoque'),
            document.getElementById('erroNome'),
            document.getElementById('erroPreco'),
            document.getElementById('erroEstoque'),
            document.getElementById('editandoId').value || null
        );
    });

    // Cancelar / Limpar (form principal)
    document.getElementById('btnCancelar')?.addEventListener('click', () => {
        limparForm();
        document.getElementById('editandoId').value = '';
        document.getElementById('cardCriar').style.display = 'none';
    });


    // ===============================
    // BOTÕES — FORMULÁRIO SECUNDÁRIO
    // (tela "Cadastrar" do menu)
    // ===============================

    // Salvar (form secundário)
    document.getElementById('btnSalvar2')?.addEventListener('click', () => {
        salvarProduto(
            document.getElementById('inputNome2'),
            document.getElementById('inputPreco2'),
            document.getElementById('inputEstoque2'),
            document.getElementById('erroNome2'),
            document.getElementById('erroPreco2'),
            document.getElementById('erroEstoque2'),
            null // sempre cria novo produto
        );
    });

    // Limpar (form secundário)
    document.getElementById('btnCancelar2')?.addEventListener('click', limparForm2);


    // ===============================
    // MODAL DE EXCLUSÃO
    // ===============================

    // Fechar modal sem excluir
    document.getElementById('btnCancelDel')?.addEventListener('click', () => {
        fecharModal();
    });

    // Confirmar exclusão
    document.getElementById('btnConfirmDel')?.addEventListener('click', () => {

        if (idParaDeletar !== null) {

            // Remove o produto do array
            produtos = produtos.filter(p => p.id !== idParaDeletar);

            salvarProdutosStorage();
            renderTabela();

            toast('Produto excluído com sucesso.', 'error');
        }

        fecharModal();
    });

    // Fecha modal ao clicar fora da caixa
    document.getElementById('modalOverlay')?.addEventListener('click', e => {
        if (e.target.id === 'modalOverlay') fecharModal();
    });

    /**
     * Fecha o modal e limpa o id pendente.
     */
    function fecharModal() {
        document.getElementById('modalOverlay').style.display = 'none';
        idParaDeletar = null;
    }


    // ===============================
    // SALVAR PRODUTO (CREATE / UPDATE)
    // ===============================

    /**
     * Valida os campos e salva (cria ou edita) um produto.
     * @param {HTMLElement} inputNome
     * @param {HTMLElement} inputPreco
     * @param {HTMLElement} inputEstoque
     * @param {HTMLElement} erroNome
     * @param {HTMLElement} erroPreco
     * @param {HTMLElement} erroEstoque
     * @param {string|null}  editId — id do produto em edição, ou null para criar
     */
    function salvarProduto(inputNome, inputPreco, inputEstoque, erroNome, erroPreco, erroEstoque, editId) {

        const nome    = inputNome.value.trim();
        const preco   = parseFloat(inputPreco.value);
        const estoque = parseInt(inputEstoque.value);

        let valido = true;

        // — Limpa erros anteriores —
        clearFieldError(inputNome,    erroNome);
        clearFieldError(inputPreco,   erroPreco);
        clearFieldError(inputEstoque, erroEstoque);

        // — Valida nome —
        if (!nome) {
            showFieldError(inputNome, erroNome, 'Informe o nome do produto.');
            valido = false;
        }

        // — Valida preço —
        if (isNaN(preco) || preco < 0) {
            showFieldError(inputPreco, erroPreco, 'Informe um preço válido (ex: 29.90).');
            valido = false;
        }

        // — Valida estoque —
        if (isNaN(estoque) || estoque < 0) {
            showFieldError(inputEstoque, erroEstoque, 'Informe uma quantidade válida.');
            valido = false;
        }

        if (!valido) return;

        // ===============================
        // EDITAR produto existente
        // ===============================
        if (editId) {
            const idx = produtos.findIndex(p => p.id === parseInt(editId));

            if (idx !== -1) {
                produtos[idx] = { ...produtos[idx], nome, preco, estoque };
                toast('Produto atualizado com sucesso.', 'success');
            }

            // Fecha o formulário e limpa o id de edição
            document.getElementById('editandoId').value = '';
            document.getElementById('cardCriar').style.display = 'none';
        }
        // ===============================
        // CRIAR novo produto
        // ===============================
        else {
            produtos.push({
                id: gerarId(),
                nome,
                preco,
                estoque
            });

            toast('Produto cadastrado com sucesso.', 'success');
        }

        salvarProdutosStorage();

        // Limpa campos do formulário usado
        inputNome.value    = '';
        inputPreco.value   = '';
        inputEstoque.value = '';

        // Atualiza a tabela se estiver na tela de produtos
        renderTabela();
    }


    // ===============================
    // EDITAR PRODUTO
    // Carrega os dados no formulário principal
    // ===============================

    /**
     * Preenche o formulário principal com os dados do produto
     * e rola a tela até o formulário.
     * @param {number} id
     */
    function editarProduto(id) {

        const produto = produtos.find(p => p.id === id);
        if (!produto) return;

        // Mostra o formulário
        const card = document.getElementById('cardCriar');
        card.style.display = 'block';

        // Preenche os campos
        document.getElementById('inputNome').value    = produto.nome;
        document.getElementById('inputPreco').value   = produto.preco;
        document.getElementById('inputEstoque').value = produto.estoque;
        document.getElementById('editandoId').value   = produto.id;

        // Atualiza o título do card
        document.getElementById('formTitulo').textContent = 'Editar Produto';

        // Rola até o formulário
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }


    // ===============================
    // ABRIR MODAL DE EXCLUSÃO
    // ===============================

    /**
     * Exibe o modal de confirmação de exclusão.
     * @param {number} id
     */
    function abrirModalExclusao(id) {

        const produto = produtos.find(p => p.id === id);
        if (!produto) return;

        idParaDeletar = id;

        document.getElementById('modalProdutoNome').textContent = produto.nome;
        document.getElementById('modalOverlay').style.display   = 'flex';
    }


    // ===============================
    // LIMPAR FORMULÁRIOS
    // ===============================

    /** Limpa o formulário principal (tela Produtos) */
    function limparForm() {
        ['inputNome', 'inputPreco', 'inputEstoque'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

        // Remove erros visuais
        clearFieldError(document.getElementById('inputNome'),    document.getElementById('erroNome'));
        clearFieldError(document.getElementById('inputPreco'),   document.getElementById('erroPreco'));
        clearFieldError(document.getElementById('inputEstoque'), document.getElementById('erroEstoque'));
    }

    /** Limpa o formulário secundário (tela Cadastrar) */
    function limparForm2() {
        ['inputNome2', 'inputPreco2', 'inputEstoque2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

        clearFieldError(document.getElementById('inputNome2'),    document.getElementById('erroNome2'));
        clearFieldError(document.getElementById('inputPreco2'),   document.getElementById('erroPreco2'));
        clearFieldError(document.getElementById('inputEstoque2'), document.getElementById('erroEstoque2'));
    }


    // ===============================
    // RENDERIZAÇÃO DA TABELA
    // ===============================

    /**
     * Atualiza o <tbody> da tabela com os dados de `produtos`.
     * Gera botões de Editar e Excluir para cada linha.
     */
    function renderTabela() {

        const tbody = document.getElementById('tabelaProdutos');
        if (!tbody) return;

        if (produtos.length === 0) {
            // Mensagem de lista vazia
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; color:var(--muted); padding:32px;">
                        Nenhum produto cadastrado. Clique em <strong>+ Novo Produto</strong> para começar.
                    </td>
                </tr>
            `;
            return;
        }

        // Formata cada produto como uma linha da tabela
        tbody.innerHTML = produtos.map(p => `
            <tr>
                <td data-label="ID">#${p.id}</td>
                <td data-label="Produto">${escapeHtml(p.nome)}</td>
                <td data-label="Preço">R$ ${Number(p.preco).toFixed(2)}</td>
                <td data-label="Estoque">${p.estoque} un.</td>
                <td data-label="Ações" class="td-acoes">
                    <button
                        class="btn-editar"
                        onclick="editarProdutoGlobal(${p.id})"
                        title="Editar produto"
                        aria-label="Editar produto ${escapeHtml(p.nome)}"
                    >
                        ✏️ Editar
                    </button>
                    <button
                        class="btn-excluir"
                        onclick="excluirProdutoGlobal(${p.id})"
                        title="Excluir produto"
                        aria-label="Excluir produto ${escapeHtml(p.nome)}"
                    >
                        🗑️ Excluir
                    </button>
                </td>
            </tr>
        `).join('');
    }


    // ===============================
    // EXPÕE FUNÇÕES AO ESCOPO GLOBAL
    // Necessário para os onclick inline da tabela
    // ===============================
    window.editarProdutoGlobal  = editarProduto;
    window.excluirProdutoGlobal = abrirModalExclusao;


    // ===============================
    // LOCAL STORAGE
    // ===============================

    /** Persiste o array de produtos */
    function salvarProdutosStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos));
    }

    /**
     * Carrega produtos do localStorage.
     * @returns {Array}
     */
    function carregarProdutos() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }


    // ===============================
    // TOAST (NOTIFICAÇÃO FLUTUANTE)
    // ===============================

    /**
     * Exibe uma notificação flutuante temporária.
     * @param {string} msg      — texto da mensagem
     * @param {string} tipo     — 'success' | 'error' | 'info'
     */
    function toast(msg, tipo = 'success') {

        const container = document.getElementById('toastContainer');
        if (!container) return;

        const el = document.createElement('div');
        el.className = `toast toast-${tipo}`;
        el.textContent = msg;

        el.setAttribute('role', 'alert');
        el.setAttribute('aria-live', 'polite');

        container.appendChild(el);

        // Anima entrada
        requestAnimationFrame(() => el.classList.add('show'));

        // Remove após 3 segundos
        setTimeout(() => {
            el.classList.remove('show');
            el.addEventListener('transitionend', () => el.remove());
        }, 3000);
    }


    // ===============================
    // FUNÇÕES DE ERRO DE CAMPO
    // ===============================

    /**
     * Marca campo como inválido e exibe mensagem de erro.
     * @param {HTMLElement} inputEl
     * @param {HTMLElement} errEl
     * @param {string}      msg
     */
    function showFieldError(inputEl, errEl, msg) {
        if (!inputEl || !errEl) return;
        inputEl.classList.add('error-field');
        errEl.textContent = msg;
        errEl.classList.add('show');
    }

    /**
     * Remove o estado de erro de um campo.
     * @param {HTMLElement} inputEl
     * @param {HTMLElement} errEl
     */
    function clearFieldError(inputEl, errEl) {
        if (!inputEl || !errEl) return;
        inputEl.classList.remove('error-field');
        errEl.classList.remove('show');
    }


    // ===============================
    // UTILITÁRIOS
    // ===============================

    /**
     * Gera um ID numérico único baseado no timestamp.
     * @returns {number}
     */
    function gerarId() {
        return Date.now();
    }

    /**
     * Escapa caracteres HTML para evitar XSS na tabela.
     * @param {string} str
     * @returns {string}
     */
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }


    // ===============================
    // INICIALIZAÇÃO FINAL
    // Renderiza a tabela ao carregar
    // ===============================
    renderTabela();
}