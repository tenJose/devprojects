"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.sendMessage = exports.getMessages = exports.getConversations = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all conversations for the logged-in user
const getConversations = async (req, res) => {
    try {
        const userId = req.usuarioId;
        if (!userId) {
            return res.status(401).json({ mensaje: "No autorizado" });
        }
        const messages = await prisma.mensaje.findMany({
            where: {
                OR: [{ remitente: userId }, { destinatario: userId }],
            },
            orderBy: { createdAt: "desc" },
            include: {
                usuarioRemitente: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        fotoPerfil: true,
                    },
                },
                usuarioDestinatario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        fotoPerfil: true,
                    },
                },
                proyecto: {
                    select: {
                        id: true,
                        nombre: true,
                        usuarioCreadorId: true,
                        usuarioAsignadoId: true,
                        estadoFinalizacion: true,
                    },
                },
            },
        });
        const conversationsMap = new Map();
        messages.forEach((msg) => {
            const otherUserId = msg.remitente === userId ? msg.destinatario : msg.remitente;
            // Include proyectoId in the conversation key to separate project-based conversations
            const conversationKey = msg.proyectoId
                ? `${[userId, otherUserId].sort().join("-")}-proyecto-${msg.proyectoId}`
                : [userId, otherUserId].sort().join("-");
            if (!conversationsMap.has(conversationKey)) {
                const otherUser = msg.remitente === userId
                    ? msg.usuarioDestinatario
                    : msg.usuarioRemitente;
                conversationsMap.set(conversationKey, {
                    conversacionId: conversationKey,
                    otherUser: {
                        id: otherUser.id,
                        nombre: otherUser.nombre,
                        apellido: otherUser.apellido,
                        fotoPerfil: otherUser.fotoPerfil,
                    },
                    proyecto: msg.proyecto,
                    ultimoMensaje: msg.contenido,
                    fecha: msg.createdAt,
                    leido: msg.destinatario === userId ? msg.leido : true,
                    mensajesNoLeidos: 0,
                });
            }
            if (msg.destinatario === userId && !msg.leido) {
                const conv = conversationsMap.get(conversationKey);
                conv.mensajesNoLeidos++;
            }
        });
        const conversations = Array.from(conversationsMap.values());
        res.json(conversations);
    }
    catch (error) {
        console.error("Error al obtener conversaciones:", error);
        res.status(500).json({ mensaje: "Error al obtener conversaciones" });
    }
};
exports.getConversations = getConversations;
// Get messages for a specific conversation
const getMessages = async (req, res) => {
    try {
        const userId = req.usuarioId;
        const { otherUserId } = req.params;
        const { proyectoId } = req.query; // Optional: filter by project
        if (!userId) {
            return res.status(401).json({ mensaje: "No autorizado" });
        }
        const whereClause = {
            OR: [
                { remitente: userId, destinatario: Number(otherUserId) },
                { remitente: Number(otherUserId), destinatario: userId },
            ],
        };
        // If proyectoId is provided, filter messages for that specific project conversation
        if (proyectoId) {
            whereClause.proyectoId = Number(proyectoId);
        }
        const messages = await prisma.mensaje.findMany({
            where: whereClause,
            orderBy: { createdAt: "asc" },
            include: {
                usuarioRemitente: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        fotoPerfil: true,
                    },
                },
            },
        });
        const markReadClause = {
            remitente: Number(otherUserId),
            destinatario: userId,
            leido: false,
        };
        if (proyectoId) {
            markReadClause.proyectoId = Number(proyectoId);
        }
        await prisma.mensaje.updateMany({
            where: markReadClause,
            data: { leido: true },
        });
        res.json(messages);
    }
    catch (error) {
        console.error("Error al obtener mensajes:", error);
        res.status(500).json({ mensaje: "Error al obtener mensajes" });
    }
};
exports.getMessages = getMessages;
// Send a new message
const sendMessage = async (req, res) => {
    try {
        const userId = req.usuarioId;
        const { destinatario, contenido, proyectoId } = req.body;
        if (!userId) {
            return res.status(401).json({ mensaje: "No autorizado" });
        }
        if (!destinatario || !contenido) {
            return res
                .status(400)
                .json({ mensaje: "Destinatario y contenido son requeridos" });
        }
        const conversacionId = [userId, destinatario].sort().join("-");
        const nuevoMensaje = await prisma.mensaje.create({
            data: {
                remitente: userId,
                destinatario,
                contenido,
                proyectoId: proyectoId || null,
                conversacionId,
                leido: false,
            },
            include: {
                usuarioRemitente: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        fotoPerfil: true,
                    },
                },
            },
        });
        res.status(201).json(nuevoMensaje);
    }
    catch (error) {
        console.error("Error al enviar mensaje:", error);
        res.status(500).json({ mensaje: "Error al enviar mensaje" });
    }
};
exports.sendMessage = sendMessage;
// Mark messages as read
const markAsRead = async (req, res) => {
    try {
        const userId = req.usuarioId;
        const { otherUserId } = req.params;
        if (!userId) {
            return res.status(401).json({ mensaje: "No autorizado" });
        }
        await prisma.mensaje.updateMany({
            where: {
                remitente: Number(otherUserId),
                destinatario: userId,
                leido: false,
            },
            data: { leido: true },
        });
        res.json({ mensaje: "Mensajes marcados como leídos" });
    }
    catch (error) {
        console.error("Error al marcar mensajes como leídos:", error);
        res.status(500).json({ mensaje: "Error al marcar mensajes como leídos" });
    }
};
exports.markAsRead = markAsRead;
//# sourceMappingURL=message.controller.js.map