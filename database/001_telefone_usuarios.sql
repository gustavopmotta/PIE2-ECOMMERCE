-- Rodar UMA vez no Supabase (SQL Editor), depois do schema.sql.
-- O cliente informa o telefone no cadastro, para a loja entrar em contato sobre o pedido.
-- A coluna aceita vazio porque o administrador nao precisa de telefone;
-- a obrigatoriedade para clientes e validada no back-end.
alter table usuarios add column if not exists telefone text;
