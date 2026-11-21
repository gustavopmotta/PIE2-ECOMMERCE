// Regras de negocio dos produtos e das fotos.
const AppError = require('../utils/AppError');
const { emTransacao } = require('../config/db');
const produtoModel = require('../models/produto.model');
const fotoModel = require('../models/foto.model');
const movimentacaoModel = require('../models/movimentacao.model');

// ---------- catalogo publico ----------

async function listarCatalogo() {
  return produtoModel.listarPublicos();
}

async function detalhePublico(id) {
  const produto = await produtoModel.buscarPublicoPorId(id);
  // Produto oculto responde 404, como se nao existisse.
  if (!produto) {
    throw new AppError('Produto não encontrado.', 404);
  }
  const fotos = await fotoModel.listarPorProduto(id);
  return { ...produto, fotos };
}

// ---------- painel do administrador ----------

async function listarTodos() {
  return produtoModel.listarTodos();
}

async function detalheAdmin(id) {
  const produto = await produtoModel.buscarPorId(id);
  if (!produto) {
    throw new AppError('Produto não encontrado.', 404);
  }
  const fotos = await fotoModel.listarPorProduto(id);
  return { ...produto, fotos };
}

// Se vier estoque_inicial, ele entra como uma movimentacao de "entrada" na MESMA
// transacao. Assim o historico de estoque ja nasce completo e o trigger do banco
// atualiza o saldo.
async function criar(dados, usuarioId) {
  return emTransacao(async (cliente) => {
    const id = await produtoModel.criar(dados, cliente);

    if (dados.estoqueInicial > 0) {
      await movimentacaoModel.inserir(
        {
          produtoId: id,
          tipo: 'entrada',
          quantidade: dados.estoqueInicial,
          motivo: 'Estoque inicial',
          usuarioId,
        },
        cliente
      );
    }

    // Le de novo dentro da transacao para ja trazer o saldo atualizado pelo trigger.
    const produto = await produtoModel.buscarPorId(id, cliente);
    return { ...produto, fotos: [] };
  });
}

async function atualizar(id, dados) {
  const alterados = await produtoModel.atualizar(id, dados);
  if (alterados === 0) {
    throw new AppError('Produto não encontrado.', 404);
  }
  return detalheAdmin(id);
}

async function definirOculto(id, oculto) {
  const alterados = await produtoModel.definirOculto(id, oculto);
  if (alterados === 0) {
    throw new AppError('Produto não encontrado.', 404);
  }
  return detalheAdmin(id);
}

// Produto que ja tem pedidos ou movimentacoes de estoque nao pode ser apagado
// (o banco recusa com o erro 23503). Nesse caso a saida e ocultar.
async function excluir(id) {
  let apagados;
  try {
    apagados = await produtoModel.excluir(id);
  } catch (erro) {
    if (erro.code === '23503') {
      throw new AppError(
        'Este produto já tem pedidos ou movimentações de estoque e não pode ser excluído. Oculte-o em vez disso.',
        409
      );
    }
    throw erro;
  }
  if (apagados === 0) {
    throw new AppError('Produto não encontrado.', 404);
  }
}

// ---------- fotos (por URL) ----------

async function adicionarFoto(produtoId, { url, ordem, principal }) {
  return emTransacao(async (cliente) => {
    const produto = await produtoModel.buscarPorId(produtoId, cliente);
    if (!produto) {
      throw new AppError('Produto não encontrado.', 404);
    }

    // A primeira foto do produto vira a principal automaticamente.
    const total = await fotoModel.contarPorProduto(produtoId, cliente);
    const virarPrincipal = principal || total === 0;

    // So pode existir uma foto principal por produto.
    if (virarPrincipal) {
      await fotoModel.desmarcarPrincipais(produtoId, cliente);
    }

    return fotoModel.criar({ produtoId, url, ordem, principal: virarPrincipal }, cliente);
  });
}

async function removerFoto(produtoId, fotoId) {
  return emTransacao(async (cliente) => {
    const foto = await fotoModel.buscarPorId(fotoId, cliente);
    if (!foto || foto.produto_id !== produtoId) {
      throw new AppError('Foto não encontrada.', 404);
    }

    await fotoModel.excluir(fotoId, cliente);

    if (foto.principal) {
      await fotoModel.promoverPrimeiraComoPrincipal(produtoId, cliente);
    }
  });
}

module.exports = {
  listarCatalogo,
  detalhePublico,
  listarTodos,
  detalheAdmin,
  criar,
  atualizar,
  definirOculto,
  excluir,
  adicionarFoto,
  removerFoto,
};
