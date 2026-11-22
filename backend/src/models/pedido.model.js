// Consultas SQL das tabelas pedidos e itens_pedido. So SQL, sem regra de negocio.
const { pool } = require('../config/db');

async function criar({ usuarioId, total, observacao, origem = 'site' }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO pedidos (usuario_id, status, origem, total, observacao)
          VALUES ($1, 'pendente', $2, $3, $4)
       RETURNING id`,
    [usuarioId, origem, total, observacao]
  );
  return rows[0].id;
}

async function inserirItem({ pedidoId, produtoId, quantidade, precoUnitario }, db = pool) {
  await db.query(
    `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
          VALUES ($1, $2, $3, $4)`,
    [pedidoId, produtoId, quantidade, precoUnitario]
  );
}

// Trava a linha do pedido ate o fim da transacao. Assim, dois cliques simultaneos em
// "pago" nao dao baixa duas vezes: o segundo espera e depois ve o novo status.
async function buscarParaAtualizar(id, db = pool) {
  const { rows } = await db.query(
    'SELECT id, usuario_id, status FROM pedidos WHERE id = $1 FOR UPDATE',
    [id]
  );
  return rows[0] || null;
}

async function atualizarStatus(id, status, db = pool) {
  await db.query('UPDATE pedidos SET status = $1 WHERE id = $2', [status, id]);
}

async function buscarDetalhe(id, db = pool) {
  const { rows } = await db.query(
    `SELECT p.id, p.status, p.origem, p.total, p.observacao, p.criado_em, p.atualizado_em,
            p.usuario_id, u.nome AS cliente_nome, u.email AS cliente_email,
            u.telefone AS cliente_telefone
       FROM pedidos p
       LEFT JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function listarItens(pedidoId, db = pool) {
  const { rows } = await db.query(
    `SELECT i.produto_id, pr.nome AS produto_nome, i.quantidade, i.preco_unitario,
            (i.quantidade * i.preco_unitario) AS subtotal
       FROM itens_pedido i
       JOIN produtos pr ON pr.id = i.produto_id
      WHERE i.pedido_id = $1
      ORDER BY i.id`,
    [pedidoId]
  );
  return rows;
}

// Usado na baixa e na devolucao de estoque.
async function listarItensParaEstoque(pedidoId, db = pool) {
  const { rows } = await db.query(
    `SELECT produto_id, quantidade
       FROM itens_pedido
      WHERE pedido_id = $1
      ORDER BY produto_id`,
    [pedidoId]
  );
  return rows;
}

async function listarDoCliente(usuarioId, db = pool) {
  const { rows } = await db.query(
    `SELECT id, status, origem, total, criado_em
       FROM pedidos
      WHERE usuario_id = $1
      ORDER BY id DESC`,
    [usuarioId]
  );
  return rows;
}

// Lista do admin, com filtro opcional por status. Traz so os 200 mais recentes.
async function listarTodos({ status }, db = pool) {
  const parametros = [];
  let filtro = '';
  if (status) {
    parametros.push(status);
    filtro = `WHERE p.status = $${parametros.length}`;
  }
  const { rows } = await db.query(
    `SELECT p.id, p.status, p.origem, p.total, p.observacao, p.criado_em,
            p.usuario_id, u.nome AS cliente_nome, u.email AS cliente_email,
            u.telefone AS cliente_telefone
       FROM pedidos p
       LEFT JOIN usuarios u ON u.id = p.usuario_id
       ${filtro}
      ORDER BY p.id DESC
      LIMIT 200`,
    parametros
  );
  return rows;
}

module.exports = {
  criar,
  inserirItem,
  buscarParaAtualizar,
  atualizarStatus,
  buscarDetalhe,
  listarItens,
  listarItensParaEstoque,
  listarDoCliente,
  listarTodos,
};
