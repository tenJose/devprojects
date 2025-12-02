import { Router } from 'express';
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject 
} from '../controllers/project.controller';
import { uploadProjectFiles } from '../controllers/project.controller';
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

export default router;
