const express = require('express');

const authController = require('../controllers/auth.controller');
const autenticar = require('../middlewares/auth');
const { validarCadastro, validarLogin } = require('../middlewares/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/usuarios', validarCadastro, asyncHandler(authController.cadastrar));
router.post('/login', validarLogin, asyncHandler(authController.login));
router.get('/me', autenticar, asyncHandler(authController.me));

module.exports = router;
