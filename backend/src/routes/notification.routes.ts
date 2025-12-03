import { Router } from 'express';
import { autenticar } from '../middleware/auth.middleware';
import { obtenerNotificaciones, marcarNotificacionLeida } from '../controllers/notification.controller';

const router = Router();

router.get('/', autenticar, obtenerNotificaciones);
router.put('/:id/read', autenticar, marcarNotificacionLeida);

export default router;