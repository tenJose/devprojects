"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.storage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Configuración del almacenamiento
exports.storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // carpeta donde se guardarán
    },
    filename: function (req, file, cb) {
        const ext = path_1.default.extname(file.originalname);
        const nombreArchivo = `${Date.now()}${ext}`;
        cb(null, nombreArchivo);
    },
});
// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/'))
        cb(null, true);
    else
        cb(new Error('Solo se permiten imágenes'), false);
};
exports.upload = (0, multer_1.default)({ storage: exports.storage, fileFilter });
//# sourceMappingURL=upload.middleware.js.map