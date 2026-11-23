// Catalogo publico: qualquer pessoa acessa, sem login (RF01, RF03 e RF25).
const express = require('express');

const produtosController = require('../controllers/produtos.controller');
const { validarId } = require('../middlewares/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/produtos', asyncHandler(produtosController.listarCatalogo));
router.get('/produtos/:id', validarId('id'), asyncHandler(produtosController.detalhePublico));

module.exports = router;
