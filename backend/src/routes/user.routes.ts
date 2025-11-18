// Rutas de usuario

import * as express from 'express';
import { autenticar } from '../middleware/auth.middleware';
import { obtenerPerfil, configurarPerfil } from '../controllers/user.controller';

const router = express.Router();

// GET /api/users/perfil - Obtener perfil del usuario autenticado
router.get('/perfil', autenticar, obtenerPerfil);

// PUT /api/users/configurar - Configurar perfil del usuario
router.put('/configurar', autenticar, configurarPerfil);

export default router;
