// Pedidos do cliente. Tudo aqui exige login.
const express = require('express');

const pedidosController = require('../controllers/pedidos.controller');
const autenticar = require('../middlewares/auth');
const exigirPerfil = require('../middlewares/perfil');
const { validarId, validarPedido } = require('../middlewares/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(autenticar);

router.post('/', exigirPerfil('cliente'), validarPedido, asyncHandler(pedidosController.criar));

// "/meus" precisa vir ANTES de "/:id", senao "meus" seria lido como um id.
router.get('/meus', exigirPerfil('cliente'), asyncHandler(pedidosController.listarMeus));

// O cliente so ve os proprios pedidos; o admin ve qualquer um (a regra esta no service).
router.get('/:id', validarId('id'), asyncHandler(pedidosController.detalhe));

module.exports = router;
