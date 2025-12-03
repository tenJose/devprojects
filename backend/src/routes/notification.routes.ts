import { Router } from 'express';
import { autenticar } from '../middleware/auth.middleware';
import { obtenerNotificaciones } from '../controllers/notification.controller';

const router = Router();

router.get('/', autenticar, obtenerNotificaciones);

export default router;