"use strict";
// Controlador de usuarios - Maneja configuración de perfil y obtener datos
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurarPerfil = exports.obtenerPerfil = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// Obtener datos del usuario autenticado
var obtenerPerfil = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var usuario, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.usuarioId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado',
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.user.findUnique({
                        where: { id: req.usuarioId },
                        select: {
                            id: true,
                            email: true,
                            nombre: true,
                            fotoPerfil: true,
                            descripcion: true,
                            tecnologias: true,
                            lenguajes: true,
                            informacionExtra: true,
                            verificado: true,
                        },
                    })];
            case 1:
                usuario = _a.sent();
                if (!usuario) {
                    res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado',
                    });
                    return [2 /*return*/];
                }
                res.json({
                    success: true,
                    message: 'Perfil obtenido correctamente',
                    data: __assign(__assign({}, usuario), { tecnologias: usuario.tecnologias ? JSON.parse(usuario.tecnologias) : [], lenguajes: usuario.lenguajes ? JSON.parse(usuario.lenguajes) : [] }),
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error obteniendo perfil:', error_1);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener perfil',
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.obtenerPerfil = obtenerPerfil;
// Configurar perfil del usuario (primera vez después de verificación)
var configurarPerfil = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, fotoPerfil, descripcion, tecnologias, lenguajes, informacionExtra, usuarioActualizado, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                if (!req.usuarioId) {
                    res.status(401).json({
                        success: false,
                        message: 'Usuario no autenticado',
                    });
                    return [2 /*return*/];
                }
                _a = req.body, fotoPerfil = _a.fotoPerfil, descripcion = _a.descripcion, tecnologias = _a.tecnologias, lenguajes = _a.lenguajes, informacionExtra = _a.informacionExtra;
                // Validar que descripción tenga al menos 10 caracteres
                if (descripcion && descripcion.length < 10) {
                    res.status(400).json({
                        success: false,
                        message: 'La descripción debe tener al menos 10 caracteres',
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.user.update({
                        where: { id: req.usuarioId },
                        data: {
                            fotoPerfil: fotoPerfil || undefined,
                            descripcion: descripcion || undefined,
                            tecnologias: tecnologias ? JSON.stringify(tecnologias) : undefined,
                            lenguajes: lenguajes ? JSON.stringify(lenguajes) : undefined,
                            informacionExtra: informacionExtra || undefined,
                        },
                        select: {
                            id: true,
                            email: true,
                            nombre: true,
                            fotoPerfil: true,
                            descripcion: true,
                            tecnologias: true,
                            lenguajes: true,
                            informacionExtra: true,
                        },
                    })];
            case 1:
                usuarioActualizado = _b.sent();
                res.json({
                    success: true,
                    message: 'Perfil actualizado correctamente',
                    data: __assign(__assign({}, usuarioActualizado), { tecnologias: usuarioActualizado.tecnologias
                            ? JSON.parse(usuarioActualizado.tecnologias)
                            : [], lenguajes: usuarioActualizado.lenguajes
                            ? JSON.parse(usuarioActualizado.lenguajes)
                            : [] }),
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                console.error('Error configurando perfil:', error_2);
                res.status(500).json({
                    success: false,
                    message: 'Error al configurar perfil',
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.configurarPerfil = configurarPerfil;
