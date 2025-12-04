"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
// Rutas protegidas
router.get("/perfil", auth_middleware_1.autenticar, user_controller_1.obtenerPerfil);
router.put("/configurar", auth_middleware_1.autenticar, upload_middleware_1.upload.single("fotoPerfil"), user_controller_1.configurarPerfil);
router.get("/search", auth_middleware_1.autenticar, user_controller_1.searchUsers);
router.put("/cuenta", auth_middleware_1.autenticar, user_controller_1.actualizarCuenta);
// Rutas públicas (o semi-públicas)
router.get("/:id", auth_middleware_1.autenticar, user_controller_1.obtenerUsuarioPublico);
exports.default = router;
//# sourceMappingURL=user.routes.js.map