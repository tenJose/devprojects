"use strict";
// Middleware para proteger rutas que requieren autenticación
Object.defineProperty(exports, "__esModule", { value: true });
exports.autenticar = void 0;
const jwt_1 = require("../utils/jwt");
const autenticar = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const usuarioId = (0, jwt_1.obtenerIdDelToken)(authHeader);
    if (!usuarioId) {
        res.status(401).json({
            success: false,
            message: 'Token no válido o expirado',
        });
        return;
    }
    req.usuarioId = usuarioId;
    next();
};
exports.autenticar = autenticar;
//# sourceMappingURL=auth.middleware.js.map