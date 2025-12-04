import { Router } from 'express';
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  uploadProjectFiles,
  requestProjectCompletion,
  confirmProjectCompletion,
  getCompletionStatus
} from '../controllers/project.controller';
import { upload } from '../middleware/upload.middleware';
import { autenticar } from '../middleware/auth.middleware';

const router = Router();

router.get('/', autenticar, getAllProjects);

router.get('/:id', autenticar, getProjectById);

router.post('/', autenticar, createProject);

router.put('/:id', autenticar, updateProject);

router.delete('/:id', autenticar, deleteProject);

// Upload attachments for a project (multiple images)
router.post('/:id/upload', autenticar, upload.array('files', 10), uploadProjectFiles);

// ✅ NUEVAS RUTAS: Finalización de proyectos
router.post('/:id/request-completion', autenticar, requestProjectCompletion);
router.post('/:id/confirm-completion', autenticar, confirmProjectCompletion);
router.get('/:id/completion-status', autenticar, getCompletionStatus);

export default router;
