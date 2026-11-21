// Consultas SQL da tabela movimentacoes_estoque.
// Cada INSERT aqui faz o TRIGGER do banco somar a quantidade ao saldo do produto.
// Por isso o back-end nunca atualiza produtos.quantidade_estoque diretamente.
// Movimentacoes so se inserem: nunca se editam nem se apagam.
const { pool } = require('../config/db');

async function inserir({ produtoId, tipo, quantidade, motivo, pedidoId = null, usuarioId = null }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo, pedido_id, usuario_id)
          VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
    [produtoId, tipo, quantidade, motivo, pedidoId, usuarioId]
  );
  return rows[0].id;
}

module.exports = { inserir };
