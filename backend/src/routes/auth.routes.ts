// Rutas de autenticación

import * as express from 'express';
import { registro, verificar, login } from '../controllers/auth.controller';

const router = express.Router();

// POST /api/auth/registro - Registrar nuevo usuario
router.post('/registro', registro);

// POST /api/auth/verificar - Verificar email con código
router.post('/verificar', verificar);

// POST /api/auth/login - Iniciar sesión
router.post('/login', login);

export default router;
