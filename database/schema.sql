-- =====================================================================
-- Loja de Canecas - esquema do banco (Supabase / PostgreSQL)
-- Como usar: Supabase > SQL Editor > New query > colar tudo > Run
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. USUARIOS (perfil: cliente ou admin)
-- ---------------------------------------------------------------------
create table usuarios (
  id          bigint generated always as identity primary key,
  nome        text not null,
  email       text not null unique,
  senha_hash  text not null,  -- nunca guardar senha pura, so o hash (ex.: bcrypt)
  perfil      text not null default 'cliente'
              check (perfil in ('cliente', 'admin')),
  criado_em   timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 2. PRODUTOS (uma caneca = um saldo de estoque, sem variacoes)
-- ---------------------------------------------------------------------
create table produtos (
  id                  bigint generated always as identity primary key,
  nome                text not null,
  descricao           text,
  preco               numeric(10,2) not null check (preco >= 0),
  categoria           text,
  tema                text,       -- usado nos filtros (RF02)
  material            text,       -- usado nos filtros (RF02)
  quantidade_estoque  integer not null default 0 check (quantidade_estoque >= 0),
  estoque_minimo      integer not null default 0 check (estoque_minimo >= 0),
  oculto              boolean not null default false,  -- true = nao aparece na loja
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);

create index idx_produtos_oculto    on produtos (oculto);
create index idx_produtos_categoria on produtos (categoria);


-- ---------------------------------------------------------------------
-- 3. FOTOS DO PRODUTO (varias fotos por caneca - RF03)
-- ---------------------------------------------------------------------
create table fotos_produto (
  id          bigint generated always as identity primary key,
  produto_id  bigint not null references produtos (id) on delete cascade,
  url         text not null,                 -- link da imagem (ex.: Supabase Storage)
  ordem       integer not null default 0,    -- ordem de exibicao na galeria
  principal   boolean not null default false,
  criado_em   timestamptz not null default now()
);

create index idx_fotos_produto_produto on fotos_produto (produto_id);


-- ---------------------------------------------------------------------
-- 4. PEDIDOS (com status e origem)
-- ---------------------------------------------------------------------
create table pedidos (
  id             bigint generated always as identity primary key,
  usuario_id     bigint references usuarios (id) on delete set null,
                 -- pode ser nulo: pedido de WhatsApp/presencial sem conta
  status         text not null default 'pendente'
                 check (status in ('pendente', 'pago', 'em_preparo',
                                   'enviado', 'entregue', 'cancelado')),
  origem         text not null default 'site'
                 check (origem in ('site', 'whatsapp', 'instagram', 'presencial')),
  total          numeric(10,2) not null default 0 check (total >= 0),
  observacao     text,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

create index idx_pedidos_usuario on pedidos (usuario_id);
create index idx_pedidos_status  on pedidos (status);


-- ---------------------------------------------------------------------
-- 5. ITENS DO PEDIDO
-- ---------------------------------------------------------------------
create table itens_pedido (
  id              bigint generated always as identity primary key,
  pedido_id       bigint not null references pedidos (id) on delete cascade,
  produto_id      bigint not null references produtos (id) on delete restrict,
  quantidade      integer not null check (quantidade > 0),
  preco_unitario  numeric(10,2) not null check (preco_unitario >= 0),
                  -- guarda o preco no momento da compra (o preco do produto pode mudar)
  unique (pedido_id, produto_id)
);

create index idx_itens_pedido_pedido  on itens_pedido (pedido_id);
create index idx_itens_pedido_produto on itens_pedido (produto_id);


-- ---------------------------------------------------------------------
-- 6. MOVIMENTACOES DE ESTOQUE
-- quantidade COM SINAL: entrada/devolucao = positivo, baixa = negativo,
-- ajuste = positivo ou negativo (nunca zero)
-- ---------------------------------------------------------------------
create table movimentacoes_estoque (
  id          bigint generated always as identity primary key,
  produto_id  bigint not null references produtos (id) on delete restrict,
  tipo        text not null
              check (tipo in ('entrada', 'ajuste', 'baixa', 'devolucao')),
  quantidade  integer not null,
  motivo      text,
  pedido_id   bigint references pedidos (id) on delete set null,   -- opcional
  usuario_id  bigint references usuarios (id) on delete set null,  -- quem registrou
  criado_em   timestamptz not null default now(),
  check (
    (tipo in ('entrada', 'devolucao') and quantidade > 0) or
    (tipo = 'baixa'                   and quantidade < 0) or
    (tipo = 'ajuste'                  and quantidade <> 0)
  )
);

create index idx_mov_estoque_produto on movimentacoes_estoque (produto_id);


-- ---------------------------------------------------------------------
-- 7. TRIGGERS
-- ---------------------------------------------------------------------

-- 7.1 Atualiza "atualizado_em" sempre que a linha for alterada
create function set_atualizado_em() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger trg_produtos_atualizado_em
before update on produtos
for each row execute function set_atualizado_em();

create trigger trg_pedidos_atualizado_em
before update on pedidos
for each row execute function set_atualizado_em();

-- 7.2 Cada movimentacao ajusta o saldo do produto automaticamente.
-- Se a baixa deixaria o estoque negativo, o CHECK de produtos barra
-- e a movimentacao inteira e desfeita (evita vender o que nao tem).
create function aplicar_movimentacao_estoque() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.produtos
     set quantidade_estoque = quantidade_estoque + new.quantidade
   where id = new.produto_id;
  return new;
end;
$$;

create trigger trg_movimentacao_atualiza_estoque
after insert on movimentacoes_estoque
for each row execute function aplicar_movimentacao_estoque();


-- ---------------------------------------------------------------------
-- 8. SEGURANCA (RLS)
-- O Supabase expoe as tabelas por API publica. Com RLS ligado e sem
-- policies, so o back-end (chave service_role) consegue acessar.
-- Se for liberar leitura direta pelo front, crie policies depois.
-- ---------------------------------------------------------------------
alter table usuarios              enable row level security;
alter table produtos              enable row level security;
alter table fotos_produto         enable row level security;
alter table pedidos               enable row level security;
alter table itens_pedido          enable row level security;
alter table movimentacoes_estoque enable row level security;


-- ---------------------------------------------------------------------
-- 9. DADOS DE EXEMPLO (opcional - pode apagar esta parte)
-- ---------------------------------------------------------------------
insert into produtos (nome, descricao, preco, categoria, tema, material, quantidade_estoque, estoque_minimo)
values
  ('Caneca Café da Manhã', 'Caneca de cerâmica 325 ml', 39.90, 'Cerâmica', 'Café', 'Cerâmica', 20, 5),
  ('Caneca Gamer',         'Caneca de porcelana 350 ml', 49.90, 'Porcelana', 'Games', 'Porcelana', 15, 3),
  ('Caneca Térmica Pet',   'Caneca térmica 450 ml',      69.90, 'Térmica', 'Pets', 'Aço inox', 8, 2);
