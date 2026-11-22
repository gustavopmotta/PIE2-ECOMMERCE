// Conexao com o PostgreSQL do Supabase usando a biblioteca pg.
// Este arquivo le o .env quando e carregado, entao o dotenv precisa ter rodado antes (veja server.js).
const { Pool, types } = require('pg');

// A pg devolve bigint e numeric como TEXTO ("1" e "39.90").
// Convertemos para numero para o front receber 1 e 39.9.
types.setTypeParser(20, (valor) => parseInt(valor, 10)); // bigint
types.setTypeParser(1700, (valor) => parseFloat(valor)); // numeric

const usarSsl = process.env.DB_SSL !== 'false';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // O Supabase exige SSL. rejectUnauthorized: false aceita o certificado sem
  // verificar a cadeia, o que basta para o projeto academico.
  ssl: usarSsl ? { rejectUnauthorized: false } : false,
  max: 10,
});

pool.on('error', (erro) => {
  console.error('Erro inesperado no pool do banco:', erro.message);
});

// Executa varias consultas na MESMA transacao (BEGIN ... COMMIT).
// Se algo der erro, desfaz tudo (ROLLBACK). Sera usado na baixa e devolucao de estoque.
// Uso: await emTransacao(async (cliente) => { await cliente.query(...); });
async function emTransacao(funcao) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await funcao(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (erro) {
    await cliente.query('ROLLBACK');
    throw erro;
  } finally {
    cliente.release();
  }
}

module.exports = { pool, emTransacao };
