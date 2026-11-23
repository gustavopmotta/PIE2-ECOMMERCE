// Regras de negocio dos pedidos: criar, consultar e mudar o status.
// A baixa de estoque acontece quando o admin marca o pedido como "pago" (a confirmacao).
// A devolucao acontece quando um pedido ja pago, em preparo ou enviado e cancelado.
const AppError = require('../utils/AppError');
const { TRANSICOES } = require('../utils/statusPedido');
const { emTransacao } = require('../config/db');
const produtoModel = require('../models/produto.model');
const pedidoModel = require('../models/pedido.model');
const movimentacaoModel = require('../models/movimentacao.model');

const TOTAL_MAXIMO_CENTAVOS = 9999999999; // limite do numeric(10,2) do banco

function montarCliente(linha) {
  return {
    id: linha.usuario_id,
    nome: linha.cliente_nome,
    email: linha.cliente_email,
    telefone: linha.cliente_telefone,
  };
}

// Monta o pedido completo (dados + cliente + itens). "db" permite ler dentro de uma transacao.
async function montarDetalhe(id, db) {
  const pedido = await pedidoModel.buscarDetalhe(id, db);
  if (!pedido) {
    throw new AppError('Pedido não encontrado.', 404);
  }
  const itens = await pedidoModel.listarItens(id, db);
  return {
    id: pedido.id,
    status: pedido.status,
    origem: pedido.origem,
    total: pedido.total,
    observacao: pedido.observacao,
    criado_em: pedido.criado_em,
    atualizado_em: pedido.atualizado_em,
    cliente: montarCliente(pedido),
    itens,
  };
}

// ---------- cliente ----------

// Cria o pedido como "pendente". O estoque NAO sai agora: so confere se ha saldo,
// para avisar o cliente na hora. A baixa vem quando o admin confirma o pagamento.
async function criar(usuarioId, { itens, observacao }) {
  return emTransacao(async (cliente) => {
    const produtos = await produtoModel.buscarPorIds(
      itens.map((item) => item.produtoId),
      false,
      cliente
    );
    const porId = new Map(produtos.map((produto) => [produto.id, produto]));

    const problemas = [];
    let totalCentavos = 0;

    for (const item of itens) {
      const produto = porId.get(item.produtoId);
      if (!produto || produto.oculto) {
        problemas.push(`O produto ${item.produtoId} não está disponível.`);
        continue;
      }
      if (item.quantidade > produto.quantidade_estoque) {
        problemas.push(
          `Estoque insuficiente de "${produto.nome}" (pedido: ${item.quantidade}, disponível: ${produto.quantidade_estoque}).`
        );
      }
      // O preco vem SEMPRE do banco, nunca do front. Conta em centavos para nao errar arredondamento.
      totalCentavos += Math.round(produto.preco * 100) * item.quantidade;
    }

    if (problemas.length > 0) {
      throw new AppError('Não foi possível criar o pedido.', 409, problemas);
    }
    if (totalCentavos > TOTAL_MAXIMO_CENTAVOS) {
      throw new AppError('O valor total do pedido passa do limite permitido.', 400);
    }

    const pedidoId = await pedidoModel.criar(
      { usuarioId, total: totalCentavos / 100, observacao },
      cliente
    );

    for (const item of itens) {
      await pedidoModel.inserirItem(
        {
          pedidoId,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: porId.get(item.produtoId).preco,
        },
        cliente
      );
    }

    return montarDetalhe(pedidoId, cliente);
  });
}

async function listarDoCliente(usuarioId) {
  return pedidoModel.listarDoCliente(usuarioId);
}

// O cliente so ve os proprios pedidos. Pedido de outra pessoa responde 404,
// como se nao existisse. O admin ve qualquer um.
async function detalhe(id, usuario) {
  const pedido = await montarDetalhe(id);
  if (usuario.perfil !== 'admin' && pedido.cliente.id !== usuario.id) {
    throw new AppError('Pedido não encontrado.', 404);
  }
  return pedido;
}

// ---------- admin ----------

async function listarTodos({ status }) {
  const linhas = await pedidoModel.listarTodos({ status });
  return linhas.map((linha) => ({
    id: linha.id,
    status: linha.status,
    origem: linha.origem,
    total: linha.total,
    observacao: linha.observacao,
    criado_em: linha.criado_em,
    cliente: montarCliente(linha),
  }));
}

// Baixa: uma movimentacao negativa por item. O trigger do banco desconta do saldo.
// Antes, trava os produtos (FOR UPDATE) e confere se ha saldo, para dar uma mensagem clara.
async function baixarEstoque(cliente, pedidoId, itens, usuarioId) {
  const produtos = await produtoModel.buscarPorIds(
    itens.map((item) => item.produto_id),
    true,
    cliente
  );
  const porId = new Map(produtos.map((produto) => [produto.id, produto]));

  const faltando = [];
  for (const item of itens) {
    const produto = porId.get(item.produto_id);
    const saldo = produto ? produto.quantidade_estoque : 0;
    if (saldo < item.quantidade) {
      const nome = produto ? produto.nome : `produto ${item.produto_id}`;
      faltando.push(`"${nome}" (pedido: ${item.quantidade}, em estoque: ${saldo})`);
    }
  }
  if (faltando.length > 0) {
    throw new AppError(`Estoque insuficiente para confirmar o pagamento: ${faltando.join('; ')}.`, 409);
  }

  for (const item of itens) {
    await movimentacaoModel.inserir(
      {
        produtoId: item.produto_id,
        tipo: 'baixa',
        quantidade: -item.quantidade,
        motivo: `Pedido #${pedidoId} confirmado`,
        pedidoId,
        usuarioId,
      },
      cliente
    );
  }
}

// Devolucao: uma movimentacao positiva por item.
async function devolverEstoque(cliente, pedidoId, itens, usuarioId) {
  for (const item of itens) {
    await movimentacaoModel.inserir(
      {
        produtoId: item.produto_id,
        tipo: 'devolucao',
        quantidade: item.quantidade,
        motivo: `Cancelamento do pedido #${pedidoId}`,
        pedidoId,
        usuarioId,
      },
      cliente
    );
  }
}

// Muda o status do pedido e, se for o caso, mexe no estoque, tudo na MESMA transacao:
// se qualquer passo falhar, nada fica gravado pela metade.
async function mudarStatus(id, novoStatus, usuarioId) {
  try {
    await emTransacao(async (cliente) => {
      // Trava o pedido: duas confirmacoes simultaneas nao dao baixa duas vezes.
      const pedido = await pedidoModel.buscarParaAtualizar(id, cliente);
      if (!pedido) {
        throw new AppError('Pedido não encontrado.', 404);
      }

      const permitidos = TRANSICOES[pedido.status] || [];
      if (!permitidos.includes(novoStatus)) {
        const dica = permitidos.length > 0
          ? `Próximos status permitidos: ${permitidos.join(', ')}.`
          : 'Este pedido já está encerrado.';
        throw new AppError(
          `Não é possível mudar o pedido de "${pedido.status}" para "${novoStatus}". ${dica}`,
          409
        );
      }

      const itens = await pedidoModel.listarItensParaEstoque(id, cliente);

      if (pedido.status === 'pendente' && novoStatus === 'pago') {
        await baixarEstoque(cliente, id, itens, usuarioId);
      } else if (novoStatus === 'cancelado' && pedido.status !== 'pendente') {
        // O estoque so tinha saido se o pedido ja passou por "pago".
        await devolverEstoque(cliente, id, itens, usuarioId);
      }

      await pedidoModel.atualizarStatus(id, novoStatus, cliente);
    });
  } catch (erro) {
    // Rede de seguranca: o CHECK do banco barrou um saldo negativo.
    if (erro.code === '23514') {
      throw new AppError('Estoque insuficiente para confirmar o pagamento deste pedido.', 409);
    }
    throw erro;
  }

  return montarDetalhe(id);
}

module.exports = { criar, listarDoCliente, detalhe, listarTodos, mudarStatus };
