// Erro "esperado" da aplicacao: carrega a mensagem e o codigo HTTP que o front vai receber.
class AppError extends Error {
  constructor(mensagem, status = 400, detalhes = null) {
    super(mensagem);
    this.name = 'AppError';
    this.status = status;
    this.detalhes = detalhes;
  }
}

module.exports = AppError;
