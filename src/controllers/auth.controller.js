// Recebe a requisicao, chama o service e devolve a resposta.
const authService = require('../services/auth.service');

async function cadastrar(req, res) {
  const usuario = await authService.cadastrar(req.dados);
  res.status(201).json({ usuario });
}

async function login(req, res) {
  const resultado = await authService.login(req.dados);
  res.json(resultado);
}

async function me(req, res) {
  const usuario = await authService.buscarPerfil(req.usuario.id);
  res.json({ usuario });
}

module.exports = { cadastrar, login, me };
