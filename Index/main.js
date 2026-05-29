// ========================================
// SISTEMA COMPLETO (MATERIAL DESIGN + NAVEGAÇÃO + ORDENAÇÃO + PAGINAÇÃO)
// ========================================

const STORAGE_KEY = 'mdc_produtos';
let produtos = [];
let deleteId = null;

// Configuração de ordenação
let sortConfig = {
    column: 'nome',
    direction: 'asc'
};

// Configuração de paginação
let paginacaoConfig = {
    rowsPerPage: 10,
    currentPage: 1
};

// ========================================
// 1. CARREGAR FRAGMENTOS HTML
// ========================================
document.addEventListener("DOMContentLoaded", async function () {
    try {
        await fetch('header.html')
            .then(r => r.text())
            .then(data => document.getElementById('header').innerHTML = data);
        await fetch('main.html')
            .then(r => r.text())
            .then(data => document.getElementById('main').innerHTML = data);
        await fetch('footer.html')
            .then(r => r.text())
            .then(data => document.getElementById('footer').innerHTML = data);
    } catch (e) {
        console.warn("Erro ao carregar fragments HTML.");
    }

    iniciarSistema();
});

// ========================================
// 2. FUNÇÃO PRINCIPAL
// ========================================
function iniciarSistema() {
    carregarProdutos();

    const nomeUsuario = sessionStorage.getItem('usuarioLogado');
    const nomeSpan = document.getElementById('nomeUsuario');
    if (nomeUsuario && nomeSpan) nomeSpan.textContent = nomeUsuario;

    const logo = document.getElementById('logoLink');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            location.reload();
        });
    }

    inicializarNavegacao();

    const btnSalvar = document.getElementById('btnSalvarProduto');
    if (btnSalvar) btnSalvar.addEventListener('click', salvarProduto);

    const btnLimpar = document.getElementById('btnLimparFormulario');
    if (btnLimpar) btnLimpar.addEventListener('click', limparFormulario);

    const modalOverlay = document.getElementById('modalOverlay');
    const btnCancelDel = document.getElementById('btnCancelDel');
    const btnConfirmDel = document.getElementById('btnConfirmDel');
    if (modalOverlay && btnCancelDel && btnConfirmDel) {
        btnCancelDel.addEventListener('click', fecharModal);
        btnConfirmDel.addEventListener('click', excluirProdutoConfirmado);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) fecharModal();
        });
    }

    adicionarColunaValidade();
    configurarOrdenacao();
    configurarPaginacao();
    renderizarTabela();
}

// ========================================
// 3. NAVEGAÇÃO
// ========================================
function inicializarNavegacao() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const screen = link.dataset.screen;
            if (screen) navegar(screen);
        });
    });

    document.querySelectorAll('[data-goto]').forEach(card => {
        card.addEventListener('click', () => {
            const tela = card.dataset.goto;
            if (tela) navegar(tela);
        });
    });
}

function navegar(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const tela = document.getElementById(`screen-${screenId}`);
    if (tela) tela.classList.add('active');

    const linkAtivo = document.querySelector(`.nav-link[data-screen="${screenId}"]`);
    if (linkAtivo) linkAtivo.classList.add('active');

    if (screenId === 'produtos') {
        paginacaoConfig.currentPage = 1;
        renderizarTabela();
    }
}

// ========================================
// 4. CRUD E ORDENAÇÃO
// ========================================
function carregarProdutos() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        produtos = JSON.parse(stored);
    } else {
        produtos = [
            { id: Date.now() + 1, nome: "Camiseta Oversized", preco: 89.90, estoque: 45, categoria: "Vestuário", validade: "2026-12-31", status: "active", promocao: true },
            { id: Date.now() + 2, nome: "Fone Bluetooth", preco: 199.90, estoque: 12, categoria: "Eletrônicos", validade: "", status: "active", promocao: false },
            { id: Date.now() + 3, nome: "Banana", preco: 3.50, estoque: 200, categoria: "Alimentos", validade: "2026-05-20", status: "active", promocao: true },
            { id: Date.now() + 4, nome: "Cadeira Gamer", preco: 850.00, estoque: 8, categoria: "Móveis", validade: "", status: "inactive", promocao: false },
            { id: Date.now() + 5, nome: "Livro JavaScript", preco: 79.90, estoque: 30, categoria: "Livros", validade: "", status: "active", promocao: true },
            { id: Date.now() + 6, nome: "Smartphone X", preco: 1599.00, estoque: 5, categoria: "Eletrônicos", validade: "", status: "active", promocao: false },
            { id: Date.now() + 7, nome: "Camisa Polo", preco: 49.90, estoque: 120, categoria: "Vestuário", validade: "", status: "active", promocao: true },
            { id: Date.now() + 8, nome: "Teclado Mecânico", preco: 299.90, estoque: 15, categoria: "Eletrônicos", validade: "", status: "inactive", promocao: false }
        ];
        salvarProdutosStorage();
    }
}

function salvarProdutosStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos));
}

function gerarId() {
    return Date.now();
}

function getProdutosOrdenados() {
    const copia = [...produtos];
    const { column, direction } = sortConfig;
    if (!column) return copia;

    copia.sort((a, b) => {
        let valorA = a[column];
        let valorB = b[column];

        switch (column) {
            case 'preco':
            case 'estoque':
                valorA = Number(valorA);
                valorB = Number(valorB);
                break;
            case 'validade':
                valorA = valorA ? new Date(valorA) : new Date('9999-12-31');
                valorB = valorB ? new Date(valorB) : new Date('9999-12-31');
                break;
            case 'status':
                valorA = a.status === 'active' ? 'Ativo' : 'Inativo';
                valorB = b.status === 'active' ? 'Ativo' : 'Inativo';
                break;
            case 'promocao':
                valorA = a.promocao ? 1 : 0;
                valorB = b.promocao ? 1 : 0;
                break;
            default:
                valorA = (valorA || '').toString().toLowerCase();
                valorB = (valorB || '').toString().toLowerCase();
                break;
        }

        if (valorA < valorB) return direction === 'asc' ? -1 : 1;
        if (valorA > valorB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
    return copia;
}

function renderizarTabela() {
    const tbody = document.getElementById('tabelaProdutos');
    if (!tbody) return;

    const produtosOrdenados = getProdutosOrdenados();
    const totalProdutos = produtosOrdenados.length;
    const totalPages = Math.ceil(totalProdutos / paginacaoConfig.rowsPerPage);
    
    if (paginacaoConfig.currentPage > totalPages && totalPages > 0) {
        paginacaoConfig.currentPage = totalPages;
    }
    
    const start = (paginacaoConfig.currentPage - 1) * paginacaoConfig.rowsPerPage;
    const end = start + paginacaoConfig.rowsPerPage;
    const produtosPaginados = produtosOrdenados.slice(start, end);

    if (produtosPaginados.length === 0 && totalProdutos === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="md-empty-state">📦 Nenhum produto cadastrado. Utilize o formulário acima para começar.</td></tr>`;
        atualizarPaginacaoUI(0, 0);
        return;
    }

    if (produtosPaginados.length === 0 && totalProdutos > 0) {
        paginacaoConfig.currentPage = totalPages;
        renderizarTabela();
        return;
    }

    tbody.innerHTML = produtosPaginados.map(prod => `
        <tr>
            <td><input type="checkbox" class="md-checkbox-table" data-id="${prod.id}"></td>
            <td>#${prod.id.toString().slice(-6)}</td>
            <td><strong>${escapeHtml(prod.nome)}</strong></td>
            <td>${escapeHtml(prod.categoria || 'Outros')}</td>
            <td>R$ ${prod.preco.toFixed(2)}</td>
            <td>${prod.estoque} un.</td>
            <td>${prod.validade ? formatarData(prod.validade) : '—'}</td>
            <td>
                <span class="md-badge-status ${prod.status === 'active' ? 'md-badge-status--active' : 'md-badge-status--inactive'}">
                    ${prod.status === 'active' ? '🟢 Ativo' : '🔴 Inativo'}
                </span>
            </td>
            <td>${prod.promocao ? '🏷️ Sim' : '❌ Não'}</td>
            <td class="md-action-buttons">
                <button class="md-icon-button md-icon-button--edit" onclick="window.editarProduto(${prod.id})" title="Editar">✏️</button>
                <button class="md-icon-button md-icon-button--delete" onclick="window.confirmarExclusao(${prod.id}, '${escapeHtml(prod.nome)}')" title="Excluir">🗑️</button>
            </td>
        </tr>
    `).join('');

    initSelectAll();
    atualizarIndicadoresOrdenacao();
    atualizarPaginacaoUI(totalProdutos, totalPages);
}

function atualizarPaginacaoUI(totalProdutos, totalPages) {
    const infoSpan = document.getElementById('paginationInfo');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const firstBtn = document.getElementById('firstPageBtn');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const lastBtn = document.getElementById('lastPageBtn');

    if (infoSpan) {
        const start = (paginacaoConfig.currentPage - 1) * paginacaoConfig.rowsPerPage + 1;
        const end = Math.min(start + paginacaoConfig.rowsPerPage - 1, totalProdutos);
        if (totalProdutos === 0) {
            infoSpan.textContent = '0 de 0';
        } else {
            infoSpan.textContent = `${start}-${end} de ${totalProdutos}`;
        }
    }

    if (currentPageSpan) currentPageSpan.textContent = paginacaoConfig.currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages || 1;

    if (firstBtn) firstBtn.disabled = paginacaoConfig.currentPage === 1 || totalProdutos === 0;
    if (prevBtn) prevBtn.disabled = paginacaoConfig.currentPage === 1 || totalProdutos === 0;
    if (nextBtn) nextBtn.disabled = paginacaoConfig.currentPage === totalPages || totalProdutos === 0;
    if (lastBtn) lastBtn.disabled = paginacaoConfig.currentPage === totalPages || totalProdutos === 0;
}

function irParaPagina(page, totalPages) {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    if (page !== paginacaoConfig.currentPage) {
        paginacaoConfig.currentPage = page;
        renderizarTabela();
    }
}

function configurarPaginacao() {
    const rowsPerPageSelect = document.getElementById('rowsPerPage');
    if (rowsPerPageSelect) {
        rowsPerPageSelect.value = paginacaoConfig.rowsPerPage;
        rowsPerPageSelect.addEventListener('change', (e) => {
            paginacaoConfig.rowsPerPage = parseInt(e.target.value);
            paginacaoConfig.currentPage = 1;
            renderizarTabela();
        });
    }

    const firstBtn = document.getElementById('firstPageBtn');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const lastBtn = document.getElementById('lastPageBtn');

    if (firstBtn) firstBtn.addEventListener('click', () => {
        const total = Math.ceil(getProdutosOrdenados().length / paginacaoConfig.rowsPerPage);
        irParaPagina(1, total);
    });
    if (prevBtn) prevBtn.addEventListener('click', () => {
        const total = Math.ceil(getProdutosOrdenados().length / paginacaoConfig.rowsPerPage);
        irParaPagina(paginacaoConfig.currentPage - 1, total);
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        const total = Math.ceil(getProdutosOrdenados().length / paginacaoConfig.rowsPerPage);
        irParaPagina(paginacaoConfig.currentPage + 1, total);
    });
    if (lastBtn) lastBtn.addEventListener('click', () => {
        const total = Math.ceil(getProdutosOrdenados().length / paginacaoConfig.rowsPerPage);
        irParaPagina(total, total);
    });
}

// ========================================
// 5. CONFIGURAÇÃO DE ORDENAÇÃO
// ========================================
function adicionarColunaValidade() {
    const theadRow = document.querySelector('.md-data-table thead tr');
    if (!theadRow) return;

    let ths = Array.from(theadRow.querySelectorAll('th'));
    const existeValidade = ths.some(th => th.textContent.trim() === 'Validade');
    if (!existeValidade) {
        const newTh = document.createElement('th');
        newTh.textContent = 'Validade';
        newTh.setAttribute('data-column', 'validade');
        newTh.style.cursor = 'pointer';
        const statusIndex = ths.findIndex(th => th.textContent.trim() === 'Status');
        if (statusIndex !== -1) {
            theadRow.insertBefore(newTh, ths[statusIndex]);
        } else {
            theadRow.insertBefore(newTh, theadRow.lastElementChild);
        }
    }

    const allThs = document.querySelectorAll('.md-data-table thead th');
    const mapaTextoParaColuna = {
        'id': 'id', 'produto': 'nome', 'categoria': 'categoria',
        'preço': 'preco', 'estoque': 'estoque', 'validade': 'validade',
        'status': 'status', 'promoção': 'promocao'
    };
    allThs.forEach(th => {
        if (!th.getAttribute('data-column')) {
            const texto = th.textContent.trim().toLowerCase();
            const coluna = mapaTextoParaColuna[texto];
            if (coluna) th.setAttribute('data-column', coluna);
        }
    });
}

function configurarOrdenacao() {
    const container = document.querySelector('.md-data-table');
    if (!container) return;

    container.addEventListener('click', (e) => {
        const th = e.target.closest('th');
        if (!th) return;
        const parent = th.parentNode;
        const colunaIndex = Array.from(parent.children).indexOf(th);
        if (colunaIndex === parent.children.length - 1) return;

        let colunaNome = th.getAttribute('data-column');
        if (!colunaNome) return;

        if (sortConfig.column === colunaNome) {
            sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            sortConfig.column = colunaNome;
            sortConfig.direction = 'asc';
        }
        paginacaoConfig.currentPage = 1;
        renderizarTabela();
    });
}

function atualizarIndicadoresOrdenacao() {
    const ths = document.querySelectorAll('.md-data-table thead th');
    ths.forEach(th => {
        const oldArrow = th.querySelector('.sort-arrow');
        if (oldArrow) oldArrow.remove();

        const coluna = th.getAttribute('data-column');
        if (coluna && sortConfig.column === coluna) {
            const arrow = document.createElement('span');
            arrow.className = 'sort-arrow';
            arrow.innerHTML = sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
            th.appendChild(arrow);
        }
    });
}

// ========================================
// 6. CRUD (SALVAR, EDITAR, EXCLUIR)
// ========================================
function salvarProduto() {
    const nome = document.getElementById('prodNome')?.value.trim();
    const preco = parseFloat(document.getElementById('prodPreco')?.value);
    const estoque = parseInt(document.getElementById('prodEstoque')?.value);
    const categoria = document.getElementById('prodCategoria')?.value;
    const validade = document.getElementById('prodValidade')?.value;
    const statusRadio = document.querySelector('input[name="status"]:checked');
    const status = statusRadio ? statusRadio.value : 'active';
    const promocao = document.getElementById('prodPromocao')?.checked || false;

    if (!nome) return mostrarToast('❌ Informe o nome do produto', 'error');
    if (isNaN(preco) || preco < 0) return mostrarToast('❌ Informe um preço válido', 'error');
    if (isNaN(estoque) || estoque < 0) return mostrarToast('❌ Informe a quantidade em estoque', 'error');

    const novoProduto = {
        id: gerarId(), nome, preco, estoque,
        categoria: categoria || 'Outros',
        validade: validade || '',
        status, promocao
    };

    produtos.push(novoProduto);
    salvarProdutosStorage();
    paginacaoConfig.currentPage = 1;
    renderizarTabela();
    limparFormulario();
    mostrarToast('✅ Produto cadastrado com sucesso!', 'success');
}

function editarProduto(id) {
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;

    document.getElementById('prodNome').value = produto.nome;
    document.getElementById('prodPreco').value = produto.preco;
    document.getElementById('prodEstoque').value = produto.estoque;
    document.getElementById('prodCategoria').value = produto.categoria || 'Outros';
    document.getElementById('prodValidade').value = produto.validade || '';
    const radio = document.querySelector(`input[name="status"][value="${produto.status}"]`);
    if (radio) radio.checked = true;
    document.getElementById('prodPromocao').checked = produto.promocao || false;

    produtos = produtos.filter(p => p.id !== id);
    salvarProdutosStorage();

    navegar('cadastrar');
    setTimeout(() => {
        document.querySelector('.md-card')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    mostrarToast('✏️ Edite os campos e clique em Salvar', 'info');
}

function confirmarExclusao(id, nome) {
    deleteId = id;
    const modalProdutoNome = document.getElementById('modalProdutoNome');
    if (modalProdutoNome) modalProdutoNome.textContent = nome;
    const modal = document.getElementById('modalOverlay');
    if (modal) modal.style.display = 'flex';
}

function excluirProdutoConfirmado() {
    if (deleteId !== null) {
        produtos = produtos.filter(p => p.id !== deleteId);
        salvarProdutosStorage();
        const totalPages = Math.ceil(produtos.length / paginacaoConfig.rowsPerPage);
        if (paginacaoConfig.currentPage > totalPages && totalPages > 0) {
            paginacaoConfig.currentPage = totalPages;
        }
        renderizarTabela();
        mostrarToast('🗑️ Produto excluído com sucesso', 'error');
        deleteId = null;
    }
    fecharModal();
}

function fecharModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) modal.style.display = 'none';
    deleteId = null;
}

function limparFormulario() {
    document.getElementById('prodNome').value = '';
    document.getElementById('prodPreco').value = '';
    document.getElementById('prodEstoque').value = '';
    document.getElementById('prodCategoria').value = 'Eletrônicos';
    document.getElementById('prodValidade').value = '';
    const radioAtivo = document.querySelector('input[name="status"][value="active"]');
    if (radioAtivo) radioAtivo.checked = true;
    document.getElementById('prodPromocao').checked = false;
}

function initSelectAll() {
    const selectAll = document.getElementById('selectAllCheckbox');
    if (!selectAll) return;
    const newSelectAll = selectAll.cloneNode(true);
    selectAll.parentNode.replaceChild(newSelectAll, selectAll);
    newSelectAll.addEventListener('change', function () {
        const checkboxes = document.querySelectorAll('#tabelaProdutos .md-checkbox-table');
        checkboxes.forEach(cb => cb.checked = this.checked);
    });
}

// ========================================
// 7. TOAST
// ========================================
function mostrarToast(mensagem, tipo = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensagem;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3000);
}

// ========================================
// 8. UTILITÁRIOS
// ========================================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatarData(dataISO) {
    if (!dataISO) return '—';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

window.editarProduto = editarProduto;
window.confirmarExclusao = confirmarExclusao;