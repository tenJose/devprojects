import { Router } from 'express';
import { autenticar } from '../middleware/auth.middleware';
import { enviarSolicitud, verificarEstado } from '../controllers/friend.controller';

const router = Router();

// Usamos 'autenticar' en lugar de 'verificarToken'
router.post('/request', autenticar, enviarSolicitud);
router.get('/status/:friendId', autenticar, verificarEstado);
export default router;