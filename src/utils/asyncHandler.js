// Envolve uma funcao async para que qualquer erro va para o errorHandler.
// Funciona no Express 4 e no Express 5.
module.exports = (funcao) => (req, res, next) =>
  Promise.resolve(funcao(req, res, next)).catch(next);
