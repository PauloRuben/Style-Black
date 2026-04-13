# Style Black - E-Commerce Premium

Uma loja virtual elegante com tema preto e prata, desenvolvida com HTML, CSS e JavaScript, integrada ao Supabase para gerenciamento de produtos e pedidos.

![Style Black Preview](https://img.shields.io/badge/Style-Black%20%26%20Silver-black?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2MwYzBjMCIgZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDE1IDIyTDEyIDE4LjI3TDkgMjJMMTAuOTEgMTUuNzRMMTQgOUw2LjkxIDguMjZaIi8+PC9zdmc+)

## ✨ Características

- **Design Premium**: Tema sofisticado em preto e prata
- **Responsivo**: Adaptável a todos os dispositivos
- **Carrinho de Compras**: Gerenciamento completo de itens
- **Painel Administrativo**: Gerenciamento de produtos e pedidos
- **Integração Supabase**: Backend completo com banco de dados
- **Filtros de Produtos**: Por categoria e busca
- **Autenticação**: Login e registro de usuários
- **Checkout Completo**: Com resumo do pedido

## 🚀 Tecnologias

- HTML5 Semântico
- CSS3 com Variáveis e Flexbox/Grid
- JavaScript Vanilla (ES6+)
- Supabase (PostgreSQL + Auth + Realtime)
- Font Awesome (Ícones)
- Google Fonts (Montserrat)

## 📁 Estrutura do Projeto

```
style-black-ecommerce/
├── index.html          # Página principal
├── styles.css          # Estilos completos
├── app.js              # Lógica JavaScript
└── README.md           # Documentação
```

## 🛠️ Configuração do Supabase

### 1. Criar Conta e Projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project" e dê um nome ao projeto
3. Aguarde a criação do projeto

### 2. Obter Credenciais

1. No dashboard do Supabase, vá em **Settings > API**
2. Copie:
   - **URL** (Project URL)
   - **anon/public** key

### 3. Configurar no Projeto

Abra o arquivo `app.js` e substitua as constantes no início do arquivo:

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_KEY = 'sua-chave-anon-publica';
```

### 4. Criar Tabelas

No SQL Editor do Supabase, execute:

```sql
-- Tabela de Produtos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Pedidos
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_zip TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Itens do Pedido
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Políticas de Segurança (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos
CREATE POLICY "Allow public read" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON order_items FOR SELECT USING (true);

-- Permitir escrita para usuários autenticados
CREATE POLICY "Allow authenticated insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON products FOR DELETE USING (true);
```

### 5. Configurar Autenticação

1. Vá em **Authentication > Settings**
2. Em "Email Auth", deixe habilitado
3. Opcional: Configure confirmação de e-mail se desejar

## 🚀 Como Usar

### Executar Localmente

1. Clone ou baixe o projeto
2. Configure o Supabase conforme instruções acima
3. Abra o arquivo `index.html` em um navegador moderno

Ou use um servidor local:

```bash
# Com Python
python -m http.server 8000

# Com Node.js
npx serve .

# Com VS Code
# Instale a extensão "Live Server" e clique em "Go Live"
```

### Funcionalidades

#### Loja (Pública)
- Visualizar produtos por categoria
- Buscar produtos
- Adicionar ao carrinho
- Finalizar compra
- Criar conta / Login

#### Painel Administrativo
- **Acesso**: Clique no ícone ⚙️ (engrenagem) no header
- **Gerenciar Produtos**:
  - Adicionar novos produtos
  - Editar produtos existentes
  - Excluir produtos
  - Ver estoque
- **Gerenciar Pedidos**:
  - Visualizar todos os pedidos
  - Atualizar status (Pendente, Processando, Enviado, Entregue, Cancelado)
  - Ver detalhes do cliente

### Modo Demonstração

Se não configurar o Supabase, o site funciona em modo de demonstração com:
- 8 produtos de exemplo
- Carrinho funcional (salvo no localStorage)
- Simulação de pedidos

## 📱 Responsividade

O site é totalmente responsivo e se adapta a:
- Desktop (> 1200px)
- Tablets (768px - 1200px)
- Mobile (< 768px)
- Mobile pequeno (< 480px)

## 🎨 Paleta de Cores

| Cor | Código | Uso |
|-----|--------|-----|
| Preto Profundo | `#0a0a0a` | Background principal |
| Preto Claro | `#1a1a1a` | Cards, seções |
| Prata | `#c0c0c0` | Textos secundários |
| Prata Claro | `#e8e8e8` | Textos principais |
| Prata Escuro | `#a0a0a0` | Textos terciários |

## 🔧 Personalização

### Adicionar mais categorias

No arquivo `index.html`, localize a seção de categorias e adicione:

```html
<div class="category-card" data-category="nova-categoria">
    <div class="category-image">
        <i class="fas fa-icone"></i>
    </div>
    <h3>Nova Categoria</h3>
</div>
```

No `app.js`, adicione no objeto `getCategoryName`:

```javascript
'nova-categoria': 'Nova Categoria'
```

### Alterar cores

No arquivo `styles.css`, modifique as variáveis CSS em `:root`:

```css
:root {
    --color-black: #0a0a0a;
    --color-silver: #c0c0c0;
    /* ... */
}
```

## 📝 Licença

Projeto livre para uso e modificação.

## 🤝 Contribuição

Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Contribuir com código

---

**Desenvolvido com ❤️ para Style Black**
