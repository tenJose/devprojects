"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postulacion_controller_1 = require("../controllers/postulacion.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Ruta para crear la postulación (POST /api/postulaciones)
router.post('/', auth_middleware_1.autenticar, postulacion_controller_1.createPostulacion);
// Ruta para responder (PUT /api/postulaciones/:id/responder)
router.put('/:id/responder', auth_middleware_1.autenticar, postulacion_controller_1.responderPostulacion);
exports.default = router;
//# sourceMappingURL=postulacion.routes.js.map