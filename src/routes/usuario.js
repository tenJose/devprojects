// Rutas de usuario
// Aquí definimos los endpoints para obtener y actualizar datos del usuario

import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.js';
import { obtenerUsuario, actualizarPerfil, actualizarFotoPerfil } from '../controllers/usuarioController.js';

const router = express.Router();

// Configurar multer para subir archivos
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/usuario/me - Obtener datos del usuario autenticado
router.get('/me', authMiddleware, obtenerUsuario);

// PUT /api/usuario/perfil - Actualizar perfil del usuario
router.put('/perfil', authMiddleware, actualizarPerfil);

// PUT /api/usuario/foto - Actualizar foto de perfil
router.put('/foto', authMiddleware, upload.single('foto'), actualizarFotoPerfil);

export default router;
