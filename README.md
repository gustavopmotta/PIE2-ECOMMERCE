# Iupi

Front-end da loja Iupi. Feito com Vite, React, TypeScript, React Router e Phosphor Icons.

Os produtos, as contas, os pedidos e o estoque vêm da API do back-end (branch `backend`).

## Rodando

1. Suba a API seguindo o README da branch `backend`. Por padrão ela fica em http://localhost:3000.
2. Crie o arquivo `.env` (veja abaixo).
3. Neste projeto:

```bash
npm install
npm run dev
```

O site abre em http://localhost:5173.

## Configuração (.env)

O endereço da API não fica no código: o site lê do arquivo `.env`, que não vai para o GitHub.

1. Copie o `.env.example` para `.env`.
2. Preencha o `VITE_API_URL` com o endereço da API. No computador, é `http://localhost:3000`.

Na Vercel, a mesma variável é cadastrada em Settings > Environment Variables. Depois de mudar o valor, publique o site de novo.

Atenção: o que começa com `VITE_` vai junto com o site para o navegador de quem acessa. Senha do banco, `JWT_SECRET` e qualquer outra chave secreta ficam só no `.env` da API, nunca aqui.

## Contas

- **Cliente:** cria a conta em `/cadastro` (nome, e-mail, celular e senha) e precisa estar logado para fazer pedido.
- **Administrador:** é criado na API, com `npm run criar-admin -- "Nome" email senha` na pasta do back-end. Entra pela mesma tela `/entrar` e cai direto no painel.

## Rotas

- `/` catálogo; o menu de temas sai do campo `tema` dos produtos
- `/carrinho` carrinho e finalização do pedido (não processa pagamento)
- `/entrar` e `/cadastro`
- `/meus-pedidos` pedidos do cliente logado
- `/admin` visão geral
- `/admin/produtos` cadastrar, editar, ocultar, excluir e trocar a foto
- `/admin/pedidos` contato pelo WhatsApp e mudança de status (pendente, pago, em preparo, enviado, entregue, cancelado)
- `/admin/estoque` entradas, ajustes e histórico

## Estrutura

```
src/
  components/   componentes e layouts
  pages/        páginas (admin em pages/admin)
  context/      sessão (token da API), catálogo e carrinho
  services/     http.ts (chamadas e erros) e api.ts (uma função por endpoint)
  data/         redes sociais
  styles/       css
  types/
  utils/
```

## Pendências

- Envio de arquivo de foto (hoje a foto é cadastrada pelo endereço da imagem)
- Links das redes sociais (`src/data/social.ts`)
