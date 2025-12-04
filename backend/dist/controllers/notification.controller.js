"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerNotificaciones = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const obtenerNotificaciones = async (req, res) => {
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
        // 3. Buscar notificaciones de finalización de proyectos
        const notificacionesFinalizacion = await prisma.notificacion.findMany({
            where: {
                usuarioId: userId,
                tipo: { in: ['solicitud_finalizacion', 'respuesta_finalizacion', 'solicitud_calificacion'] },
                leido: false
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: {
                amistades: solicitudesAmistad,
                postulaciones: postulacionesFormateadas,
                finalizaciones: notificacionesFinalizacion
            }
        });
    }
    catch (error) {
        console.error("Error obteniendo notificaciones:", error);
        res.status(500).json({ message: "Error al obtener notificaciones" });
    }
};
exports.obtenerNotificaciones = obtenerNotificaciones;
//# sourceMappingURL=notification.controller.js.map