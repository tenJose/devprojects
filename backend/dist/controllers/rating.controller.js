"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectsToRate = exports.getUserActiveProjects = exports.getUserCompletedProjects = exports.getUserRatings = exports.rateProject = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ Calificar un proyecto (solo el creador puede calificar al ingeniero)
const rateProject = async (req, res) => {
    try {
        const { id } = req.params; // ID del proyecto
        const { calificadorId, puntuacion, comentario } = req.body;
        // Validar puntuación
        if (puntuacion < 1 || puntuacion > 5) {
            return res.status(400).json({ error: 'La puntuación debe estar entre 1 y 5' });
        }
        const proyecto = await prisma.proyecto.findUnique({
            where: { id: Number(id) },
            include: {
                usuarioCreador: true,
                usuarioAsignado: true
            }
        });
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
    }
    catch (error) {
        console.error('Error rating project:', error);
        // Manejar error de calificación duplicada
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Ya has calificado este proyecto' });
        }
        res.status(500).json({ error: 'Error al enviar calificación' });
    }
};
exports.rateProject = rateProject;
// ✅ Obtener calificaciones de un usuario
const getUserRatings = async (req, res) => {
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
            ? calificaciones.reduce((sum, c) => sum + c.puntuacion, 0) / calificaciones.length
            : 0;
        res.json({
            success: true,
            data: {
                promedio: parseFloat(promedio.toFixed(1)),
                totalCalificaciones: calificaciones.length,
                calificaciones
            }
        });
    }
    catch (error) {
        console.error('Error getting user ratings:', error);
        res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
};
exports.getUserRatings = getUserRatings;
// ✅ Obtener proyectos completados de un usuario
const getUserCompletedProjects = async (req, res) => {
    try {
        const { id } = req.params; // ID del usuario
        const proyectosCompletados = await prisma.proyecto.findMany({
            where: {
                usuarioAsignadoId: Number(id),
                estadoFinalizacion: 'finalizado'
            },
            include: {
                usuarioCreador: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        fotoPerfil: true
                    }
                },
                calificaciones: {
                    where: {
                        calificadoId: Number(id)
                    }
                }
            },
            orderBy: { fechaFinalizacion: 'desc' }
        });
        res.json({
            success: true,
            data: proyectosCompletados
        });
    }
    catch (error) {
        console.error('Error getting completed projects:', error);
        res.status(500).json({ error: 'Error al obtener proyectos completados' });
    }
};
exports.getUserCompletedProjects = getUserCompletedProjects;
// ✅ Obtener proyectos en curso de un usuario
const getUserActiveProjects = async (req, res) => {
    try {
        const { id } = req.params; // ID del usuario
        const proyectosActivos = await prisma.proyecto.findMany({
            where: {
                usuarioAsignadoId: Number(id),
                estadoFinalizacion: { not: 'finalizado' },
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
        });
        res.json({
            success: true,
            data: proyectosActivos
        });
    }
    catch (error) {
        console.error('Error getting active projects:', error);
        res.status(500).json({ error: 'Error al obtener proyectos activos' });
    }
};
exports.getUserActiveProjects = getUserActiveProjects;
// ✅ NUEVO: Verificar proyectos finalizados entre dos usuarios que pueden ser calificados
const getProjectsToRate = async (req, res) => {
    try {
        const { creatorId, engineerId } = req.query;
        if (!creatorId || !engineerId) {
            return res.status(400).json({ error: 'Se requieren ambos IDs' });
        }
        // Buscar proyectos finalizados donde creatorId es el creador y engineerId es el asignado
        const proyectos = await prisma.proyecto.findMany({
            where: {
                usuarioCreadorId: Number(creatorId),
                usuarioAsignadoId: Number(engineerId),
                estadoFinalizacion: 'finalizado'
            },
            include: {
                calificaciones: {
                    where: {
                        calificadorId: Number(creatorId),
                        calificadoId: Number(engineerId)
                    }
                }
            },
            orderBy: { fechaFinalizacion: 'desc' }
        });
        // Filtrar solo proyectos que NO han sido calificados
        const proyectosSinCalificar = proyectos.filter(p => p.calificaciones.length === 0);
        res.json({
            success: true,
            data: {
                proyectosFinalizados: proyectos.length,
                proyectosSinCalificar: proyectosSinCalificar.length,
                proyectos: proyectos.map(p => ({
                    id: p.id,
                    nombre: p.nombre,
                    fechaFinalizacion: p.fechaFinalizacion,
                    yaCalificado: p.calificaciones.length > 0
                }))
            }
        });
    }
    catch (error) {
        console.error('Error getting projects to rate:', error);
        res.status(500).json({ error: 'Error al obtener proyectos para calificar' });
    }
};
exports.getProjectsToRate = getProjectsToRate;
//# sourceMappingURL=rating.controller.js.map