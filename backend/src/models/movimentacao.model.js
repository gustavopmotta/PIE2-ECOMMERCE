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

// Historico de movimentacoes (RF17), da mais recente para a mais antiga.
// produtoId e opcional: sem ele, traz as movimentacoes de todos os produtos.
async function listar({ produtoId, limite }, db = pool) {
  const parametros = [];
  let filtro = '';
  if (produtoId) {
    parametros.push(produtoId);
    filtro = `WHERE m.produto_id = $${parametros.length}`;
  }
  parametros.push(limite);
  const { rows } = await db.query(
    `SELECT m.id, m.produto_id, p.nome AS produto_nome, m.tipo, m.quantidade, m.motivo,
            m.pedido_id, m.usuario_id, u.nome AS usuario_nome, m.criado_em
       FROM movimentacoes_estoque m
       JOIN produtos p ON p.id = m.produto_id
       LEFT JOIN usuarios u ON u.id = m.usuario_id
       ${filtro}
      ORDER BY m.id DESC
      LIMIT $${parametros.length}`,
    parametros
  );
  return rows;
}

module.exports = { inserir, listar };
