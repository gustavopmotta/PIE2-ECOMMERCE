# Contrato da API (etapas 1 e 2: login e produtos)

Este arquivo é para o colega do front-end. Ele cresce a cada etapa.

- **URL base (desenvolvimento):** `http://localhost:3000`
- **Formato:** todas as requisições e respostas usam JSON (`Content-Type: application/json`).
- **Rotas protegidas:** enviar o token do login no cabeçalho `Authorization: Bearer <token>`.
- **Formato de erro:** `{ "erro": "mensagem" }`. Quando há vários problemas, vem também `"detalhes": ["...", "..."]`.

## GET /saude

Confere se a API está no ar e se o banco responde. Não precisa de login.

Resposta `200`:

```json
{ "status": "ok", "banco": "conectado", "agora": "2026-11-19T12:00:00.000Z" }
```

Resposta `503` quando o banco não responde: `{ "status": "erro", "banco": "sem conexão" }`.

## POST /usuarios

Cadastro de cliente. Não precisa de login. O perfil criado é sempre `cliente`.

Corpo:

```json
{
  "nome": "Maria Souza",
  "email": "maria@email.com",
  "senha": "minimo6caracteres",
  "telefone": "(71) 99999-8888"
}
```

Regras: nome de 2 a 100 caracteres, e-mail válido, senha de 6 a 72 caracteres, telefone com DDD (10 a 13 dígitos). O telefone é guardado só com números.

Resposta `201`:

```json
{
  "usuario": {
    "id": 1,
    "nome": "Maria Souza",
    "email": "maria@email.com",
    "telefone": "71999998888",
    "perfil": "cliente"
  }
}
```

Erros: `400` (dados inválidos, com `detalhes`) e `409` (e-mail já cadastrado).

## POST /login

Login de cliente ou administrador (a mesma tela serve para os dois).

Corpo:

```json
{ "email": "maria@email.com", "senha": "minimo6caracteres" }
```

Resposta `200`:

```json
{
  "token": "eyJhbGciOi...",
  "usuario": {
    "id": 1,
    "nome": "Maria Souza",
    "email": "maria@email.com",
    "telefone": "71999998888",
    "perfil": "cliente"
  }
}
```

O front guarda o `token` e usa o campo `perfil` para decidir para onde levar a pessoa: `cliente` vai para o catálogo e `admin` vai para o painel. O token expira em 8 horas.

Erros: `400` (faltou e-mail ou senha) e `401` (e-mail ou senha inválidos).

## GET /me

Devolve o usuário do token. Útil para o front conferir se a sessão ainda vale. Exige login.

Resposta `200`: `{ "usuario": { "id": 1, "nome": "...", "email": "...", "telefone": "...", "perfil": "cliente" } }`

Erros: `401` (token ausente, inválido ou expirado).

## Produtos: catálogo público (sem login)

Os campos dos produtos usam `snake_case`, como no banco. O catálogo público **não mostra a quantidade em estoque**, só se a caneca está disponível. Produtos ocultos não aparecem aqui.

### GET /produtos

Lista os produtos visíveis, em ordem alfabética.

Resposta `200`:

```json
{
  "produtos": [
    {
      "id": 1,
      "nome": "Caneca Café da Manhã",
      "descricao": "Caneca de cerâmica 325 ml",
      "preco": 39.9,
      "categoria": "Cerâmica",
      "tema": "Café",
      "material": "Cerâmica",
      "disponivel": true,
      "foto_principal": "https://.../caneca.png"
    }
  ]
}
```

`foto_principal` é `null` quando o produto ainda não tem foto.

### GET /produtos/:id

Detalhe de um produto, com todas as fotos (a principal vem primeiro).

Resposta `200`:

```json
{
  "produto": {
    "id": 1,
    "nome": "Caneca Café da Manhã",
    "descricao": "Caneca de cerâmica 325 ml",
    "preco": 39.9,
    "categoria": "Cerâmica",
    "tema": "Café",
    "material": "Cerâmica",
    "disponivel": true,
    "fotos": [
      { "id": 10, "url": "https://.../a.png", "ordem": 0, "principal": true }
    ]
  }
}
```

Erros: `400` (id inválido) e `404` (não existe ou está oculto).

## Produtos: painel do administrador

Todas as rotas abaixo exigem login com perfil `admin` (cabeçalho `Authorization: Bearer <token>`). Cliente recebe `403`, e sem token recebe `401`.

Aqui o produto vem completo, com `quantidade_estoque`, `estoque_minimo`, `oculto`, `criado_em` e `atualizado_em`.

### GET /admin/produtos

Lista todos os produtos, inclusive os ocultos, do mais novo para o mais antigo. Resposta `200`: `{ "produtos": [ ... ] }`, cada um com `foto_principal`.

### GET /admin/produtos/:id

Um produto completo, com a lista de `fotos`. Resposta `200`: `{ "produto": { ... } }`. Erro `404` se não existir.

### POST /admin/produtos

Cadastra um produto.

```json
{
  "nome": "Caneca Gamer",
  "descricao": "Caneca de porcelana 350 ml",
  "preco": 49.9,
  "categoria": "Porcelana",
  "tema": "Games",
  "material": "Porcelana",
  "estoque_minimo": 3,
  "estoque_inicial": 15
}
```

- Obrigatórios: `nome` (2 a 150 caracteres) e `preco` (aceita `49.9`, `"49.90"` ou `"49,90"`).
- Opcionais: `descricao`, `categoria`, `tema`, `material`, `estoque_minimo` (padrão 0) e `estoque_inicial` (padrão 0).
- `estoque_inicial` vira uma movimentação de **entrada** com o motivo "Estoque inicial", e o saldo do produto já nasce com esse valor.

Resposta `201`: `{ "produto": { ... } }`. Erro `400` com `detalhes` se algum dado for inválido.

### PUT /admin/produtos/:id

Edita os dados do produto. Os campos são os mesmos do cadastro, **sem** `estoque_inicial`, e `nome` e `preco` continuam obrigatórios. Para limpar um campo opcional, envie `null` ou vazio.

O saldo de estoque **não** muda por aqui: ele só muda por movimentações (entrada, ajuste, baixa e devolução, na próxima etapa).

Resposta `200`: `{ "produto": { ... } }`. Erros: `400` e `404`.

### PATCH /admin/produtos/:id/oculto

Oculta ou mostra um produto no catálogo.

```json
{ "oculto": true }
```

Resposta `200`: `{ "produto": { ... } }`. O valor precisa ser `true` ou `false` (booleano, sem aspas).

### DELETE /admin/produtos/:id

Exclui o produto. Resposta `204` (sem corpo).

Um produto que já tem pedidos ou movimentações de estoque **não pode ser excluído** (inclusive os cadastrados com `estoque_inicial`, porque a entrada inicial é uma movimentação). Nesse caso a resposta é `409` com a mensagem pedindo para ocultar. O front deve sugerir "Ocultar" quando isso acontecer.

### POST /admin/produtos/:id/fotos

Registra uma foto pelo endereço (URL) da imagem.

```json
{ "url": "https://.../caneca.png", "ordem": 0, "principal": true }
```

- `url` é obrigatória (http ou https, até 500 caracteres). `ordem` (padrão 0) e `principal` (padrão `false`) são opcionais.
- A **primeira** foto do produto vira a principal automaticamente.
- Marcar uma foto como `principal` desmarca a anterior.

Resposta `201`: `{ "foto": { "id": 10, "url": "...", "ordem": 0, "principal": true } }`.

O envio do arquivo da imagem (upload) entra na próxima fase, junto com o Supabase Storage. Por enquanto, a URL pode ser de qualquer imagem pública.

### DELETE /admin/produtos/:id/fotos/:fotoId

Remove uma foto. Resposta `204`. Se era a principal, a primeira que sobrar vira a principal. Erro `404` se a foto não existir ou for de outro produto.

## Códigos de erro usados

| Código | Quando |
| --- | --- |
| 400 | Dados inválidos ou JSON malformado |
| 401 | Sem login, token inválido ou expirado, e-mail ou senha errados |
| 403 | Logado, mas sem permissão (por exemplo, cliente tentando acessar rota de admin) |
| 404 | Rota ou registro não encontrado |
| 409 | Conflito (e-mail repetido, estoque insuficiente) |
| 500 | Erro interno |
