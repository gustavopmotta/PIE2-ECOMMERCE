// Cria o primeiro administrador (o cadastro pelo site so cria clientes).
// Uso: npm run criar-admin -- "Nome do Admin" admin@loja.com SenhaForte123
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

async function main() {
  const [nome, emailBruto, senha] = process.argv.slice(2);

  if (!nome || !emailBruto || !senha) {
    console.log('Uso: npm run criar-admin -- "Nome do Admin" admin@loja.com SenhaForte123');
    process.exit(1);
  }
  if (senha.length < 6) {
    console.log('A senha precisa ter pelo menos 6 caracteres.');
    process.exit(1);
  }

  const email = emailBruto.trim().toLowerCase();
  const senhaHash = await bcrypt.hash(senha, 10);

  try {
    await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil)
            VALUES ($1, $2, $3, 'admin')`,
      [nome.trim(), email, senhaHash]
    );
    console.log(`Administrador criado: ${email}`);
  } catch (erro) {
    if (erro.code === '23505') {
      console.log(`Ja existe um usuario com o e-mail ${email}.`);
    } else {
      console.error('Nao foi possivel criar o administrador:', erro.message);
    }
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
