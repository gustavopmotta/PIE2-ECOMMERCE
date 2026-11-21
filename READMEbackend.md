# Back-end da Loja de Canecas

API em Node.js com Express, ligada ao banco PostgreSQL do Supabase.

**Etapa 1 (esta versão):** estrutura do projeto, conexão com o banco, cadastro, login com token (JWT) e proteção de rotas por perfil (cliente e admin).
**Próximas etapas:** produtos, estoque e pedidos.

## Como rodar

1. **Instalar o Node.js** (versão 18.11 ou mais nova; a 20 ou 22 é o ideal).

2. **Instalar as dependências**, dentro da pasta `backend`:

   ```
   npm install
   ```

3. **Criar o arquivo `.env`** a partir do modelo e preencher:

   ```
   copy .env.example .env      (Windows)
   cp .env.example .env        (Mac e Linux)
   ```

   - `DATABASE_URL`: no painel do Supabase, clique em **Connect**, escolha **Session pooler**, copie a string e troque `[YOUR-DATABASE-PASSWORD]` pela senha do banco. Caracteres especiais na senha (como `&`, `#`, `?`, `@` ou espaço) precisam ser codificados. Não acrescente `?sslmode=` no final.
   - `JWT_SECRET`: invente um texto longo e aleatório.

4. **Ajustar o banco** (no Supabase, em SQL Editor), depois que o `database/schema.sql` já foi executado: rodar o conteúdo de `database/001_telefone_usuarios.sql`. Ele acrescenta a coluna `telefone` na tabela de usuários.

5. **Criar o administrador:**

   ```
   npm run criar-admin -- "Nome do Admin" admin@loja.com SenhaForte123
   ```

6. **Subir a API:**

   ```
   npm run dev
   ```

   Abra `http://localhost:3000/saude`. Se aparecer `"banco": "conectado"`, está tudo certo.

## Testando com o Postman, Insomnia ou curl

Cadastro de cliente:

```
curl -X POST http://localhost:3000/usuarios \ 
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria Souza","email":"maria@email.com","senha":"123456","telefone":"(71) 99999-8888"}'
```

Login (devolve o token):

```
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@email.com","senha":"123456"}'
```

Rota protegida:

```
curl http://localhost:3000/me -H "Authorization: Bearer COLE_O_TOKEN_AQUI"
```

## Estrutura de pastas

```
backend/
├── src/
│   ├── config/db.js            # conexão com o banco e função de transação
│   ├── routes/                 # define os endereços
│   ├── controllers/            # recebe a requisição e responde
│   ├── services/               # regras de negócio
│   ├── models/                 # consultas SQL
│   ├── middlewares/            # login (auth), perfil, validação e erros
│   └── utils/                  # AppError e asyncHandler
├── scripts/criar-admin.js      # cria o primeiro administrador
├── database/                   # schema.sql do colega e ajustes
├── docs/endpoints.md           # contrato da API para o front
├── app.js                      # configura o Express
└── server.js                   # sobe o servidor
```

Cada requisição segue o caminho **rota → controller → service → model**.

## Problemas comuns

- **`"banco": "sem conexão"` ou erro ao subir:** confira a `DATABASE_URL` (senha, host e porta) e se a string é a do Session pooler.
- **`Tenant or user not found`:** o usuário na string precisa ser `postgres.[PROJECT-REF]`, exatamente como o painel mostra.
- **`password authentication failed`:** senha errada, ou senha com caracteres especiais sem codificar.
- **Erro de certificado SSL:** deixe `DB_SSL=true` e retire `?sslmode=...` do final da `DATABASE_URL`.
- **`O banco não tem uma coluna que o código espera`:** falta rodar o `database/001_telefone_usuarios.sql`.
- **O front não consegue chamar a API (erro de CORS):** coloque o endereço do front em `CORS_ORIGIN` no `.env` e reinicie a API.

## Segurança

- O arquivo `.env` guarda a senha do banco e o segredo do token. Ele está no `.gitignore` e nunca deve ir para o GitHub.
- As senhas dos usuários são guardadas apenas como hash (bcrypt).
- O cadastro pelo site sempre cria perfil `cliente`, mesmo que o front envie outro valor.
