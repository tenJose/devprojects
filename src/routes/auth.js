// Rutas de autenticación
// Aquí definimos los endpoints para registro, login y verificación

import express from 'express';
import { registro, verificarEmail, login } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/registro - Registrar un nuevo usuario
router.post('/registro', registro);

// POST /api/auth/verificar - Verificar código de email
router.post('/verificar', verificarEmail);

// POST /api/auth/login - Iniciar sesión
router.post('/login', login);

export default router;
