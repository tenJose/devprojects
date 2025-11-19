import { Router } from 'express';
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject 
} from '../controllers/project.controller';
import { autenticar } from '../middleware/auth.middleware';

const router = Router();

router.get('/', autenticar, getAllProjects);

router.get('/:id', autenticar, getProjectById);

router.post('/', autenticar, createProject);

router.put('/:id', autenticar, updateProject);

router.delete('/:id', autenticar, deleteProject);

export default router;
