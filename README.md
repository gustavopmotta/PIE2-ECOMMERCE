# Iupe

Front-end da loja Iupe. Feito com Vite, React, TypeScript, React Router e Phosphor Icons.

Ainda não tem backend: o catálogo vem de `src/data/products.ts` e os pedidos ficam salvos no navegador (localStorage).

## Rodando

```bash
npm install
npm run dev
```

Abre em http://localhost:5173. Para gerar a versão de produção: `npm run build`.

## Rotas

- `/` catálogo; ao adicionar um produto, o cliente escolhe a quantidade e vai para o carrinho
- `/carrinho` carrinho: o cliente informa nome e celular e registra o pedido (não processa pagamento)
- `/admin/login` login do administrador
- `/admin` visão geral
- `/admin/produtos` produtos e estoque (em branco = sob encomenda)
- `/admin/pedidos` pedidos, com contato pelo WhatsApp e situação

Login do painel: usuário `admin`, senha `iupe123`. Para trocar, edite `src/data/admin.ts`.
A sessão termina ao clicar em Sair, ao fechar o navegador ou depois de 8 horas.

## Estrutura

```
src/
  components/   componentes e layouts
  pages/        páginas (admin em pages/admin)
  context/      login, produtos e carrinho
  services/     acesso a dados (api.ts)
  data/         catálogo, categorias e redes sociais
  styles/       css
  types/
  utils/
```

## Pendências

- Integrar com a API (`src/services/api.ts`). Enquanto isso, um pedido só aparece no painel aberto no mesmo navegador em que foi feito
- Autenticação real
- Links das redes sociais (`src/data/social.ts`)
- Hospedar as fotos dos produtos no próprio projeto
