import { Router } from 'express';
import { createPostulacion, responderPostulacion } from '../controllers/postulacion.controller';
import { autenticar } from '../middleware/auth.middleware';

const router = Router();

// Ruta para crear la postulación (POST /api/postulaciones)
router.post('/', autenticar, createPostulacion);

// Ruta para responder (PUT /api/postulaciones/:id/responder)
router.put('/:id/responder', autenticar, responderPostulacion);

export default router;