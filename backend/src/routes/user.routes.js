"use strict";
// Rutas de usuario
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var auth_middleware_1 = require("../middleware/auth.middleware");
var user_controller_1 = require("../controllers/user.controller");
var router = express.Router();
// GET /api/users/perfil - Obtener perfil del usuario autenticado
router.get('/perfil', auth_middleware_1.autenticar, user_controller_1.obtenerPerfil);
// PUT /api/users/configurar - Configurar perfil del usuario
router.put('/configurar', auth_middleware_1.autenticar, user_controller_1.configurarPerfil);
exports.default = router;
