import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
// ✅ Importamos la interfaz correcta
import { UsuarioRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Enviar solicitud de amistad
export const enviarSolicitud = async (req: UsuarioRequest, res: Response): Promise<void> => {
  try {
    const solicitanteId = req.usuarioId; // Ahora TS reconoce esto
    const { friendId } = req.body;

    console.log('[Friend Request] solicitanteId:', solicitanteId, 'friendId:', friendId, 'body:', req.body);

    if (!solicitanteId || !friendId) {
      res.status(400).json({ error: "Faltan datos", details: { solicitanteId, friendId } });
      return; // ✅ Usamos return vacío para cumplir con Promise<void>
    }

    if (solicitanteId === friendId) {
      res.status(400).json({ error: "No puedes agregarte a ti mismo" });
      return;
    }

    // Verificar si ya existe relación activa (pendiente o aceptada)
    const existe = await prisma.amistad.findFirst({
      where: {
        OR: [
          { solicitanteId, receptorId: friendId },
          { solicitanteId: friendId, receptorId: solicitanteId }
        ],
        estado: {
          in: ['pendiente', 'aceptado']
        }
      }
    });

    if (existe) {
      if (existe.estado === 'aceptado') {
        res.status(400).json({ error: "Ya son amigos" });
      } else {
        res.status(400).json({ error: "Ya existe una solicitud pendiente" });
      }
      return;
    }

    // Si hubo una solicitud rechazada anterior, eliminarla para permitir nueva solicitud
    await prisma.amistad.deleteMany({
      where: {
        OR: [
          { solicitanteId, receptorId: friendId },
          { solicitanteId: friendId, receptorId: solicitanteId }
        ],
        estado: 'rechazado'
      }
    });

    const nuevaAmistad = await prisma.amistad.create({
      data: {
        solicitanteId,
        receptorId: friendId,
        estado: 'pendiente'
      }
    });

    res.json({ success: true, amistad: nuevaAmistad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al enviar solicitud" });
  }
};

// Responder a una solicitud (Aceptar o Rechazar)
export const responderSolicitud = async (req: UsuarioRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.usuarioId; // ID del usuario autenticado (tú)
    const { friendshipId, estado } = req.body; // ID de la solicitud y nuevo estado ('aceptado' o 'rechazado')

    if (!usuarioId || !friendshipId || !estado) {
      res.status(400).json({ error: "Faltan datos" });
      return;
    }

    // Validar que el estado sea válido
    if (estado !== 'aceptado' && estado !== 'rechazado') {
      res.status(400).json({ error: "Estado inválido" });
      return;
    }

    // 1. Buscar la solicitud
    const amistad = await prisma.amistad.findUnique({
      where: { id: Number(friendshipId) }
    });

    if (!amistad) {
      res.status(404).json({ error: "Solicitud no encontrada" });
      return;
    }

    // 2. SEGURIDAD: Verificar que quien responde es el RECEPTOR de la solicitud
    if (amistad.receptorId !== usuarioId) {
      res.status(403).json({ error: "No tienes permiso para responder a esta solicitud" });
      return;
    }

    // 3. Actualizar el estado
    // Si se rechaza, podríamos optar por borrarla (delete) o solo marcarla como rechazado.
    // Aquí actualizamos el estado:
    const amistadActualizada = await prisma.amistad.update({
      where: { id: Number(friendshipId) },
      data: { estado: estado }
    });

    res.json({ success: true, amistad: amistadActualizada });

  } catch (error) {
    console.error("Error al responder solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Verificar estado de amistad
export const verificarEstado = async (req: UsuarioRequest, res: Response): Promise<void> => {
  try {
    const miId = req.usuarioId;
    const friendId = parseInt(req.params.friendId);

    if (!miId || isNaN(friendId)) {
       res.status(400).json({ error: "IDs inválidos" });
       return;
    }

    const amistad = await prisma.amistad.findFirst({
      where: {
        OR: [
          { solicitanteId: miId, receptorId: friendId },
          { solicitanteId: friendId, receptorId: miId }
        ]
      }
    });

    if (!amistad) {
       res.json({ status: null });
       return;
    }

    // Si está aceptada, es 'aceptado'. Si está pendiente, ver quién la mandó
    res.json({ 
      status: amistad.estado, 
      esSolicitante: amistad.solicitanteId === miId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error verificando estado" });
  }

  
};