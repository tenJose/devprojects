"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responderPostulacion = exports.createPostulacion = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createPostulacion = async (req, res) => {
    try {
        const { usuarioId, proyectoId, mensaje, propuesta, presupuestoPropuesto } = req.body;
        // Validar que el usuario no sea el creador del proyecto
        const proyecto = await prisma.proyecto.findUnique({ where: { id: proyectoId } });
        if (!proyecto)
            return res.status(404).json({ error: "Proyecto no encontrado" });
        if (proyecto.usuarioCreadorId === usuarioId) {
            return res.status(400).json({ error: "No puedes postularte a tu propio proyecto" });
        }
        // Verificar si el usuario ya se postuló a este proyecto
        const postulacionExistente = await prisma.postulacion.findFirst({
            where: {
                usuarioId: usuarioId,
                proyectoId: proyectoId
            }
        });
        if (postulacionExistente) {
            return res.status(400).json({
                success: false,
                error: "Ya te has postulado a este proyecto anteriormente"
            });
        }
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al postularse" });
    }
};
exports.createPostulacion = createPostulacion;
// backend/src/controllers/postulacion.controller.ts
// ... imports existentes
const responderPostulacion = async (req, res) => {
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
            },
            include: {
                usuario: true,
                proyecto: true
            }
        });
        // Si se acepta, asignar el usuario al proyecto
        if (estado === 'aceptado') {
            await prisma.proyecto.update({
                where: { id: postulacion.proyectoId },
                data: {
                    usuarioAsignadoId: postulacion.usuarioId,
                    estado: 'en_progreso'
                }
            });
        }
        // Crear notificación para el usuario que se postuló
        await prisma.notificacion.create({
            data: {
                usuarioId: postulacion.usuarioId,
                tipo: 'postulacion',
                mensaje: `Tu postulación al proyecto "${postulacion.proyecto.nombre}" ha sido ${estado}`,
                referenciaId: postulacion.proyectoId
            }
        });
        res.json({ message: `Postulación ${estado} correctamente`, postulacion });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al responder postulación" });
    }
};
exports.responderPostulacion = responderPostulacion;
//# sourceMappingURL=postulacion.controller.js.map