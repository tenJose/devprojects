"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const friend_controller_1 = require("../controllers/friend.controller");
const router = (0, express_1.Router)();
// Usamos 'autenticar' en lugar de 'verificarToken'
router.post('/request', auth_middleware_1.autenticar, friend_controller_1.enviarSolicitud);
router.get('/status/:friendId', auth_middleware_1.autenticar, friend_controller_1.verificarEstado);
router.put('/respond', auth_middleware_1.autenticar, friend_controller_1.responderSolicitud);
exports.default = router;
//# sourceMappingURL=friend.routes.js.map