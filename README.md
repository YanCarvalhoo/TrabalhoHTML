# 📘 README + DICIONÁRIO COMPLETO DO PROJETO

---

# 📖 1. VISÃO GERAL

Sistema web com:

* Login / Cadastro / Recuperação
* CRUD de produtos
* Navegação SPA (sem recarregar página)
* Armazenamento local (localStorage/sessionStorage)

---

# 🧱 2. ESTRUTURA DO PROJETO

```
📁 projeto/
 ├── 📁 Login/
 │   ├── index.html
 │   ├── main.html
 │   ├── login.js
 │   └── style.css
 │
 ├── 📁 Index/
 │   ├── index.html
 │   ├── header.html
 │   ├── main.html
 │   ├── footer.html
 │   ├── app.js
 │   └── style.css
 │
 └── README.md
```

---

# 🎨 3. DICIONÁRIO CSS (PROPRIEDADES USADAS)

### 📌 Layout e Posicionamento

* `position` → define o tipo de posicionamento (relative, absolute, fixed, sticky)
* `top / left / right / bottom` → posiciona o elemento
* `z-index` → controla qual elemento fica por cima
* `display` → define como o elemento se comporta (flex, grid, block)
* `flex-direction` → direção do flex (row ou column)
* `justify-content` → alinhamento horizontal
* `align-items` → alinhamento vertical
* `gap` → espaçamento entre elementos

### 📌 Espaçamento

* `margin` → espaço externo
* `padding` → espaço interno

### 📌 Tamanho

* `width` → largura
* `height` → altura
* `min-height` → altura mínima
* `max-width` → largura máxima

### 📌 Cores e Fundo

* `background` → define fundo (cor, imagem ou gradiente)
* `background-image` → imagem de fundo
* `background-size` → tamanho do fundo
* `background-position` → posição da imagem
* `color` → cor do texto
* `opacity` → transparência

### 📌 Bordas e Estilo

* `border` → borda do elemento
* `border-radius` → arredondamento
* `box-shadow` → sombra

### 📌 Texto

* `font-size` → tamanho da fonte
* `font-weight` → peso da fonte
* `letter-spacing` → espaçamento entre letras
* `text-transform` → maiúsculo/minúsculo
* `text-decoration` → sublinhado etc

### 📌 Efeitos

* `transition` → animação suave
* `transform` → mover, escalar, rotacionar

### 📌 Outros importantes

* `overflow` → controla conteúdo que ultrapassa
* `cursor` → tipo do cursor
* `outline` → contorno (focus)

---

# ⚙️ 4. DICIONÁRIO JAVASCRIPT (USADO NO PROJETO)

### 📌 DOM

* `document.getElementById()` → seleciona elemento pelo id
* `document.querySelector()` → seleciona primeiro elemento
* `document.querySelectorAll()` → seleciona vários elementos

### 📌 Eventos

* `addEventListener()` → escuta eventos (click, input, etc)
* `event.preventDefault()` → impede comportamento padrão

### 📌 Classes CSS

* `classList.add()` → adiciona classe
* `classList.remove()` → remove classe

### 📌 Manipulação de conteúdo

* `innerHTML` → insere HTML
* `textContent` → insere texto

### 📌 Fetch (carregar HTML)

* `fetch()` → busca arquivos
* `.then()` → trata resposta

### 📌 Armazenamento

* `localStorage.setItem()` → salva dados

* `localStorage.getItem()` → lê dados

* `localStorage.removeItem()` → remove dados

* `sessionStorage.setItem()` → salva sessão

### 📌 Arrays

* `.push()` → adiciona item
* `.find()` → encontra item
* `.some()` → verifica existência
* `.filter()` → remove item

### 📌 Validação

* `if` → condição
* `isNaN()` → verifica número inválido
* `trim()` → remove espaços

### 📌 Tempo

* `setTimeout()` → executa depois de um tempo

### 📌 Funções úteis

* `Date.now()` → gera ID único
* `JSON.stringify()` → transforma em texto
* `JSON.parse()` → transforma em objeto

### 📌 Segurança

* `replace()` → usado para evitar XSS (escape HTML)

---

# 🔄 5. FLUXO DO SISTEMA

### LOGIN

1. Usuário digita dados
2. JS valida campos
3. Verifica no localStorage
4. Salva sessão
5. Redireciona

### CRUD

1. Criar produto
2. Salvar no localStorage
3. Renderizar tabela
4. Editar / Excluir

---
