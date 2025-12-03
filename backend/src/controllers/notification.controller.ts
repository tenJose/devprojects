import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UsuarioRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const marcarNotificacionLeida = async (req: UsuarioRequest, res: Response): Promise<void> => {
  try {
    const userId = req.usuarioId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    await prisma.notificacion.update({
      where: { id: Number(id), usuarioId: userId },
      data: { leido: true }
    });

    res.json({ success: true, message: "Notificación marcada como leída" });
  } catch (error) {
    console.error("Error marcando notificación:", error);
    res.status(500).json({ message: "Error al marcar notificación" });
  }
};

export const obtenerNotificaciones = async (req: UsuarioRequest, res: Response): Promise<void> => {
  try {
    const userId = req.usuarioId;
    if (!userId) {
       res.status(401).json({ message: "No autorizado" });
       return;
    }

    // 1. Buscar solicitudes de amistad pendientes recibidas
    const solicitudesAmistad = await prisma.amistad.findMany({
      where: {
        receptorId: userId,
        estado: 'pendiente'
      },
      include: {
        solicitante: {
          select: { id: true, nombre: true, apellido: true, fotoPerfil: true }
        }
      }
    });

    // 2. Buscar postulaciones a mis proyectos (mostrar todas, marcar estado)
    const postulacionesRecibidas = await prisma.postulacion.findMany({
      where: {
        proyecto: {
          usuarioCreadorId: userId
        }
      },
      include: {
        proyecto: { select: { id: true, nombre: true } },
        usuario: { select: { id: true, nombre: true, apellido: true, fotoPerfil: true } }
      },
      orderBy: { fechaPostulacion: 'desc' }
    });

    // Mapeamos para que el frontend reciba "titulo" aunque la DB diga "nombre"
    const postulacionesFormateadas = postulacionesRecibidas.map(p => ({
      ...p,
      proyecto: {
        ...p.proyecto,
        titulo: p.proyecto.nombre // Adaptador para el frontend
      }
    }));

    // 3. Buscar notificaciones del sistema (postulaciones aceptadas, etc.)
    const notificacionesSistema = await prisma.notificacion.findMany({
      where: {
        usuarioId: userId,
        leido: false
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('[Notifications] userId:', userId);
    console.log('[Notifications] Solicitudes amistad:', solicitudesAmistad.length);
    console.log('[Notifications] Postulaciones:', postulacionesFormateadas.length);
    console.log('[Notifications] Sistema:', notificacionesSistema.length);

    res.json({
      success: true,
      data: {
        amistades: solicitudesAmistad,
        postulaciones: postulacionesFormateadas,
        sistema: notificacionesSistema
      }
    });

  } catch (error) {
    console.error("Error obteniendo notificaciones:", error);
    res.status(500).json({ message: "Error al obtener notificaciones" });
  }
};