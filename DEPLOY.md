# Guia de Deploy — MEI Control

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (gratuito)
- Conta no [Stripe](https://stripe.com) (gratuito para testes)
- Conta na [Vercel](https://vercel.com) (gratuito)

---

## 1. Configurar o Supabase

### 1.1 Criar projeto

1. Acesse https://supabase.com/dashboard → **New Project**
2. Escolha nome, senha do banco e região (preferencialmente São Paulo - `sa-east-1`)
3. Aguarde a criação (≈ 2 min)

### 1.2 Executar o schema SQL

1. No painel do projeto: **SQL Editor** → **New query**
2. Cole o conteúdo de `supabase/schema.sql`
3. Clique em **Run**

### 1.3 Configurar autenticação

1. **Authentication** → **Providers** → ativar **Email**
2. (Opcional) Ativar **Google OAuth**:
   - Crie credenciais no [Google Cloud Console](https://console.cloud.google.com)
   - Adicione o Client ID e Secret no Supabase
   - Adicione a URL de callback do Supabase no Google

### 1.4 Obter as chaves

- **Settings** → **API**
- Copie: `Project URL` e `anon public` key

---

## 2. Configurar o Stripe

### 2.1 Criar produto e preço

1. Acesse https://dashboard.stripe.com (modo **Test** inicialmente)
2. **Products** → **+ Add product**
   - Nome: `Controle MEI - Pro`
   - Descrição: `Notas ilimitadas, previsões e exportações`
3. Em **Pricing**:
   - Tipo: **Recurring**
   - Preço: **14,90 BRL**
   - Intervalo: **Monthly**
4. Salvar e copiar o **Price ID** (começa com `price_`)

### 2.2 Configurar webhooks

1. **Developers** → **Webhooks** → **+ Add endpoint**
2. URL: `https://seusite.vercel.app/api/stripe/webhooks`
3. Eventos a escutar:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copiar o **Webhook signing secret** (`whsec_...`)

### 2.3 Configurar portal do cliente

1. **Settings** → **Billing** → **Customer portal**
2. Ativar e configurar permissões (permitir cancelamento, visualizar faturas)
3. Salvar configurações

### 2.4 Obter as chaves

- **Developers** → **API keys**
- Copie: `Publishable key` e `Secret key`

---

## 3. Configurar variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...   # Settings > API > service_role (NUNCA expor no cliente)

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4. Rodar localmente

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

### Testar webhooks localmente com Stripe CLI

```bash
# Instalar Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login

# Em um terminal separado:
stripe listen --forward-to localhost:3000/api/stripe/webhooks
# Copie o webhook secret exibido e cole em STRIPE_WEBHOOK_SECRET
```

---

## 5. Deploy na Vercel

### 5.1 Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 5.2 Via Dashboard (recomendado)

1. Acesse https://vercel.com/new
2. Conecte seu repositório GitHub
3. Em **Environment Variables**, adicione todas as variáveis do `.env.local`
4. Em `NEXT_PUBLIC_APP_URL`, use a URL da Vercel (ex: `https://meicontrol.vercel.app`)
5. Clique em **Deploy**

### 5.3 Após o deploy

1. Copie a URL da Vercel
2. Atualize no Stripe o endpoint do webhook com a URL real
3. Atualize no Supabase: **Authentication** → **URL Configuration**
   - Site URL: `https://seusite.vercel.app`
   - Redirect URLs: `https://seusite.vercel.app/auth/callback`

---

## 6. Checklist de produção

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Schema SQL executado no Supabase
- [ ] RLS habilitado nas 3 tabelas
- [ ] Webhook Stripe configurado e testado
- [ ] Portal do cliente Stripe configurado
- [ ] URL de callback do Supabase atualizada
- [ ] Domínio personalizado configurado (opcional)
- [ ] Mudar chaves do Stripe de `test` para `live`

---

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/          # Páginas públicas (login, cadastro)
│   │   ├── login/
│   │   └── cadastro/
│   ├── (app)/           # Área autenticada
│   │   ├── dashboard/
│   │   ├── notas/
│   │   ├── assinatura/
│   │   └── configuracoes/
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── checkout/
│   │   │   ├── portal/
│   │   │   └── webhooks/
│   │   └── notas/
│   │       └── export/
│   └── auth/callback/
├── components/
│   ├── layout/          # Navbar, layout
│   ├── ui/              # AlertaBanner, ProGate, etc
│   └── charts/          # Gráficos Recharts
├── lib/
│   ├── supabase/        # Clientes (browser, server, middleware)
│   ├── stripe.ts
│   └── utils.ts
├── types/
│   └── database.ts      # Tipos TypeScript do Supabase
└── middleware.ts         # Proteção de rotas
```
