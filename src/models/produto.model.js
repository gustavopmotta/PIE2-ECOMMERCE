// Consultas SQL da tabela produtos. Aqui so tem SQL, sem regra de negocio.
// O ultimo parametro "db" e opcional: por padrao usa o pool, mas dentro de uma
// transacao recebe o "cliente" da transacao (veja emTransacao em config/db.js).
const { pool } = require('../config/db');

// O catalogo publico NAO mostra a quantidade exata em estoque, so se esta disponivel.
const COLUNAS_PUBLICAS = `p.id, p.nome, p.descricao, p.preco, p.categoria, p.tema, p.material,
       (p.quantidade_estoque > 0) AS disponivel`;

const COLUNAS_ADMIN = `p.id, p.nome, p.descricao, p.preco, p.categoria, p.tema, p.material,
       p.quantidade_estoque, p.estoque_minimo, p.oculto, p.criado_em, p.atualizado_em`;

// URL da foto principal (ou da primeira, se nenhuma estiver marcada como principal).
const FOTO_PRINCIPAL = `(SELECT f.url
                           FROM fotos_produto f
                          WHERE f.produto_id = p.id
                          ORDER BY f.principal DESC, f.ordem, f.id
                          LIMIT 1) AS foto_principal`;

async function listarPublicos(db = pool) {
  const { rows } = await db.query(
    `SELECT ${COLUNAS_PUBLICAS}, ${FOTO_PRINCIPAL}
       FROM produtos p
      WHERE p.oculto = false
      ORDER BY p.nome`
  );
  return rows;
}

async function buscarPublicoPorId(id, db = pool) {
  const { rows } = await db.query(
    `SELECT ${COLUNAS_PUBLICAS}
       FROM produtos p
      WHERE p.id = $1 AND p.oculto = false`,
    [id]
  );
  return rows[0] || null;
}

async function listarTodos(db = pool) {
  const { rows } = await db.query(
    `SELECT ${COLUNAS_ADMIN}, ${FOTO_PRINCIPAL}
       FROM produtos p
      ORDER BY p.id DESC`
  );
  return rows;
}

async function buscarPorId(id, db = pool) {
  const { rows } = await db.query(
    `SELECT ${COLUNAS_ADMIN}
       FROM produtos p
      WHERE p.id = $1`,
    [id]
  );
  return rows[0] || null;
}

// O saldo (quantidade_estoque) nasce em 0. Estoque so muda por movimentacao.
async function criar(dados, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO produtos (nome, descricao, preco, categoria, tema, material, estoque_minimo)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
    [dados.nome, dados.descricao, dados.preco, dados.categoria, dados.tema, dados.material, dados.estoqueMinimo]
  );
  return rows[0].id;
}

// Nao mexe em quantidade_estoque de proposito: o trigger do banco cuida do saldo.
async function atualizar(id, dados, db = pool) {
  const resultado = await db.query(
    `UPDATE produtos
        SET nome = $1, descricao = $2, preco = $3, categoria = $4,
            tema = $5, material = $6, estoque_minimo = $7
      WHERE id = $8`,
    [dados.nome, dados.descricao, dados.preco, dados.categoria, dados.tema, dados.material, dados.estoqueMinimo, id]
  );
  return resultado.rowCount;
}

async function definirOculto(id, oculto, db = pool) {
  const resultado = await db.query('UPDATE produtos SET oculto = $1 WHERE id = $2', [oculto, id]);
  return resultado.rowCount;
}

async function excluir(id, db = pool) {
  const resultado = await db.query('DELETE FROM produtos WHERE id = $1', [id]);
  return resultado.rowCount;
}

module.exports = {
  listarPublicos,
  buscarPublicoPorId,
  listarTodos,
  buscarPorId,
  criar,
  atualizar,
  definirOculto,
  excluir,
};
