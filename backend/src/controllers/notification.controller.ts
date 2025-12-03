import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UsuarioRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

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

    res.json({
      success: true,
      data: {
        amistades: solicitudesAmistad,
        postulaciones: postulacionesFormateadas
      }
    });

  } catch (error) {
    console.error("Error obteniendo notificaciones:", error);
    res.status(500).json({ message: "Error al obtener notificaciones" });
  }
};