"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerUsuarioPublico = exports.searchUsers = exports.configurarPerfil = exports.obtenerPerfil = exports.actualizarCuenta = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const actualizarCuenta = async (req, res) => {
    try {
        if (!req.usuarioId) {
            res.status(401).json({ message: "No autorizado" });
            return;
        }
        const { nombre, apellido, email, currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.usuarioId } });
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }
        const dataToUpdate = {};
        if (nombre)
            dataToUpdate.nombre = nombre;
        if (apellido)
            dataToUpdate.apellido = apellido;
        if (email)
            dataToUpdate.email = email;
        // Lógica de cambio de contraseña
        if (newPassword && currentPassword) {
            const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isMatch) {
                res.status(400).json({ success: false, message: "Contraseña actual incorrecta" });
                return;
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            dataToUpdate.password = await bcryptjs_1.default.hash(newPassword, salt);
        }
        await prisma.user.update({
            where: { id: req.usuarioId },
            data: dataToUpdate
        });
        res.json({ success: true, message: "Cuenta actualizada correctamente" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error al actualizar cuenta" });
    }
};
exports.actualizarCuenta = actualizarCuenta;
// Obtener perfil (Perfil privado del usuario logueado)
const obtenerPerfil = async (req, res) => {
    try {
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
                redesSociales: true,
                rol: true // Agregado rol por si acaso
            },
        });
        if (!usuario) {
            res.status(404).json({ success: false, message: "Usuario no encontrado" });
            return;
        }
        res.json({
            success: true,
            message: "Perfil obtenido correctamente",
            data: {
                ...usuario,
                tecnologias: usuario.tecnologias ? JSON.parse(usuario.tecnologias) : [],
                lenguajes: usuario.lenguajes ? JSON.parse(usuario.lenguajes) : [],
                redesSociales: usuario.redesSociales ? JSON.parse(usuario.redesSociales) : {},
            },
        });
    }
    catch (error) {
        console.error("Error obteniendo perfil:", error);
        res.status(500).json({ success: false, message: "Error al obtener perfil" });
    }
};
exports.obtenerPerfil = obtenerPerfil;
// Configurar perfil con imagen
const configurarPerfil = async (req, res) => {
    try {
        if (!req.usuarioId) {
            res.status(401).json({ success: false, message: "Usuario no autenticado" });
            return;
        }
        const { descripcion, tecnologias, lenguajes, informacionExtra, rol, redesSociales } = req.body;
        // Validación condicional
        const esIngeniero = rol === 'ingeniero';
        if (esIngeniero) {
            if (!descripcion || descripcion.length < 10) {
                res.status(400).json({ success: false, message: "La descripción debe tener al menos 10 caracteres" });
                return;
            }
        }
        else {
            if (!descripcion) {
                res.status(400).json({ success: false, message: "La descripción es requerida" });
                return;
            }
        }
        // NOTA: Eliminé el bloque if redundante que estaba aquí y rompía la lógica para usuarios normales
        let fotoPerfil;
        if (req.file) {
            fotoPerfil = `/uploads/${req.file.filename}`;
        }
        const usuarioActualizado = await prisma.user.update({
            where: { id: req.usuarioId },
            data: {
                descripcion,
                rol: rol || undefined,
                tecnologias: tecnologias ? JSON.stringify(JSON.parse(tecnologias)) : undefined,
                lenguajes: lenguajes ? JSON.stringify(JSON.parse(lenguajes)) : undefined,
                redesSociales: redesSociales ? JSON.stringify(JSON.parse(redesSociales)) : undefined,
                informacionExtra,
                fotoPerfil: fotoPerfil || undefined,
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
                redesSociales: true,
                rol: true
            },
        });
        res.json({
            success: true,
            message: "Perfil actualizado correctamente",
            data: {
                ...usuarioActualizado,
                tecnologias: usuarioActualizado.tecnologias ? JSON.parse(usuarioActualizado.tecnologias) : [],
                lenguajes: usuarioActualizado.lenguajes ? JSON.parse(usuarioActualizado.lenguajes) : [],
                redesSociales: usuarioActualizado.redesSociales ? JSON.parse(usuarioActualizado.redesSociales) : {},
            },
        });
    }
    catch (error) {
        console.error("Error configurando perfil:", error);
        res.status(500).json({ success: false, message: "Error al configurar perfil" });
    }
};
exports.configurarPerfil = configurarPerfil;
// Buscar usuarios
const searchUsers = async (req, res) => {
    try {
        const { search, tecnologias } = req.query;
        const where = {
            activo: true,
        };
        if (search) {
            where.OR = [
                { nombre: { contains: String(search) } },
                { apellido: { contains: String(search) } },
                { descripcion: { contains: String(search) } },
            ];
        }
        if (tecnologias) {
            where.tecnologias = { contains: String(tecnologias) };
        }
        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                nombre: true,
                apellido: true,
                fotoPerfil: true,
                descripcion: true,
                tecnologias: true,
                rol: true,
                informacionExtra: true,
            },
            take: 20,
        });
        const formattedUsers = users.map((user) => ({
            ...user,
            tecnologias: user.tecnologias ? JSON.parse(user.tecnologias) : [],
        }));
        res.json(formattedUsers);
    }
    catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ message: "Error searching users" });
    }
};
exports.searchUsers = searchUsers;
// Obtener perfil público (Este es el que fallaba)
const obtenerUsuarioPublico = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                fotoPerfil: true,
                descripcion: true,
                tecnologias: true,
                lenguajes: true,
                informacionExtra: true,
                rol: true,
                createdAt: true,
                redesSociales: true // ✅ AGREGADO: Esto faltaba
            },
        });
        if (!usuario) {
            res.status(404).json({ success: false, message: "Usuario no encontrado" });
            return;
        }
        res.json({
            success: true,
            data: {
                ...usuario,
                tecnologias: usuario.tecnologias ? JSON.parse(usuario.tecnologias) : [],
                lenguajes: usuario.lenguajes ? JSON.parse(usuario.lenguajes) : [],
                redesSociales: usuario.redesSociales ? JSON.parse(usuario.redesSociales) : {}, // ✅ AGREGADO: Esto también
            },
        });
    }
    catch (error) {
        console.error("Error obteniendo usuario público:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
};
exports.obtenerUsuarioPublico = obtenerUsuarioPublico;
//# sourceMappingURL=user.controller.js.map