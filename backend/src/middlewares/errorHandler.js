// Tratamento central de erros. Toda resposta de erro tem o formato { erro: "mensagem" }.
const AppError = require('../utils/AppError');

// Erros do PostgreSQL que viram respostas claras (codigo -> [status HTTP, mensagem]).
const ERROS_POSTGRES = {
  '23505': [409, 'Já existe um registro com esses dados.'],
  '23503': [409, 'Operação bloqueada: o registro está ligado a outros dados.'],
  '23514': [409, 'Operação recusada por uma regra do banco (por exemplo, estoque insuficiente).'],
  '22P02': [400, 'Valor em formato inválido.'],
  '42703': [500, 'O banco não tem uma coluna que o código espera. Rode os arquivos da pasta database/.'],
};

// O Express exige os 4 parametros para reconhecer esta funcao como tratador de erros.
function errorHandler(erro, req, res, next) {
  if (erro instanceof AppError) {
    const corpo = { erro: erro.message };
    if (erro.detalhes) corpo.detalhes = erro.detalhes;
    return res.status(erro.status).json(corpo);
  }

  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  if (erro.type === 'entity.too.large') {
    return res.status(413).json({ erro: 'Corpo da requisição grande demais.' });
  }

  if (erro.code && ERROS_POSTGRES[erro.code]) {
    const [status, mensagem] = ERROS_POSTGRES[erro.code];
    console.error(`[banco ${erro.code}]`, erro.message);
    return res.status(status).json({ erro: mensagem });
  }

  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = errorHandler;
