import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ Calificar un proyecto (solo el creador puede calificar al ingeniero)
export const rateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID del proyecto
    const { calificadorId, puntuacion, comentario } = req.body;

    // Validar puntuación
    if (puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ error: 'La puntuación debe estar entre 1 y 5' });
    }

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: Number(id) }
    }) as any;

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Verificar que el proyecto esté finalizado
    if (proyecto.estadoFinalizacion !== 'finalizado') {
      return res.status(400).json({ error: 'Solo puedes calificar proyectos finalizados' });
    }

    // Verificar que quien califica sea el creador del proyecto
    if (proyecto.usuarioCreadorId !== calificadorId) {
      return res.status(403).json({ error: 'Solo el creador del proyecto puede calificar' });
    }

    // Verificar que haya un usuario asignado
    if (!proyecto.usuarioAsignadoId) {
      return res.status(400).json({ error: 'No hay ingeniero asignado a este proyecto' });
    }

    // Crear la calificación
    const calificacion = await prisma.proyectoCalificacion.create({
      data: {
        proyectoId: Number(id),
        calificadorId: calificadorId,
        calificadoId: proyecto.usuarioAsignadoId,
        puntuacion: puntuacion,
        comentario: comentario || null
      },
      include: {
        calificador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            fotoPerfil: true
          }
        },
        proyecto: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    // Notificar al ingeniero calificado
    await prisma.notificacion.create({
      data: {
        usuarioId: proyecto.usuarioAsignadoId,
        tipo: 'calificacion',
        mensaje: `Has recibido una calificación de ${puntuacion} estrellas por el proyecto "${proyecto.nombre}"`,
        referenciaId: proyecto.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Calificación enviada correctamente',
      calificacion
    });
  } catch (error: any) {
    console.error('Error rating project:', error);
    
    // Manejar error de calificación duplicada
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya has calificado este proyecto' });
    }
    
    res.status(500).json({ error: 'Error al enviar calificación' });
  }
};

// ✅ Obtener calificaciones de un usuario
export const getUserRatings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID del usuario

    const calificaciones = await prisma.proyectoCalificacion.findMany({
      where: { calificadoId: Number(id) },
      include: {
        calificador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            fotoPerfil: true
          }
        },
        proyecto: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular promedio
    const promedio = calificaciones.length > 0
      ? calificaciones.reduce((sum: number, c: any) => sum + c.puntuacion, 0) / calificaciones.length
      : 0;

    res.json({
      success: true,
      data: {
        promedio: parseFloat(promedio.toFixed(1)),
        totalCalificaciones: calificaciones.length,
        calificaciones
      }
    });
  } catch (error) {
    console.error('Error getting user ratings:', error);
    res.status(500).json({ error: 'Error al obtener calificaciones' });
  }
};

// ✅ Obtener proyectos completados de un usuario
export const getUserCompletedProjects = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID del usuario

    const proyectosCompletados = await prisma.proyecto.findMany({
      where: {
        estado: 'completado'
      },
      include: {
        usuarioCreador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            fotoPerfil: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) as any[];

    // Filtrar por usuario asignado
    const proyectosFiltrados = proyectosCompletados.filter((p: any) => p.usuarioAsignadoId === Number(id));

    res.json({
      success: true,
      data: proyectosFiltrados
    });
  } catch (error) {
    console.error('Error getting completed projects:', error);
    res.status(500).json({ error: 'Error al obtener proyectos completados' });
  }
};

// ✅ Obtener proyectos en curso de un usuario
export const getUserActiveProjects = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID del usuario

    const proyectosActivos = await prisma.proyecto.findMany({
      where: {
        estado: { not: 'cancelado' }
      },
      include: {
        usuarioCreador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            fotoPerfil: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) as any[];

    // Filtrar por usuario asignado y estado
    const proyectosFiltrados = proyectosActivos.filter((p: any) => 
      p.usuarioAsignadoId === Number(id) && 
      p.estadoFinalizacion !== 'finalizado'
    );

    res.json({
      success: true,
      data: proyectosFiltrados
    });
  } catch (error) {
    console.error('Error getting active projects:', error);
    res.status(500).json({ error: 'Error al obtener proyectos activos' });
  }
};

// ✅ NUEVO: Verificar proyectos finalizados entre dos usuarios que pueden ser calificados
export const getProjectsToRate = async (req: Request, res: Response) => {
  try {
    const { creatorId, engineerId } = req.query;

    if (!creatorId || !engineerId) {
      return res.status(400).json({ error: 'Se requieren ambos IDs' });
    }

    // Buscar proyectos finalizados donde creatorId es el creador y engineerId es el asignado
    const proyectos = await prisma.proyecto.findMany({
      where: {
        usuarioCreadorId: Number(creatorId),
        estado: 'completado'
      },
      orderBy: { createdAt: 'desc' }
    }) as any[];

    // Filtrar por usuario asignado y estado de finalización
    const proyectosFiltrados = proyectos.filter((p: any) => 
      p.usuarioAsignadoId === Number(engineerId) && 
      p.estadoFinalizacion === 'finalizado'
    );

    // Obtener calificaciones para estos proyectos
    const calificaciones = await prisma.$queryRaw`
      SELECT proyectoId 
      FROM proyecto_calificaciones 
      WHERE calificadorId = ${Number(creatorId)} 
      AND calificadoId = ${Number(engineerId)}
    ` as any[];

    // Mapear proyectos con información de calificación
    const proyectosIds = calificaciones.map((c: any) => c.proyectoId);
    const proyectosConInfo = proyectosFiltrados.map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      fechaFinalizacion: p.fechaFinalizacion || p.updatedAt,
      yaCalificado: proyectosIds.includes(p.id)
    }));

    const proyectosSinCalificar = proyectosConInfo.filter(p => !p.yaCalificado);

    res.json({
      success: true,
      data: {
        proyectosFinalizados: proyectosConInfo.length,
        proyectosSinCalificar: proyectosSinCalificar.length,
        proyectos: proyectosConInfo
      }
    });
  } catch (error) {
    console.error('Error getting projects to rate:', error);
    res.status(500).json({ error: 'Error al obtener proyectos para calificar' });
  }
};
