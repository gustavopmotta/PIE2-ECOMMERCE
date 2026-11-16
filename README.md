# Iupe — front-end da loja

Front-end de e-commerce em **Vite + React + TypeScript**, com **React Router** e ícones **Phosphor**.
Produtos, preços e fotos vêm do site original (iupicanecas.com.br); pedidos, estoque e login são fictícios até a API ficar pronta.

## Como rodar

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm run build    # gera a versão de produção em dist/
```

## Rotas

| Rota | O que é |
| --- | --- |
| `/` | Catálogo (busca, categorias em `/?categoria=gamer`, ordenação) |
| `/carrinho` | Carrinho. Registra o pedido, **não processa pagamento** |
| `/admin/login` | Login do administrador |
| `/admin` | Dashboard: visão geral (protegido) |
| `/admin/produtos` | Adicionar, ocultar, excluir produtos e ajustar estoque |
| `/admin/pedidos` | Lista de pedidos |

Login de demonstração: `admin@iupe.com` / `iupe123` (definido em `src/services/api.ts`).

## Pastas

```
src/
├── components/   peças reutilizáveis (TopBar, Header, ProductCard, layouts, rota protegida)
├── pages/        uma página por rota; pages/admin/ para o painel
├── context/      estado global: login, produtos e carrinho
├── services/     api.ts — único ponto de acesso a dados
├── data/         dados fictícios (produtos, pedidos, redes sociais, categorias)
├── styles/       global.css (cores e base), store.css, admin.css
├── types/        tipos TypeScript
└── utils/        formatação de preço/data e localStorage
```

## Onde mexer

- **Redes sociais** (faixa do topo): `src/data/social.ts`
- **Produtos e categorias**: `src/data/products.ts` e `src/data/categories.ts`
- **Cores e fontes**: variáveis no início de `src/styles/global.css`
- **Logo**: `src/components/Logo.tsx`
- **Fotos dos produtos**: coloque os arquivos em `public/produtos/` e preencha o campo `image` de cada produto (ex.: `image: '/produtos/panela.jpg'`). Sem foto, aparece um espaço cinza
- **Banner da página inicial**: `src/pages/Catalog.tsx`; dá para usar uma foto de fundo (`public/banner.jpg`)

## Ligando a API depois

Troque o corpo das funções de `src/services/api.ts` por chamadas `fetch`. As páginas e
contextos só conversam com esse arquivo. O login atual é apenas demonstração: a
validação de verdade precisa ser feita no backend.

As alterações feitas no painel e o carrinho ficam salvos no `localStorage` do navegador.
Para voltar aos dados originais, limpe os dados do site no navegador.
