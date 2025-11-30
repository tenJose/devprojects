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

    if (!solicitanteId || !friendId) {
      res.status(400).json({ error: "Faltan datos" });
      return; // ✅ Usamos return vacío para cumplir con Promise<void>
    }

    if (solicitanteId === friendId) {
      res.status(400).json({ error: "No puedes agregarte a ti mismo" });
      return;
    }

    // Verificar si ya existe relación
    const existe = await prisma.amistad.findFirst({
      where: {
        OR: [
          { solicitanteId, receptorId: friendId },
          { solicitanteId: friendId, receptorId: solicitanteId }
        ]
      }
    });

    if (existe) {
      res.status(400).json({ error: "Ya existe una solicitud o amistad" });
      return;
    }

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