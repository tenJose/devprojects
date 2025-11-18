"use strict";
// Rutas de autenticación
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var auth_controller_1 = require("../controllers/auth.controller");
var router = express.Router();
// POST /api/auth/registro - Registrar nuevo usuario
router.post('/registro', auth_controller_1.registro);
// POST /api/auth/verificar - Verificar email con código
router.post('/verificar', auth_controller_1.verificar);
// POST /api/auth/login - Iniciar sesión
router.post('/login', auth_controller_1.login);
exports.default = router;
