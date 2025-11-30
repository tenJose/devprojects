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
