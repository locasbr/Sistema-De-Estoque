# EstoqueJá 📦

Sistema de controle de estoque para pequenos mercados.
Construído com **Next.js 14**, **Supabase** e **Tailwind CSS**.

## Funcionalidades

- ✅ Autenticação completa (cadastro + login com e-mail)
- ✅ Cadastro de produtos com categorias, preços e estoque mínimo
- ✅ Registro de entradas e saídas com histórico
- ✅ Alertas automáticos de estoque baixo e esgotado
- ✅ Dashboard com métricas em tempo real
- ✅ Multi-tenant (cada usuário vê apenas seus dados)
- ✅ RLS (Row Level Security) no banco — dados 100% isolados

---

## Deploy gratuito em 15 minutos

### 1. Banco de dados (Supabase — grátis)

1. Acesse **[supabase.com](https://supabase.com)** e crie uma conta
2. Clique em **New Project** → dê um nome e senha
3. Vá em **SQL Editor** → clique em **New query**
4. Cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**
5. Vá em **Settings → API** e copie:
   - `Project URL` → será seu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → será seu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com os valores copiados do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Instalar e rodar localmente

```bash
npm install
npm run dev
```

Acesse: **http://localhost:3000**

### 4. Deploy na Vercel (grátis)

1. Crie conta em **[vercel.com](https://vercel.com)**
2. Clique em **New Project** → importe este repositório do GitHub
3. Em **Environment Variables**, adicione as mesmas variáveis do `.env.local`
4. Clique em **Deploy** — pronto!

Seu app estará em: `https://estoqueja-SEUNOME.vercel.app`

---

## Estrutura do projeto

```
src/
├── app/
│   ├── login/              # Página de login e cadastro
│   ├── (dashboard)/        # Grupo de rotas protegidas
│   │   ├── layout.js       # Layout com sidebar
│   │   ├── page.js         # Dashboard principal
│   │   ├── produtos/       # CRUD de produtos
│   │   ├── movimentacoes/  # Entradas e saídas
│   │   └── alertas/        # Alertas de estoque
│   └── api/auth/callback/  # Callback do Supabase Auth
├── components/
│   ├── Sidebar.js          # Menu lateral
│   ├── ProdutosClient.js   # CRUD interativo
│   └── MovimentacoesClient.js
├── lib/supabase/
│   ├── client.js           # Cliente browser
│   └── server.js           # Cliente server-side
└── middleware.js            # Proteção de rotas
supabase/
└── schema.sql              # Criação das tabelas + RLS
```

---

## Próximas funcionalidades (roadmap)

- [ ] Leitor de código de barras (câmera do celular)
- [ ] Exportação de relatório em PDF
- [ ] Múltiplos usuários por negócio
- [ ] Controle de validade de produtos
- [ ] Histórico de preços de fornecedores
- [ ] Integração com WhatsApp para alertas

---

## Stack

| Camada | Tecnologia | Custo |
|---|---|---|
| Frontend + Backend | Next.js 14 (App Router) | Grátis |
| Banco de dados | Supabase (PostgreSQL) | Grátis até 500MB |
| Autenticação | Supabase Auth | Grátis até 50k usuários |
| Hospedagem | Vercel | Grátis |
| Domínio próprio | Registro.br | ~R$ 40/ano |

**Custo total para começar: R$ 0**
