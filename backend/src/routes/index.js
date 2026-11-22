// Junta todas as rotas.
const express = require('express');

const { pool } = require('../config/db');
const authRoutes = require('./auth.routes');
const produtosRoutes = require('./produtos.routes');
const produtosAdminRoutes = require('./produtos.admin.routes');
const pedidosRoutes = require('./pedidos.routes');
const pedidosAdminRoutes = require('./pedidos.admin.routes');
const estoqueAdminRoutes = require('./estoque.admin.routes');

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
router.use('/pedidos', pedidosRoutes);
router.use('/admin/pedidos', pedidosAdminRoutes);
router.use('/admin/estoque', estoqueAdminRoutes);

module.exports = router;
