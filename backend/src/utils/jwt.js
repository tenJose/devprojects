"use strict";
// Utilidades para manejar JWT tokens
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerIdDelToken = exports.verificarToken = exports.generarToken = void 0;
var jwt = require("jsonwebtoken");
var SECRET = process.env.JWT_SECRET || 'secreto_por_defecto';
var EXPIRATION = process.env.JWT_EXPIRATION || '7d';
var generarToken = function (payload) {
    var options = {
        expiresIn: EXPIRATION,
    };
    return jwt.sign(payload, SECRET, options);
};
exports.generarToken = generarToken;
var verificarToken = function (token) {
    try {
        return jwt.verify(token, SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verificarToken = verificarToken;
var obtenerIdDelToken = function (authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    var token = authHeader.substring(7);
    var payload = (0, exports.verificarToken)(token);
    return (payload === null || payload === void 0 ? void 0 : payload.id) || null;
};
exports.obtenerIdDelToken = obtenerIdDelToken;
