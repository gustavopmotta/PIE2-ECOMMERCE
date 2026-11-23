// Configura o Express: CORS, leitura de JSON, rotas e tratamento de erros.
const express = require('express');
const cors = require('cors');

const routes = require('./src/routes');
const AppError = require('./src/utils/AppError');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

const origensPermitidas = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origem) => origem.trim())
  .filter(Boolean);

// Sem CORS_ORIGIN definido, libera qualquer origem (so para desenvolvimento).
app.use(cors({ origin: origensPermitidas.length > 0 ? origensPermitidas : true }));
app.use(express.json());

app.use(routes);

// Qualquer rota que nao existe cai aqui.
app.use((req, res, next) => next(new AppError('Rota não encontrada.', 404)));

// O tratamento de erros sempre fica por ultimo.
app.use(errorHandler);

module.exports = app;
