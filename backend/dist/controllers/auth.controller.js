"use strict";
// Controlador de autenticación - Maneja registro, login y verificación
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.verificar = exports.registro = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const client_1 = require("@prisma/client");
const validators_1 = require("../utils/validators");
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
const prisma = new client_1.PrismaClient();
// 1. REGISTRO - El usuario se registra con email, nombre, fecha y contraseña
const registro = async (req, res) => {
    try {
        const { email, nombre, fechaNacimiento, password, passwordConfirm } = req.body;
        // Validar que todos los campos estén presentes
        if (!email || !nombre || !fechaNacimiento || !password || !passwordConfirm) {
            res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos',
            });
            return;
        }
        // Validar email
        if (!(0, validators_1.validarEmail)(email)) {
            res.status(400).json({
                success: false,
                message: 'Email no válido',
            });
            return;
        }
        // Validar nombre
        if (!(0, validators_1.validarNombre)(nombre)) {
            res.status(400).json({
                success: false,
                message: 'Nombre debe tener entre 2 y 50 caracteres',
            });
            return;
        }
        // Validar fecha de nacimiento
        if (!(0, validators_1.validarFechaNacimiento)(fechaNacimiento)) {
            res.status(400).json({
                success: false,
                message: 'Debes ser mayor de 18 años',
            });
            return;
        }
        // Validar contraseña
        if (!(0, validators_1.validarContraseña)(password)) {
            res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 8 caracteres',
            });
            return;
        }
        // Validar que las contraseñas coincidan
        if (password !== passwordConfirm) {
            res.status(400).json({
                success: false,
                message: 'Las contraseñas no coinciden',
            });
            return;
        }
        // Verificar que el email no exista
        const usuarioExistente = await prisma.user.findUnique({ where: { email } });
        if (usuarioExistente) {
            res.status(400).json({
                success: false,
                message: 'El email ya está registrado',
            });
            return;
        }
        // Encriptar contraseña
        const passwordHash = await bcrypt.hash(password, 10);
        // Generar código de verificación
        const codigoVerificacion = (0, email_1.generarCodigoVerificacion)();
        // Crear usuario
        const usuario = await prisma.user.create({
            data: {
                email,
                nombre,
                fechaNacimiento: new Date(fechaNacimiento),
                password: passwordHash,
                codigoVerificacion,
                verificado: false,
            },
        });
        // Enviar email con código
        await (0, email_1.enviarCodigoVerificacion)(email, codigoVerificacion);
        res.status(201).json({
            success: true,
            message: 'Registro exitoso. Verifica tu email para continuar',
            data: { email: usuario.email },
        });
    }
    catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
        });
    }
};
exports.registro = registro;
// 2. VERIFICACIÓN - El usuario ingresa el código de verificación recibido por email
const verificar = async (req, res) => {
    try {
        const { email, codigo } = req.body;
        // Validar campos
        if (!email || !codigo) {
            res.status(400).json({
                success: false,
                message: 'Email y código requeridos',
            });
            return;
        }
        // Validar código
        if (!(0, validators_1.validarCodigoVerificacion)(codigo)) {
            res.status(400).json({
                success: false,
                message: 'Código no válido',
            });
            return;
        }
        // Buscar usuario
        const usuario = await prisma.user.findUnique({ where: { email } });
        if (!usuario) {
            res.status(404).json({
                success: false,
                message: 'Usuario no encontrado',
            });
            return;
        }
        // Validar código
        if (usuario.codigoVerificacion !== codigo) {
            res.status(400).json({
                success: false,
                message: 'Código incorrecto',
            });
            return;
        }
        // Marcar como verificado
        await prisma.user.update({
            where: { email },
            data: {
                verificado: true,
                codigoVerificacion: null,
            },
        });
        res.json({
            success: true,
            message: 'Email verificado correctamente. Puedes iniciar sesión',
        });
    }
    catch (error) {
        console.error('Error en verificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar email',
        });
    }
};
exports.verificar = verificar;
// 3. LOGIN - El usuario inicia sesión con email y contraseña
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validar campos
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email y contraseña requeridos',
            });
            return;
        }
        // Buscar usuario
        const usuario = await prisma.user.findUnique({ where: { email } });
        if (!usuario) {
            res.status(401).json({
                success: false,
                message: 'Email o contraseña incorrectos',
            });
            return;
        }
        // Verificar que el email está verificado
        if (!usuario.verificado) {
            res.status(403).json({
                success: false,
                message: 'Por favor verifica tu email antes de iniciar sesión',
            });
            return;
        }
        // Comparar contraseña
        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            res.status(401).json({
                success: false,
                message: 'Email o contraseña incorrectos',
            });
            return;
        }
        // Generar token
        const token = (0, jwt_1.generarToken)({ id: usuario.id, email: usuario.email });
        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                token,
                usuario: {
                    id: usuario.id,
                    email: usuario.email,
                    nombre: usuario.nombre,
                    perfilCompleto: !!usuario.descripcion,
                },
            },
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
        });
    }
};
exports.login = login;
//# sourceMappingURL=auth.controller.js.map