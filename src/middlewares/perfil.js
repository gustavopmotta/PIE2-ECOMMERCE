// Libera a rota so para certos perfis. Deve vir DEPOIS do middleware autenticar.
// Exemplo: router.get('/pedidos', autenticar, exigirPerfil('admin'), ...)
const AppError = require('../utils/AppError');

function exigirPerfil(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return next(new AppError('Faça login para continuar.', 401));
    }
    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return next(new AppError('Você não tem permissão para acessar este recurso.', 403));
    }
    next();
  };
}

module.exports = exigirPerfil;
