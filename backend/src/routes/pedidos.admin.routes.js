// Gerenciamento de pedidos pelo administrador (RF18).
const express = require('express');

const pedidosController = require('../controllers/pedidos.controller');
const autenticar = require('../middlewares/auth');
const exigirPerfil = require('../middlewares/perfil');
const { validarId, validarStatus, validarFiltroPedidos } = require('../middlewares/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(autenticar, exigirPerfil('admin'));

router.get('/', validarFiltroPedidos, asyncHandler(pedidosController.listarTodos));
router.get('/:id', validarId('id'), asyncHandler(pedidosController.detalhe));
router.patch('/:id/status', validarId('id'), validarStatus, asyncHandler(pedidosController.mudarStatus));

module.exports = router;
