"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rating_controller_1 = require("../controllers/rating.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Calificar un proyecto
router.post('/:id/rate', auth_middleware_1.autenticar, rating_controller_1.rateProject);
// Obtener calificaciones de un usuario
router.get('/users/:id/ratings', rating_controller_1.getUserRatings);
// Obtener proyectos completados de un usuario
router.get('/users/:id/completed', rating_controller_1.getUserCompletedProjects);
// Obtener proyectos activos de un usuario
router.get('/users/:id/active', rating_controller_1.getUserActiveProjects);
// ✅ NUEVO: Obtener proyectos que pueden ser calificados
router.get('/projects-to-rate', rating_controller_1.getProjectsToRate);
exports.default = router;
//# sourceMappingURL=rating.routes.js.map