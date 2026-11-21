// Regras de negocio do cadastro e do login.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AppError = require('../utils/AppError');
const usuarioModel = require('../models/usuario.model');

// Nunca devolvemos o senha_hash para o front.
function montarUsuarioPublico(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    perfil: usuario.perfil,
  };
}

async function cadastrar({ nome, email, senha, telefone }) {
  const existente = await usuarioModel.buscarPorEmail(email);
  if (existente) {
    throw new AppError('Já existe uma conta com este e-mail.', 409);
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  // O perfil e sempre "cliente" aqui, mesmo que o front mande outro valor.
  // Administradores so sao criados pelo script scripts/criar-admin.js.
  const usuario = await usuarioModel.criar({
    nome,
    email,
    senhaHash,
    telefone,
    perfil: 'cliente',
  });

  return montarUsuarioPublico(usuario);
}

async function login({ email, senha }) {
  const usuario = await usuarioModel.buscarPorEmail(email);
  const senhaConfere = usuario ? await bcrypt.compare(senha, usuario.senha_hash) : false;

  // A mesma mensagem para "e-mail nao existe" e "senha errada",
  // para nao revelar quais e-mails estao cadastrados.
  if (!usuario || !senhaConfere) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  const token = jwt.sign(
    { id: usuario.id, perfil: usuario.perfil },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRA_EM || '8h' }
  );

  return { token, usuario: montarUsuarioPublico(usuario) };
}

async function buscarPerfil(id) {
  const usuario = await usuarioModel.buscarPorId(id);
  if (!usuario) {
    throw new AppError('Usuário não encontrado.', 404);
  }
  return montarUsuarioPublico(usuario);
}

module.exports = { cadastrar, login, buscarPerfil };
