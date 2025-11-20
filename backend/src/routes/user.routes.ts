import * as express from 'express';
import { autenticar } from '../middleware/auth.middleware';
import { obtenerPerfil, configurarPerfil } from '../controllers/user.controller';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configuración Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.get('/perfil', autenticar, obtenerPerfil);
router.put('/configurar', autenticar, upload.single('fotoPerfil'), configurarPerfil);

export default router;
