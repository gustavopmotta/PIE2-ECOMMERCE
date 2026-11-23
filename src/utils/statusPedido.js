// Status validos do pedido e quais mudancas sao permitidas a partir de cada um.
// O fluxo normal e: pendente -> pago -> em_preparo -> enviado -> entregue.
// Um pedido pode ser cancelado em qualquer ponto, ate ser entregue.
const STATUS_VALIDOS = ['pendente', 'pago', 'em_preparo', 'enviado', 'entregue', 'cancelado'];

const TRANSICOES = {
  pendente: ['pago', 'cancelado'],
  pago: ['em_preparo', 'cancelado'],
  em_preparo: ['enviado', 'cancelado'],
  enviado: ['entregue', 'cancelado'],
  entregue: [],
  cancelado: [],
};

module.exports = { STATUS_VALIDOS, TRANSICOES };
