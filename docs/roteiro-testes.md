# Roteiro de testes do back-end

Cada linha é um cenário. Execute com o Postman, Insomnia ou PowerShell, anote o resultado na coluna **Obtido** (✔ ou ✘, com observação se precisar) e guarde este arquivo para mostrar ao professor.

**Antes de começar:** API rodando (`npm run dev`), o `/saude` mostrando `"banco": "conectado"`, um administrador criado (`npm run criar-admin`), um cliente cadastrado, e pelo menos 2 produtos visíveis no catálogo.

Os tokens do admin e do cliente vêm do `POST /login`.

## 1. Cadastro e login

| # | Cenário | Como testar | Resultado esperado | Obtido |
| --- | --- | --- | --- | --- |
| 1.1 | Cadastrar cliente | `POST /usuarios` com nome, e-mail, senha e telefone | `201`, usuário com `perfil: cliente`, sem senha | |
| 1.2 | Cadastrar com dados inválidos | `POST /usuarios` com e-mail inválido e senha curta | `400` com a lista em `detalhes` | |
| 1.3 | E-mail repetido | Repetir o cadastro 1.1 | `409` | |
| 1.4 | Cliente faz login | `POST /login` | `200` com `token` e `perfil: cliente` | |
| 1.5 | Admin faz login | `POST /login` com o admin | `200` com `token` e `perfil: admin` | |
| 1.6 | Senha errada | `POST /login` com senha incorreta | `401` | |
| 1.7 | Rota protegida sem token | `GET /me` sem cabeçalho | `401` | |

## 2. Produtos

| # | Cenário | Como testar | Resultado esperado | Obtido |
| --- | --- | --- | --- | --- |
| 2.1 | Catálogo público | `GET /produtos` sem login | `200`, só produtos visíveis, sem o saldo exato | |
| 2.2 | Detalhe do produto | `GET /produtos/:id` | `200` com `fotos` | |
| 2.3 | Cadastrar produto com estoque inicial | `POST /admin/produtos` (admin) com `estoque_inicial: 10` | `201` e `quantidade_estoque: 10` | |
| 2.4 | Editar produto | `PUT /admin/produtos/:id` | `200` com os novos dados, saldo inalterado | |
| 2.5 | Ocultar produto | `PATCH /admin/produtos/:id/oculto` com `true` | `200`; o produto some do `GET /produtos` | |
| 2.6 | Produto oculto no detalhe público | `GET /produtos/:id` do produto oculto | `404` | |
| 2.7 | Excluir produto com histórico | `DELETE /admin/produtos/:id` do produto de 2.3 | `409` pedindo para ocultar | |
| 2.8 | Cliente tenta usar o painel | `GET /admin/produtos` com token de cliente | `403` | |

## 3. Estoque

| # | Cenário | Como testar | Resultado esperado | Obtido |
| --- | --- | --- | --- | --- |
| 3.1 | Entrada manual | `POST /admin/estoque/movimentacoes` com `tipo: entrada`, `quantidade: 20` e motivo | `201`; saldo aumenta em 20 | |
| 3.2 | Ajuste negativo | Mesmo endpoint com `tipo: ajuste`, `quantidade: -2` e motivo | `201`; saldo diminui em 2 | |
| 3.3 | Sem motivo | Mesmo endpoint sem `motivo` | `400` | |
| 3.4 | Estoque nunca negativo | `ajuste` de valor maior que o saldo | `409`; o saldo não muda | |
| 3.5 | Histórico | `GET /admin/estoque/movimentacoes?produto_id=:id` | Lista as movimentações dos testes 3.1 e 3.2, com o motivo e o nome do admin | |

## 4. Pedidos

| # | Cenário | Como testar | Resultado esperado | Obtido |
| --- | --- | --- | --- | --- |
| 4.1 | Criar pedido | `POST /pedidos` (cliente) com 2 itens | `201`, `status: pendente`, total calculado pelo servidor | |
| 4.2 | Estoque não muda ao criar | Conferir o saldo dos produtos depois de 4.1 | Saldos iguais aos de antes | |
| 4.3 | Quantidade maior que o estoque | `POST /pedidos` com mais unidades do que o saldo | `409`, com a mensagem em `detalhes`; nenhum pedido criado | |
| 4.4 | Produto oculto no pedido | `POST /pedidos` com um produto oculto | `409` | |
| 4.5 | Pedido sem login | `POST /pedidos` sem token | `401` | |
| 4.6 | Admin tenta fazer pedido | `POST /pedidos` com token de admin | `403` | |
| 4.7 | Meus pedidos | `GET /pedidos/meus` (cliente) | Lista só os pedidos dele | |
| 4.8 | Pedido de outra pessoa | `GET /pedidos/:id` com o token de outro cliente | `404` | |
| 4.9 | Admin lista e filtra | `GET /admin/pedidos` e `GET /admin/pedidos?status=pendente` | Lista com nome, e-mail e telefone do cliente | |

## 5. Confirmação, cancelamento e estoque

| # | Cenário | Como testar | Resultado esperado | Obtido |
| --- | --- | --- | --- | --- |
| 5.1 | Confirmar pagamento | `PATCH /admin/pedidos/:id/status` com `pago` (pedido de 4.1) | `200`; o saldo de cada produto diminui da quantidade pedida | |
| 5.2 | Baixa registrada | `GET /admin/estoque/movimentacoes` | Movimentações `baixa` (negativas) com `pedido_id` | |
| 5.3 | Pagar duas vezes | Repetir 5.1 no mesmo pedido | `409`; o estoque não diminui de novo | |
| 5.4 | Pular etapa | Mudar um pedido `pendente` direto para `enviado` | `409` com os próximos status permitidos | |
| 5.5 | Pagamento sem saldo suficiente | Criar um pedido, reduzir o estoque por ajuste (3.2), depois marcar `pago` | `409` com o produto que falta; o pedido continua `pendente` | |
| 5.6 | Avançar o pedido | `pago` → `em_preparo` → `enviado` → `entregue` | `200` em cada passo; o estoque não muda | |
| 5.7 | Cancelar pedido pago | Cancelar um pedido `pago` | `200`; o saldo volta ao valor anterior | |
| 5.8 | Devolução registrada | `GET /admin/estoque/movimentacoes` | Movimentações `devolucao` (positivas) | |
| 5.9 | Cancelar pedido pendente | Cancelar um pedido `pendente` | `200`; o estoque não muda | |
| 5.10 | Pedido encerrado | Tentar mudar um pedido `entregue` ou `cancelado` | `409` | |

## Critérios de aceitação do MVP

| Critério | Cenários que comprovam |
| --- | --- |
| Cliente visualiza o catálogo e os detalhes dos produtos | 2.1, 2.2 |
| Carrinho permite adicionar, remover e alterar produtos | Feito no front-end; a API recebe o resultado em 4.1 |
| Cliente e administrador fazem login | 1.4, 1.5 |
| Administrador cadastra, edita e remove produtos | 2.3, 2.4, 2.5, 2.7 |
| Estoque atualizado corretamente, sem valores negativos | 3.1, 3.2, 3.4, 5.1, 5.5, 5.7 |
| Administrador visualiza e gerencia pedidos | 4.9, 5.1, 5.6, 5.7 |
| Catálogo acessível por link público | 2.1 |
| Sistema funciona adequadamente | O fluxo completo de 4.1 a 5.6 sem erros |

## Registro

- Data dos testes: ____ / ____ / ________
- Quem executou: ______________________
- Observações e defeitos encontrados: ______________________________________
