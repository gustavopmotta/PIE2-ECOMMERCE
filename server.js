// Ponto de entrada: carrega o .env, confere as variaveis e sobe o servidor.
// O dotenv precisa rodar ANTES de importar o app, porque o db.js le o .env ao ser carregado.
require('dotenv').config();

const faltando = ['DATABASE_URL', 'JWT_SECRET'].filter((nome) => !process.env[nome]);
if (faltando.length > 0) {
  console.error(`Faltam variaveis no arquivo .env: ${faltando.join(', ')}`);
  console.error('Copie o .env.example para .env e preencha os valores.');
  process.exit(1);
}

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
  console.log(`Teste a conexao com o banco em http://localhost:${PORT}/saude`);
});
