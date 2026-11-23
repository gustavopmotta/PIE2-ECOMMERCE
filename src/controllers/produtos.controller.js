// Recebe a requisicao, chama o service e devolve a resposta.
const produtosService = require('../services/produtos.service');

// ---------- publico ----------

async function listarCatalogo(req, res) {
  const produtos = await produtosService.listarCatalogo();
  res.json({ produtos });
}

async function detalhePublico(req, res) {
  const produto = await produtosService.detalhePublico(req.ids.id);
  res.json({ produto });
}

// ---------- admin ----------

async function listarTodos(req, res) {
  const produtos = await produtosService.listarTodos();
  res.json({ produtos });
}

async function detalheAdmin(req, res) {
  const produto = await produtosService.detalheAdmin(req.ids.id);
  res.json({ produto });
}

async function criar(req, res) {
  const produto = await produtosService.criar(req.dados, req.usuario.id);
  res.status(201).json({ produto });
}

async function atualizar(req, res) {
  const produto = await produtosService.atualizar(req.ids.id, req.dados);
  res.json({ produto });
}

async function definirOculto(req, res) {
  const produto = await produtosService.definirOculto(req.ids.id, req.dados.oculto);
  res.json({ produto });
}

async function excluir(req, res) {
  await produtosService.excluir(req.ids.id);
  res.status(204).end();
}

async function adicionarFoto(req, res) {
  const foto = await produtosService.adicionarFoto(req.ids.id, req.dados);
  res.status(201).json({ foto });
}

async function removerFoto(req, res) {
  await produtosService.removerFoto(req.ids.id, req.ids.fotoId);
  res.status(204).end();
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
