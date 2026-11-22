// Regras do estoque feito pelo admin: entradas e ajustes manuais (RF15) e o historico (RF17).
// Baixa e devolucao nao passam por aqui: elas nascem dos pedidos (pedidos.service.js).
const AppError = require('../utils/AppError');
const { emTransacao } = require('../config/db');
const produtoModel = require('../models/produto.model');
const movimentacaoModel = require('../models/movimentacao.model');

async function listarMovimentacoes({ produtoId, limite }) {
  return movimentacaoModel.listar({ produtoId, limite });
}

// quantidade e a VARIACAO, nao o novo total: +10 soma 10 ao estoque, -2 tira 2.
// O trigger do banco atualiza o saldo, entao aqui so inserimos a movimentacao.
async function registrarManual({ produtoId, tipo, quantidade, motivo }, usuarioId) {
  try {
    return await emTransacao(async (cliente) => {
      // Trava o produto e le o saldo atual.
      const [produto] = await produtoModel.buscarPorIds([produtoId], true, cliente);
      if (!produto) {
        throw new AppError('Produto não encontrado.', 404);
      }

      if (produto.quantidade_estoque + quantidade < 0) {
        throw new AppError(
          `Este ajuste deixaria o estoque negativo (estoque atual de "${produto.nome}": ${produto.quantidade_estoque}).`,
          409
        );
      }

      const id = await movimentacaoModel.inserir(
        { produtoId, tipo, quantidade, motivo, usuarioId },
        cliente
      );

      // Le de novo na mesma transacao para ja trazer o saldo atualizado pelo trigger.
      const [atualizado] = await produtoModel.buscarPorIds([produtoId], false, cliente);

      return {
        movimentacao: { id, produto_id: produtoId, tipo, quantidade, motivo },
        produto: {
          id: atualizado.id,
          nome: atualizado.nome,
          quantidade_estoque: atualizado.quantidade_estoque,
        },
      };
    });
  } catch (erro) {
    // Rede de seguranca: o CHECK do banco barrou um saldo negativo.
    if (erro.code === '23514') {
      throw new AppError('Este ajuste deixaria o estoque negativo.', 409);
    }
    throw erro;
  }
}

module.exports = { listarMovimentacoes, registrarManual };
