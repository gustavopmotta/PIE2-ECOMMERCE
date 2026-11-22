// Confere o token JWT enviado no cabecalho Authorization: Bearer <token>.
// Se for valido, deixa o usuario disponivel em req.usuario ({ id, perfil }).
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const [tipo, token] = cabecalho.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(new AppError('Faça login para continuar.', 401));
  }

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: dados.id, perfil: dados.perfil };
    next();
  } catch (erro) {
    next(new AppError('Sessão inválida ou expirada. Faça login novamente.', 401));
  }
}

module.exports = autenticar;
