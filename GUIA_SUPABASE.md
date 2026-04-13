# Guia Completo: Configurando Supabase para Style Black

## 📋 Índice
1. [Criar Conta](#1-criar-conta-no-supabase)
2. [Criar Projeto](#2-criar-novo-projeto)
3. [Obter Credenciais](#3-obter-credenciais)
4. [Criar Tabelas](#4-criar-tabelas-no-sql-editor)
5. [Configurar Storage](#5-configurar-storage-para-imagens)
6. [Configurar Autenticação](#6-configurar-autenticação)
7. [Atualizar o Projeto](#7-atualizar-o-projeto)
8. [Testar](#8-testar-a-configuração)

---

## 1. Criar Conta no Supabase

### Passo 1.1 - Acesse o site
```
https://supabase.com
```

### Passo 1.2 - Cadastro
- Clique em **"Start your project"** ou **"Sign In"**
- Você pode usar:
  - ✅ GitHub (recomendado)
  - ✅ Email e senha
  - ✅ Google

![Sign Up](https://i.imgur.com/placeholder1.png)

---

## 2. Criar Novo Projeto

### Passo 2.1 - Dashboard
Após fazer login, clique em **"New Project"**

### Passo 2.2 - Configurar Projeto
Preencha os campos:

| Campo | Valor Sugerido |
|-------|----------------|
| **Organization** | Sua organização ou pessoal |
| **Project Name** | `style-black` |
| **Database Password** | Gere uma senha forte (guarde ela!) |
| **Region** | `East US (N. Virginia)` (mais próximo do Brasil) |

### Passo 2.3 - Aguarde
- A criação leva **2-3 minutos**
- Você verá uma tela de "Getting your project ready"

---

## 3. Obter Credenciais

### Passo 3.1 - Project Settings
1. No menu lateral esquerdo, clique em ⚙️ **"Project Settings"**

### Passo 3.2 - API Settings
1. Clique em **"API"** no submenu
2. Localize estas informações:

```
📍 Project API Keys
├─ URL: https://xxxxxxxxxxxx.supabase.co
└─ anon public: eyJhbGciOiJIUzI1NiIs...
```

### Passo 3.3 - Copiar Credenciais
Copie estas duas informações:

1. **Project URL** (começa com `https://` e termina com `.supabase.co`)
2. **anon public** (é uma longa string começando com `eyJ`)

> ⚠️ **IMPORTANTE**: Guarde essas informações em um lugar seguro!

---

## 4. Criar Tabelas no SQL Editor

### Passo 4.1 - Abrir SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 4.2 - Criar Tabelas
1. Copie TODO o conteúdo do arquivo `supabase-setup.sql`
2. Cole no editor SQL
3. Clique em **"Run"** (botão verde no canto inferior direito)

![SQL Editor](https://i.imgur.com/placeholder2.png)

### Passo 4.3 - Verificar
Você deve ver mensagens de sucesso:
- `Success. no rows returned`
- Várias confirmações de criação de políticas

### Passo 4.4 - Verificar Tabelas
1. No menu lateral, clique em **"Database"**
2. Depois em **"Tables"**
3. Você deve ver estas tabelas criadas:
   - ✅ `products`
   - ✅ `customers`
   - ✅ `orders`
   - ✅ `order_items`
   - ✅ `carts`
   - ✅ `cart_items`

---

## 5. Configurar Storage (Imagens)

### Passo 5.1 - Criar Bucket
1. No menu lateral, clique em **"Storage"**
2. Clique em **"New bucket"**
3. Preencha:
   - **Name**: `product-images`
   - ✅ Marque **"Public bucket"**
4. Clique em **"Create bucket"**

### Passo 5.2 - Configurar Políticas
1. Clique no bucket `product-images` criado
2. Clique em **"Policies"** (aba no topo)
3. Clique em **"New policy"**

#### Política 1 - SELECT (Visualizar)
```
Policy name: Public can view images
Allowed operation: SELECT
Target roles: anon, authenticated
Policy definition: true
```

#### Política 2 - INSERT (Upload)
```
Policy name: Authenticated can upload
Allowed operation: INSERT
Target roles: authenticated
Policy definition: true
```

#### Política 3 - DELETE (Excluir)
```
Policy name: Authenticated can delete
Allowed operation: DELETE
Target roles: authenticated
Policy definition: true
```

---

## 6. Configurar Autenticação

### Passo 6.1 - Auth Settings
1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Providers"** (se quiser login com Google/GitHub)
3. Ou vá direto em **"Settings"** para configurações de email

### Passo 6.2 - Configurar Email
Na aba **"Email"**:

```
✅ Enable Email confirmations (opcional)
   - Se marcado: usuário precisa confirmar email
   - Se desmarcado: login imediato

Email templates (opcional):
- Confirm signup: Personalizar mensagem
- Invitation: Personalizar convite
- Magic Link: Login sem senha
- Change Email: Confirmação de troca
- Reset Password: Recuperação de senha
```

### Passo 6.3 - Configurar Provedores Sociais (Opcional)
Para adicionar login com Google/GitHub:

1. Clique em **"Providers"**
2. Habilite **"Google"** ou **"GitHub"**
3. Siga as instruções para obter Client ID e Secret

---

## 7. Atualizar o Projeto

### Passo 7.1 - Abrir app.js
Abra o arquivo `app.js` na pasta do projeto

### Passo 7.2 - Substituir Credenciais
Localize as linhas no início do arquivo:

```javascript
// ANTES:
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_KEY = 'sua-chave-anon-publica';
```

Substitua pelas suas credenciais:

```javascript
// DEPOIS:
const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

> Troque os valores pelos que você copiou no Passo 3!

### Passo 7.3 - Salvar
Salve o arquivo `app.js`

---

## 8. Testar a Configuração

### Passo 8.1 - Abrir o Site
Abra o arquivo `index.html` no navegador:

```bash
# Opção 1: Clique duplo no arquivo
# Opção 2: Use um servidor local:
cd /c/Users/rubqu/style-black-ecommerce
python -m http.server 8000
# Acesse: http://localhost:8000
```

### Passo 8.2 - Verificar Console
Abra o console do navegador (F12 → Console):

```
✅ Esperado:
"Supabase conectado com sucesso!"

❌ Se ver erros:
- Verifique se a URL está correta
- Verifique se a chave está completa
- Verifique sua conexão com internet
```

### Passo 8.3 - Testar Funcionalidades

#### Teste 1 - Carrinho
1. Adicione um produto ao carrinho
2. Verifique se aparece no ícone 🛒
3. Abra o carrinho e confira os itens

#### Teste 2 - Cadastro
1. Clique no ícone 👤 (usuário)
2. Clique em "Criar Conta"
3. Preencha e cadastre-se
4. Verifique no Supabase (Authentication → Users)

#### Teste 3 - Painel Admin
1. Clique em ⚙️ (engrenagem)
2. Você deve ver a lista de produtos
3. Tente adicionar um novo produto
4. Verifique se aparece na lista

#### Teste 4 - Checkout
1. Adicione produtos ao carrinho
2. Clique em "Finalizar Compra"
3. Preencha os dados
4. Confirme o pedido
5. Verifique no Supabase (Database → Orders)

---

## 🛠️ Solução de Problemas

### Erro: "Failed to fetch"
**Causa**: URL incorreta ou projeto pausado

**Solução**:
1. Verifique se a URL está correta
2. No Supabase, vá em Project Settings → General
3. Verifique se o projeto está "Active"

### Erro: "Invalid API key"
**Causa**: Chave API incorreta

**Solução**:
1. Vá em Project Settings → API
2. Copie novamente a chave "anon public"
3. Certifique-se de copiar a chave COMPLETA

### Erro: "new row violates row-level security policy"
**Causa**: Políticas RLS não configuradas

**Solução**:
1. Execute novamente o SQL de configuração
2. Verifique se todas as políticas foram criadas
3. No Supabase, vá em Database → Tables → [tabela] → Policies

### Produtos não aparecem
**Causa**: Tabela vazia ou erro de conexão

**Solução**:
1. Verifique no Supabase (Database → Tables → products)
2. Se estiver vazia, descomente a seção "DADOS INICIAIS" no SQL e execute
3. Verifique o console do navegador por erros

---

## 📊 Estrutura do Banco de Dados

```
supabase
├── auth.users (gerenciado pelo Supabase Auth)
│   └── id, email, encrypted_password, etc.
│
├── public.customers
│   ├── id (UUID)
│   ├── user_id (referência auth.users)
│   ├── full_name, phone, address...
│
├── public.products
│   ├── id (SERIAL)
│   ├── name, category, price
│   ├── stock, description, image
│
├── public.orders
│   ├── id (UUID)
│   ├── order_number (gerado automaticamente)
│   ├── customer_id, customer_name, customer_email
│   ├── shipping_address, shipping_city...
│   ├── payment_method, payment_status
│   ├── total, status
│
├── public.order_items
│   ├── id (SERIAL)
│   ├── order_id (referência orders)
│   ├── product_id, product_name
│   ├── quantity, price, total
│
└── storage.product-images
    └── [arquivos de imagem]
```

---

## 🎨 Dicas Extras

### Como fazer upload de imagens?
1. No painel admin, ao adicionar produto
2. Primeiro faça upload da imagem no Storage
3. Copie a URL pública
4. Cole no campo "URL da Imagem"

Ou use URLs externas:
- Unsplash: `https://images.unsplash.com/...`
- Pexels: `https://images.pexels.com/...`

### Como adicionar mais campos?
1. Vá em Database → Tables → products
2. Clique em "Edit Table"
3. Adicione novas colunas

### Como fazer backup?
1. Project Settings → Database
2. Clique em "Backup"
3. Ou use a função "Daily backups" (plano pago)

### Limites do Plano Gratuito
- ✅ 500MB de banco de dados
- ✅ 1GB de storage
- ✅ 2GB de transferência/mês
- ✅ 50 mil usuários/mês
- ✅ API ilimitada

---

## 📞 Suporte

Se encontrar problemas:

1. **Console do Navegador**: F12 → Console (veja os erros)
2. **Logs do Supabase**: Supabase → Logs → API/Postgres
3. **Documentação**: https://supabase.com/docs
4. **Comunidade**: https://github.com/supabase/supabase/discussions

---

**Pronto!** 🎉 Seu e-commerce Style Black agora está integrado com Supabase!
