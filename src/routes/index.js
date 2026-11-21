// Junta todas as rotas. A etapa 3 (estoque e pedidos) entra aqui.
const express = require('express');

const { pool } = require('../config/db');
const authRoutes = require('./auth.routes');
const produtosRoutes = require('./produtos.routes');
const produtosAdminRoutes = require('./produtos.admin.routes');

const router = express.Router();

// Rota de teste: confirma que a API esta no ar e que o banco responde.
router.get('/saude', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT now() AS agora');
    res.json({ status: 'ok', banco: 'conectado', agora: rows[0].agora });
  } catch (erro) {
    console.error('Falha ao conectar no banco:', erro);
    res.status(503).json({ status: 'erro', banco: 'sem conexão' });
  }
});

router.use(authRoutes);
router.use(produtosRoutes);
router.use('/admin/produtos', produtosAdminRoutes);

module.exports = router;
