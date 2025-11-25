import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { search, tecnologias, tipoProyecto, presupuestoMin, presupuestoMax } = req.query

    const where: any = {
      estado: "activo", // Only show active projects by default
    }

    if (search) {
      where.OR = [{ nombre: { contains: String(search) } }, { descripcion: { contains: String(search) } }]
    }

    if (tecnologias) {
      where.tecnologias = { contains: String(tecnologias) }
    }

    if (tipoProyecto) {
      where.tipoProyecto = String(tipoProyecto)
    }

    if (presupuestoMin || presupuestoMax) {
      where.presupuesto = {}
      if (presupuestoMin) where.presupuesto.gte = Number.parseFloat(String(presupuestoMin))
      if (presupuestoMax) where.presupuesto.lte = Number.parseFloat(String(presupuestoMax))
    }

    const proyectos = await prisma.proyecto.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        usuarioCreador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            fotoPerfil: true, // Added profile picture
          },
        },
      },
    })

    const proyectosFormateados = proyectos.map((proyecto) => ({
      id: proyecto.id,
      titulo: proyecto.nombre,
      descripcion: proyecto.descripcion,
      tipo_proyecto: proyecto.tipoProyecto || "Desarrollo",
      tecnologias: proyecto.tecnologias.split(",").map((t) => t.trim()),
      presupuesto: proyecto.presupuesto ? proyecto.presupuesto.toString() : null,
      presupuesto_tipo: proyecto.presupuestoTipo || "Fixed Price",
      duracion_estimada: proyecto.duracionEstimada || null,
      ubicacion: proyecto.ubicacion || "Remote",
      fecha_creacion: proyecto.createdAt,
      destacado: proyecto.destacado,
      creador: proyecto.usuarioCreador
        ? {
            nombre: `${proyecto.usuarioCreador.nombre} ${proyecto.usuarioCreador.apellido || ""}`.trim(),
            id: proyecto.usuarioCreador.id,
            fotoPerfil: proyecto.usuarioCreador.fotoPerfil, // Added profile picture
          }
        : null,
    }))

    res.json(proyectosFormateados)
  } catch (error) {
    console.error("Error al obtener proyectos:", error)
    res.status(500).json({ error: "Error al obtener proyectos" })
  }
}

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: Number.parseInt(id) },
      include: {
        usuarioCreador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            fotoPerfil: true, // Added profile picture
          },
        },
      },
    })

    if (!proyecto) {
      return res.status(404).json({ error: "Proyecto no encontrado" })
    }

    const proyectoFormateado = {
      id: proyecto.id,
      titulo: proyecto.nombre,
      descripcion: proyecto.descripcion,
      tipo_proyecto: proyecto.tipoProyecto || "Desarrollo",
      tecnologias: proyecto.tecnologias.split(",").map((t) => t.trim()),
      presupuesto: proyecto.presupuesto ? proyecto.presupuesto.toString() : null,
      presupuesto_tipo: proyecto.presupuestoTipo || "Fixed Price",
      duracion_estimada: proyecto.duracionEstimada || null,
      ubicacion: proyecto.ubicacion || "Remote",
      fecha_creacion: proyecto.createdAt,
      estado: proyecto.estado,
      destacado: proyecto.destacado,
      creador: proyecto.usuarioCreador
        ? {
            nombre: `${proyecto.usuarioCreador.nombre} ${proyecto.usuarioCreador.apellido || ""}`.trim(),
            id: proyecto.usuarioCreador.id,
            fotoPerfil: proyecto.usuarioCreador.fotoPerfil, // Added profile picture
          }
        : null,
    }

    res.json(proyectoFormateado)
  } catch (error) {
    console.error("Error al obtener proyecto:", error)
    res.status(500).json({ error: "Error al obtener proyecto" })
  }
}

export const createProject = async (req: Request, res: Response) => {
  try {
    const {
      titulo,
      descripcion,
      tecnologias,
      tipoProyecto,
      presupuesto,
      presupuestoTipo,
      duracionEstimada,
      ubicacion,
      usuarioCreadorId,
    } = req.body

    const nuevoProyecto = await prisma.proyecto.create({
      data: {
        nombre: titulo,
        descripcion,
        tecnologias: Array.isArray(tecnologias) ? tecnologias.join(", ") : tecnologias,
        tipoProyecto: tipoProyecto || "Desarrollo",
        presupuesto: presupuesto ? Number.parseFloat(presupuesto) : null,
        presupuestoTipo: presupuestoTipo || "Fixed Price",
        duracionEstimada: duracionEstimada || null,
        ubicacion: ubicacion || "Remote",
        estado: "activo",
        usuarioCreadorId: Number.parseInt(usuarioCreadorId),
      },
    })

    res.status(201).json(nuevoProyecto)
  } catch (error) {
    console.error("Error al crear proyecto:", error)
    res.status(500).json({ error: "Error al crear proyecto" })
  }
}

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      titulo,
      descripcion,
      tecnologias,
      estado,
      tipoProyecto,
      presupuesto,
      presupuestoTipo,
      duracionEstimada,
      ubicacion,
    } = req.body

    const updateData: any = {}

    if (titulo) updateData.nombre = titulo
    if (descripcion) updateData.descripcion = descripcion
    if (tecnologias) updateData.tecnologias = Array.isArray(tecnologias) ? tecnologias.join(", ") : tecnologias
    if (estado) updateData.estado = estado
    if (tipoProyecto) updateData.tipoProyecto = tipoProyecto
    if (presupuesto) updateData.presupuesto = Number.parseFloat(presupuesto)
    if (presupuestoTipo) updateData.presupuestoTipo = presupuestoTipo
    if (duracionEstimada) updateData.duracionEstimada = duracionEstimada
    if (ubicacion) updateData.ubicacion = ubicacion

    const proyectoActualizado = await prisma.proyecto.update({
      where: { id: Number.parseInt(id) },
      data: updateData,
    })

    res.json(proyectoActualizado)
  } catch (error) {
    console.error("Error al actualizar proyecto:", error)
    res.status(500).json({ error: "Error al actualizar proyecto" })
  }
}

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    await prisma.proyecto.delete({
      where: { id: Number.parseInt(id) },
    })

    res.json({ message: "Proyecto eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar proyecto:", error)
    res.status(500).json({ error: "Error al eliminar proyecto" })
  }
}
