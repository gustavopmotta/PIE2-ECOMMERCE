// Recebe a requisicao, chama o service e devolve a resposta.
const estoqueService = require('../services/estoque.service');

async function listarMovimentacoes(req, res) {
  const movimentacoes = await estoqueService.listarMovimentacoes(req.filtros);
  res.json({ movimentacoes });
}

async function registrarMovimentacao(req, res) {
  const resultado = await estoqueService.registrarManual(req.dados, req.usuario.id);
  res.status(201).json(resultado);
}

module.exports = { listarMovimentacoes, registrarMovimentacao };
