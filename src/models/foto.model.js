// Consultas SQL da tabela fotos_produto.
const { pool } = require('../config/db');

async function listarPorProduto(produtoId, db = pool) {
  const { rows } = await db.query(
    `SELECT id, url, ordem, principal
       FROM fotos_produto
      WHERE produto_id = $1
      ORDER BY principal DESC, ordem, id`,
    [produtoId]
  );
  return rows;
}

async function buscarPorId(fotoId, db = pool) {
  const { rows } = await db.query(
    `SELECT id, produto_id, url, ordem, principal
       FROM fotos_produto
      WHERE id = $1`,
    [fotoId]
  );
  return rows[0] || null;
}

async function contarPorProduto(produtoId, db = pool) {
  const { rows } = await db.query(
    'SELECT count(*)::int AS total FROM fotos_produto WHERE produto_id = $1',
    [produtoId]
  );
  return rows[0].total;
}

async function desmarcarPrincipais(produtoId, db = pool) {
  await db.query(
    'UPDATE fotos_produto SET principal = false WHERE produto_id = $1 AND principal',
    [produtoId]
  );
}

async function criar({ produtoId, url, ordem, principal }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO fotos_produto (produto_id, url, ordem, principal)
          VALUES ($1, $2, $3, $4)
       RETURNING id, url, ordem, principal`,
    [produtoId, url, ordem, principal]
  );
  return rows[0];
}

async function excluir(fotoId, db = pool) {
  await db.query('DELETE FROM fotos_produto WHERE id = $1', [fotoId]);
}

// Depois de apagar a foto principal, a primeira que sobrar vira a principal.
async function promoverPrimeiraComoPrincipal(produtoId, db = pool) {
  await db.query(
    `UPDATE fotos_produto
        SET principal = true
      WHERE id = (SELECT id
                    FROM fotos_produto
                   WHERE produto_id = $1
                   ORDER BY ordem, id
                   LIMIT 1)`,
    [produtoId]
  );
}

module.exports = {
  listarPorProduto,
  buscarPorId,
  contarPorProduto,
  desmarcarPrincipais,
  criar,
  excluir,
  promoverPrimeiraComoPrincipal,
};
