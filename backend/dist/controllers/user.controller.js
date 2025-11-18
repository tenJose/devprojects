"use strict";
// Controlador de usuarios - Maneja configuración de perfil y obtener datos
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurarPerfil = exports.obtenerPerfil = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Obtener datos del usuario autenticado
const obtenerPerfil = async (req, res) => {
    try {
        if (!req.usuarioId) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
            return;
        }
        const usuario = await prisma.user.findUnique({
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
        });
        if (!usuario) {
            res.status(404).json({
                success: false,
                message: 'Usuario no encontrado',
            });
            return;
        }
        res.json({
            success: true,
            message: 'Perfil obtenido correctamente',
            data: {
                ...usuario,
                tecnologias: usuario.tecnologias ? JSON.parse(usuario.tecnologias) : [],
                lenguajes: usuario.lenguajes ? JSON.parse(usuario.lenguajes) : [],
            },
        });
    }
    catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil',
        });
    }
};
exports.obtenerPerfil = obtenerPerfil;
// Configurar perfil del usuario (primera vez después de verificación)
const configurarPerfil = async (req, res) => {
    try {
        if (!req.usuarioId) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
            return;
        }
        const { fotoPerfil, descripcion, tecnologias, lenguajes, informacionExtra } = req.body;
        // Validar que descripción tenga al menos 10 caracteres
        if (descripcion && descripcion.length < 10) {
            res.status(400).json({
                success: false,
                message: 'La descripción debe tener al menos 10 caracteres',
            });
            return;
        }
        // Actualizar usuario
        const usuarioActualizado = await prisma.user.update({
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
        });
        res.json({
            success: true,
            message: 'Perfil actualizado correctamente',
            data: {
                ...usuarioActualizado,
                tecnologias: usuarioActualizado.tecnologias
                    ? JSON.parse(usuarioActualizado.tecnologias)
                    : [],
                lenguajes: usuarioActualizado.lenguajes
                    ? JSON.parse(usuarioActualizado.lenguajes)
                    : [],
            },
        });
    }
    catch (error) {
        console.error('Error configurando perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al configurar perfil',
        });
    }
};
exports.configurarPerfil = configurarPerfil;
//# sourceMappingURL=user.controller.js.map