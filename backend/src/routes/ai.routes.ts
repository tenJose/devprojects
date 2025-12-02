import { Router } from 'express';
import { generateFromPrompt } from '../controllers/ai.controller';
import { generateQuestions } from '../controllers/ai.controller';

const router = Router();

// POST /api/ai/generate
router.post('/generate', generateFromPrompt);
router.post('/questions', generateQuestions);

export default router;
