-- =============================================
-- EstoqueJá — Schema do banco de dados
-- Cole isso no SQL Editor do Supabase
-- =============================================

-- Tabela de produtos
create table if not exists produtos (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  nome         text not null,
  categoria    text not null default 'Outros',
  quantidade   integer not null default 0 check (quantidade >= 0),
  qtd_minima   integer not null default 5 check (qtd_minima >= 0),
  preco_custo  numeric(10,2) not null default 0,
  preco_venda  numeric(10,2) not null default 0,
  codigo_barras text,
  ativo        boolean not null default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Tabela de movimentações
create table if not exists movimentacoes (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  produto_id  uuid references produtos(id) on delete cascade not null,
  tipo        text not null check (tipo in ('entrada', 'saida')),
  quantidade  integer not null check (quantidade > 0),
  motivo      text,
  created_at  timestamptz default now()
);

-- Tabela de perfis (nome do negócio, etc.)
create table if not exists perfis (
  id             uuid references auth.users(id) on delete cascade primary key,
  nome_negocio   text not null default 'Meu Mercado',
  created_at     timestamptz default now()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

alter table produtos      enable row level security;
alter table movimentacoes enable row level security;
alter table perfis        enable row level security;

-- Produtos: cada usuário vê e gerencia apenas os seus
create policy "produtos_own" on produtos
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Movimentações: idem
create policy "movimentacoes_own" on movimentacoes
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Perfis: idem
create policy "perfis_own" on perfis
  for all using (auth.uid() = id)
  with check (auth.uid() = id);

-- =============================================
-- Função: atualiza updated_at automaticamente
-- =============================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger produtos_updated_at
  before update on produtos
  for each row execute function set_updated_at();

-- =============================================
-- Função: cria perfil automático no cadastro
-- =============================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.perfis (id, nome_negocio)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome_negocio', 'Meu Mercado'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================
-- Dados de exemplo (opcional — remova se quiser)
-- =============================================
-- Esses dados só ficam visíveis após login pois o RLS
-- exige user_id. Para inserir exemplos, faça pelo app.
