import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPostulacion = async (req: Request, res: Response) => {
  try {
    const { usuarioId, proyectoId, mensaje, propuesta, presupuestoPropuesto } = req.body;

    // Validar que el usuario no sea el creador del proyecto
    const proyecto = await prisma.proyecto.findUnique({ where: { id: proyectoId } });
    if (!proyecto) return res.status(404).json({ error: "Proyecto no encontrado" });
    if (proyecto.usuarioCreadorId === usuarioId) {
      return res.status(400).json({ error: "No puedes postularte a tu propio proyecto" });
    }

    

    // Evitar postulaciones duplicadas
    const existing = await prisma.postulacion.findUnique({
      where: { usuarioId_proyectoId: { usuarioId, proyectoId } },
    });
    if (existing) return res.status(400).json({ error: "Ya te has postulado a este proyecto" });

    const nuevaPostulacion = await prisma.postulacion.create({
      data: {
        usuarioId,
        proyectoId,
        mensaje,
        propuesta,
        presupuestoPropuesto,
      },
    });

    res.status(201).json(nuevaPostulacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al postularse" });
  }

  
};

// backend/src/controllers/postulacion.controller.ts

// ... imports existentes

export const responderPostulacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID de la postulación
    const { estado } = req.body; // 'aceptado' o 'rechazado'

    if (!['aceptado', 'rechazado'].includes(estado)) {
        return res.status(400).json({ error: "Estado inválido" });
    }

    const postulacion = await prisma.postulacion.update({
        where: { id: Number(id) },
        data: { 
            estado: estado,
            fechaRespuesta: new Date()
        }
    });

    // Opcional: Aquí podrías crear una notificación para el usuario que se postuló
    // await prisma.notificacion.create(...)

    res.json({ message: `Postulación ${estado} correctamente`, postulacion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al responder postulación" });
  }
};
