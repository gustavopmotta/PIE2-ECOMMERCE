// Estoque feito pelo administrador: entradas, ajustes e historico (RF15 e RF17).
const express = require('express');

const estoqueController = require('../controllers/estoque.controller');
const autenticar = require('../middlewares/auth');
const exigirPerfil = require('../middlewares/perfil');
const { validarMovimentacao, validarFiltroMovimentacoes } = require('../middlewares/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(autenticar, exigirPerfil('admin'));

router.get('/movimentacoes', validarFiltroMovimentacoes, asyncHandler(estoqueController.listarMovimentacoes));
router.post('/movimentacoes', validarMovimentacao, asyncHandler(estoqueController.registrarMovimentacao));

module.exports = router;
