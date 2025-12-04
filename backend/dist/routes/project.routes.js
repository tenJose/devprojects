"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const upload_middleware_1 = require("../middleware/upload.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.autenticar, project_controller_1.getAllProjects);
router.get('/:id', auth_middleware_1.autenticar, project_controller_1.getProjectById);
router.post('/', auth_middleware_1.autenticar, project_controller_1.createProject);
router.put('/:id', auth_middleware_1.autenticar, project_controller_1.updateProject);
router.delete('/:id', auth_middleware_1.autenticar, project_controller_1.deleteProject);
// Upload attachments for a project (multiple images)
router.post('/:id/upload', auth_middleware_1.autenticar, upload_middleware_1.upload.array('files', 10), project_controller_1.uploadProjectFiles);
// ✅ NUEVAS RUTAS: Finalización de proyectos
router.post('/:id/request-completion', auth_middleware_1.autenticar, project_controller_1.requestProjectCompletion);
router.post('/:id/confirm-completion', auth_middleware_1.autenticar, project_controller_1.confirmProjectCompletion);
router.get('/:id/completion-status', auth_middleware_1.autenticar, project_controller_1.getCompletionStatus);
exports.default = router;
//# sourceMappingURL=project.routes.js.map