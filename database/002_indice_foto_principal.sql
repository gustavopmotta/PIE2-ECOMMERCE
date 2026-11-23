-- OPCIONAL. Rodar no SQL Editor do Supabase.
-- Garante, no proprio banco, que cada produto tenha no maximo UMA foto principal.
-- O back-end ja respeita essa regra; o indice e uma segunda protecao.
create unique index if not exists uq_fotos_produto_principal
  on fotos_produto (produto_id)
  where principal;
