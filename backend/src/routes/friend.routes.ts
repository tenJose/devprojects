import { Router } from 'express';
import { autenticar } from '../middleware/auth.middleware';
import { enviarSolicitud, verificarEstado, responderSolicitud } from '../controllers/friend.controller';

const router = Router();

// Usamos 'autenticar' en lugar de 'verificarToken'
router.post('/request', autenticar, enviarSolicitud);
router.get('/status/:friendId', autenticar, verificarEstado);
router.put('/respond', autenticar, responderSolicitud);
export default router;