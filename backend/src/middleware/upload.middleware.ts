import multer from 'multer';
import path from 'path';

// Configuración del almacenamiento
export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // carpeta donde se guardarán
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const nombreArchivo = `${Date.now()}${ext}`;
    cb(null, nombreArchivo);
  },
});

// Filtro para aceptar solo imágenes
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Solo se permiten imágenes'), false);
};

export const upload = multer({ storage, fileFilter });
