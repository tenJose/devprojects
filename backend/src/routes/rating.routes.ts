import { Router } from 'express';
import {
  rateProject,
  getUserRatings,
  getUserCompletedProjects,
  getUserActiveProjects,
  getProjectsToRate
} from '../controllers/rating.controller';
import { autenticar } from '../middleware/auth.middleware';

const router = Router();

// Calificar un proyecto
router.post('/:id/rate', autenticar, rateProject);

// Obtener calificaciones de un usuario
router.get('/users/:id/ratings', getUserRatings);

// Obtener proyectos completados de un usuario
router.get('/users/:id/completed', getUserCompletedProjects);

// Obtener proyectos activos de un usuario
router.get('/users/:id/active', getUserActiveProjects);

// ✅ NUEVO: Obtener proyectos que pueden ser calificados
router.get('/projects-to-rate', getProjectsToRate);

export default router;
