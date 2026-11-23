// Consultas SQL da tabela usuarios. Aqui so tem SQL, sem regra de negocio.
const { pool } = require('../config/db');

async function buscarPorEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, nome, email, telefone, senha_hash, perfil
       FROM usuarios
      WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

async function buscarPorId(id) {
  const { rows } = await pool.query(
    `SELECT id, nome, email, telefone, perfil
       FROM usuarios
      WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function criar({ nome, email, senhaHash, telefone, perfil }) {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nome, email, senha_hash, telefone, perfil)
          VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email, telefone, perfil`,
    [nome, email, senhaHash, telefone, perfil]
  );
  return rows[0];
}

module.exports = { buscarPorEmail, buscarPorId, criar };
