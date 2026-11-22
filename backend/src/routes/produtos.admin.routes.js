// Painel do administrador: todas as rotas exigem login com perfil admin (RF12).
const express = require('express');

const produtosController = require('../controllers/produtos.controller');
const autenticar = require('../middlewares/auth');
const exigirPerfil = require('../middlewares/perfil');
const {
  validarId,
  validarProduto,
  validarOculto,
  validarFoto,
} = require('../middlewares/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Vale para TODAS as rotas deste arquivo.
router.use(autenticar, exigirPerfil('admin'));

router.get('/', asyncHandler(produtosController.listarTodos));
router.post('/', validarProduto(true), asyncHandler(produtosController.criar));

router.get('/:id', validarId('id'), asyncHandler(produtosController.detalheAdmin));
router.put('/:id', validarId('id'), validarProduto(false), asyncHandler(produtosController.atualizar));
router.patch('/:id/oculto', validarId('id'), validarOculto, asyncHandler(produtosController.definirOculto));
router.delete('/:id', validarId('id'), asyncHandler(produtosController.excluir));

router.post('/:id/fotos', validarId('id'), validarFoto, asyncHandler(produtosController.adicionarFoto));
router.delete('/:id/fotos/:fotoId', validarId('id', 'fotoId'), asyncHandler(produtosController.removerFoto));

module.exports = router;
