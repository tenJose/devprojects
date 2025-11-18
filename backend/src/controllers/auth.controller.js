"use strict";
// Controlador de autenticación - Maneja registro, login y verificación
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
exports.login = exports.verificar = exports.registro = void 0;
var bcrypt = require("bcryptjs");
var client_1 = require("@prisma/client");
var validators_1 = require("../utils/validators");
var jwt_1 = require("../utils/jwt");
var email_1 = require("../utils/email");
var prisma = new client_1.PrismaClient();
// 1. REGISTRO - El usuario se registra con email, nombre, fecha y contraseña
var registro = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, nombre, fechaNacimiento, password, passwordConfirm, usuarioExistente, passwordHash, codigoVerificacion, usuario, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, email = _a.email, nombre = _a.nombre, fechaNacimiento = _a.fechaNacimiento, password = _a.password, passwordConfirm = _a.passwordConfirm;
                // Validar que todos los campos estén presentes
                if (!email || !nombre || !fechaNacimiento || !password || !passwordConfirm) {
                    res.status(400).json({
                        success: false,
                        message: 'Todos los campos son requeridos',
                    });
                    return [2 /*return*/];
                }
                // Validar email
                if (!(0, validators_1.validarEmail)(email)) {
                    res.status(400).json({
                        success: false,
                        message: 'Email no válido',
                    });
                    return [2 /*return*/];
                }
                // Validar nombre
                if (!(0, validators_1.validarNombre)(nombre)) {
                    res.status(400).json({
                        success: false,
                        message: 'Nombre debe tener entre 2 y 50 caracteres',
                    });
                    return [2 /*return*/];
                }
                // Validar fecha de nacimiento
                if (!(0, validators_1.validarFechaNacimiento)(fechaNacimiento)) {
                    res.status(400).json({
                        success: false,
                        message: 'Debes ser mayor de 18 años',
                    });
                    return [2 /*return*/];
                }
                // Validar contraseña
                if (!(0, validators_1.validarContraseña)(password)) {
                    res.status(400).json({
                        success: false,
                        message: 'La contraseña debe tener al menos 8 caracteres',
                    });
                    return [2 /*return*/];
                }
                // Validar que las contraseñas coincidan
                if (password !== passwordConfirm) {
                    res.status(400).json({
                        success: false,
                        message: 'Las contraseñas no coinciden',
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.user.findUnique({ where: { email: email } })];
            case 1:
                usuarioExistente = _b.sent();
                if (usuarioExistente) {
                    res.status(400).json({
                        success: false,
                        message: 'El email ya está registrado',
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 2:
                passwordHash = _b.sent();
                codigoVerificacion = (0, email_1.generarCodigoVerificacion)();
                return [4 /*yield*/, prisma.user.create({
                        data: {
                            email: email,
                            nombre: nombre,
                            fechaNacimiento: new Date(fechaNacimiento),
                            password: passwordHash,
                            codigoVerificacion: codigoVerificacion,
                            verificado: false,
                        },
                    })];
            case 3:
                usuario = _b.sent();
                // Enviar email con código
                return [4 /*yield*/, (0, email_1.enviarCodigoVerificacion)(email, codigoVerificacion)];
            case 4:
                // Enviar email con código
                _b.sent();
                res.status(201).json({
                    success: true,
                    message: 'Registro exitoso. Verifica tu email para continuar',
                    data: { email: usuario.email },
                });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                console.error('Error en registro:', error_1);
                res.status(500).json({
                    success: false,
                    message: 'Error al registrar usuario',
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.registro = registro;
// 2. VERIFICACIÓN - El usuario ingresa el código de verificación recibido por email
var verificar = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, codigo, usuario, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, codigo = _a.codigo;
                // Validar campos
                if (!email || !codigo) {
                    res.status(400).json({
                        success: false,
                        message: 'Email y código requeridos',
                    });
                    return [2 /*return*/];
                }
                // Validar código
                if (!(0, validators_1.validarCodigoVerificacion)(codigo)) {
                    res.status(400).json({
                        success: false,
                        message: 'Código no válido',
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.user.findUnique({ where: { email: email } })];
            case 1:
                usuario = _b.sent();
                if (!usuario) {
                    res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado',
                    });
                    return [2 /*return*/];
                }
                // Validar código
                if (usuario.codigoVerificacion !== codigo) {
                    res.status(400).json({
                        success: false,
                        message: 'Código incorrecto',
                    });
                    return [2 /*return*/];
                }
                // Marcar como verificado
                return [4 /*yield*/, prisma.user.update({
                        where: { email: email },
                        data: {
                            verificado: true,
                            codigoVerificacion: null,
                        },
                    })];
            case 2:
                // Marcar como verificado
                _b.sent();
                res.json({
                    success: true,
                    message: 'Email verificado correctamente. Puedes iniciar sesión',
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                console.error('Error en verificación:', error_2);
                res.status(500).json({
                    success: false,
                    message: 'Error al verificar email',
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.verificar = verificar;
// 3. LOGIN - El usuario inicia sesión con email y contraseña
var login = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, usuario, passwordValido, token, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, password = _a.password;
                // Validar campos
                if (!email || !password) {
                    res.status(400).json({
                        success: false,
                        message: 'Email y contraseña requeridos',
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.user.findUnique({ where: { email: email } })];
            case 1:
                usuario = _b.sent();
                if (!usuario) {
                    res.status(401).json({
                        success: false,
                        message: 'Email o contraseña incorrectos',
                    });
                    return [2 /*return*/];
                }
                // Verificar que el email está verificado
                if (!usuario.verificado) {
                    res.status(403).json({
                        success: false,
                        message: 'Por favor verifica tu email antes de iniciar sesión',
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, bcrypt.compare(password, usuario.password)];
            case 2:
                passwordValido = _b.sent();
                if (!passwordValido) {
                    res.status(401).json({
                        success: false,
                        message: 'Email o contraseña incorrectos',
                    });
                    return [2 /*return*/];
                }
                token = (0, jwt_1.generarToken)({ id: usuario.id, email: usuario.email });
                res.json({
                    success: true,
                    message: 'Inicio de sesión exitoso',
                    data: {
                        token: token,
                        usuario: {
                            id: usuario.id,
                            email: usuario.email,
                            nombre: usuario.nombre,
                            perfilCompleto: !!usuario.descripcion,
                        },
                    },
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                console.error('Error en login:', error_3);
                res.status(500).json({
                    success: false,
                    message: 'Error al iniciar sesión',
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
