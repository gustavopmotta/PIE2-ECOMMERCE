// Recebe a requisicao, chama o service e devolve a resposta.
const pedidosService = require('../services/pedidos.service');

// ---------- cliente ----------

async function criar(req, res) {
  const pedido = await pedidosService.criar(req.usuario.id, req.dados);
  res.status(201).json({ pedido });
}

async function listarMeus(req, res) {
  const pedidos = await pedidosService.listarDoCliente(req.usuario.id);
  res.json({ pedidos });
}

async function detalhe(req, res) {
  const pedido = await pedidosService.detalhe(req.ids.id, req.usuario);
  res.json({ pedido });
}

// ---------- admin ----------

async function listarTodos(req, res) {
  const pedidos = await pedidosService.listarTodos(req.filtros);
  res.json({ pedidos });
}

async function mudarStatus(req, res) {
  const pedido = await pedidosService.mudarStatus(req.ids.id, req.dados.status, req.usuario.id);
  res.json({ pedido });
}

module.exports = { criar, listarMeus, detalhe, listarTodos, mudarStatus };
