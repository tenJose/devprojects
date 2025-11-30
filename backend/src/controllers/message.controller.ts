import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { UsuarioRequest } from "../middleware/auth.middleware"; // ajusta la ruta


const prisma = new PrismaClient();

// Get all conversations for the logged-in user
export const getConversations = async (req: UsuarioRequest, res: Response) => {
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
          },
        },
      },
    });

    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const otherUserId =
        msg.remitente === userId ? msg.destinatario : msg.remitente;
      const conversationId = [userId, otherUserId].sort().join("-");

      if (!conversationsMap.has(conversationId)) {
        const otherUser =
          msg.remitente === userId
            ? msg.usuarioDestinatario
            : msg.usuarioRemitente;

        conversationsMap.set(conversationId, {
          conversacionId: conversationId,
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
        const conv = conversationsMap.get(conversationId);
        conv.mensajesNoLeidos++;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (error) {
    console.error("Error al obtener conversaciones:", error);
    res.status(500).json({ mensaje: "Error al obtener conversaciones" });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req: UsuarioRequest, res: Response) => {
  try {
    const userId = req.usuarioId;
    const { otherUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ mensaje: "No autorizado" });
    }

    const messages = await prisma.mensaje.findMany({
      where: {
        OR: [
          { remitente: userId, destinatario: Number(otherUserId) },
          { remitente: Number(otherUserId), destinatario: userId },
        ],
      },
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

    await prisma.mensaje.updateMany({
      where: {
        remitente: Number(otherUserId),
        destinatario: userId,
        leido: false,
      },
      data: { leido: true },
    });

    res.json(messages);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ mensaje: "Error al obtener mensajes" });
  }
};

// Send a new message
export const sendMessage = async (req: UsuarioRequest, res: Response) => {
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
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({ mensaje: "Error al enviar mensaje" });
  }
};

// Mark messages as read
export const markAsRead = async (req: UsuarioRequest, res: Response) => {
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
  } catch (error) {
    console.error("Error al marcar mensajes como leídos:", error);
    res.status(500).json({ mensaje: "Error al marcar mensajes como leídos" });
  }
};