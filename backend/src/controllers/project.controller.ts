import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function safeParseArrayField(field: any): any[] {
  if (!field) return []
  if (Array.isArray(field)) return field
  if (typeof field === 'string') {
    // Try JSON parse first
    try {
      const parsed = JSON.parse(field)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch (e) {
      // Fallback: comma-separated
      if (field.includes(',')) return field.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      return [field]
    }
  }
  return []
}

// backend/src/controllers/project.controller.ts

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { search, tecnologias, tipoProyecto, presupuestoMin, presupuestoMax } = req.query

    const where: any = {
      estado: "activo",
    }

    if (search) {
      where.OR = [
        { nombre: { contains: String(search) } }, 
        { descripcion: { contains: String(search) } }
      ]
    }

    if (tecnologias) {
      // Búsqueda simple de texto en el string JSON
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

    // ELIMINADA LA SEGUNDA CONSULTA REDUNDANTE

    const proyectos = await prisma.proyecto.findMany({
      where, 
      orderBy: { createdAt: "desc" },
      include: {
        usuarioCreador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            fotoPerfil: true, 
          },
        },
      },
    })

    const proyectosFormateados = proyectos.map((proyecto) => ({
      id: proyecto.id,
      titulo: proyecto.nombre,
      descripcion: proyecto.descripcion,
      tipo_proyecto: proyecto.tipoProyecto || "Desarrollo",
      tecnologias: safeParseArrayField(proyecto.tecnologias),
      presupuesto: proyecto.presupuesto ? proyecto.presupuesto.toString() : null,
      presupuesto_tipo: proyecto.presupuestoTipo || "Fixed Price",
      duracion_estimada: proyecto.duracionEstimada || null,
      ubicacion: proyecto.ubicacion || "Remote",
      fecha_limite: proyecto.fechaLimite || null,
      tamano_equipo: proyecto.tamanoEquipo || null,
      adjuntos: safeParseArrayField(proyecto.adjuntos),
      datos_adicionales: proyecto.datosAdicionales || null,
      fecha_creacion: proyecto.createdAt,
      destacado: proyecto.destacado,
      // Importante: Estandarizamos a 'creador'
      creador: proyecto.usuarioCreador
        ? {
            nombre: `${proyecto.usuarioCreador.nombre} ${proyecto.usuarioCreador.apellido || ""}`.trim(),
            id: proyecto.usuarioCreador.id,
            fotoPerfil: proyecto.usuarioCreador.fotoPerfil,
          }
        : null,
      usuarioCreadorId: proyecto.usuarioCreadorId // Necesario para validar permisos de edición
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
      tecnologias: safeParseArrayField(proyecto.tecnologias),
      presupuesto: proyecto.presupuesto ? proyecto.presupuesto.toString() : null,
      presupuesto_tipo: proyecto.presupuestoTipo || "Fixed Price",
      duracion_estimada: proyecto.duracionEstimada || null,
      ubicacion: proyecto.ubicacion || "Remote",
      fecha_limite: proyecto.fechaLimite || null,
      tamano_equipo: proyecto.tamanoEquipo || null,
      adjuntos: safeParseArrayField(proyecto.adjuntos),
      datos_adicionales: proyecto.datosAdicionales || null,
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
      nombre,
      descripcion,
      tecnologias,
      tipoProyecto,
      presupuesto,
      presupuestoTipo,
      duracionEstimada,
      ubicacion,
      usuarioCreadorId,
      fechaLimite,
      tamanoEquipo,
      adjuntos,
      datosAdicionales,
    } = req.body

    const userId = Number(usuarioCreadorId)

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        error: "usuarioCreadorId es inválido o no fue enviado",
      })
    }

    const nuevoProyecto = await prisma.proyecto.create({
      data: {
        nombre,
        descripcion,
        tecnologias: Array.isArray(tecnologias) ? JSON.stringify(tecnologias) : (tecnologias || JSON.stringify([])),
        tipoProyecto: tipoProyecto || "Desarrollo",
        presupuesto: presupuesto ? Number.parseFloat(presupuesto) : null,
        presupuestoTipo: presupuestoTipo || "Fixed Price",
        duracionEstimada: duracionEstimada || null,
        ubicacion: ubicacion || "Remote",
        fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
        tamanoEquipo: tamanoEquipo ? String(tamanoEquipo).substring(0, 255) : null,
        adjuntos: adjuntos ? (Array.isArray(adjuntos) ? JSON.stringify(adjuntos) : adjuntos) : null,
        datosAdicionales: datosAdicionales || null,
        estado: "activo",
        usuarioCreadorId: userId,
      },
    })

    res.status(201).json(nuevoProyecto)
  } catch (error) {
    console.error("Error al crear proyecto:", error)
    res.status(500).json({ error: "Error al crear proyecto" })
  }
}

/*export const createProject = async (req: Request, res: Response) => {
  try {
    const {
      nombre,
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
        nombre: nombre,
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
}*/

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
      fechaLimite,
      tamanoEquipo,
      adjuntos,
      datosAdicionales,
    } = req.body

    const updateData: any = {}

    if (titulo) updateData.nombre = titulo
    if (descripcion) updateData.descripcion = descripcion
    if (tecnologias) updateData.tecnologias = Array.isArray(tecnologias) ? JSON.stringify(tecnologias) : tecnologias
    if (estado) updateData.estado = estado
    if (tipoProyecto) updateData.tipoProyecto = tipoProyecto
    if (presupuesto) updateData.presupuesto = Number.parseFloat(presupuesto)
    if (presupuestoTipo) updateData.presupuestoTipo = presupuestoTipo
    if (duracionEstimada) updateData.duracionEstimada = duracionEstimada
    if (ubicacion) updateData.ubicacion = ubicacion
    if (fechaLimite) updateData.fechaLimite = new Date(fechaLimite)
    if (tamanoEquipo) updateData.tamanoEquipo = tamanoEquipo
    if (adjuntos) updateData.adjuntos = Array.isArray(adjuntos) ? JSON.stringify(adjuntos) : adjuntos
    if (datosAdicionales) updateData.datosAdicionales = datosAdicionales

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

export const uploadProjectFiles = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!req.files) return res.status(400).json({ error: 'No files uploaded' })

    const files: any[] = Array.isArray(req.files) ? req.files : Object.values(req.files as any)
    const storedPaths = files.map(f => `/${(f as any).path.replace(/\\/g, '/').replace(/^uploads\//, 'uploads/')}`)

    // Fetch existing project
    const proyecto = await prisma.proyecto.findUnique({ where: { id: Number.parseInt(id) } })
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' })

    const existing = proyecto.adjuntos ? (Array.isArray(proyecto.adjuntos) ? proyecto.adjuntos : JSON.parse(proyecto.adjuntos as string)) : []
    const combined = [...existing, ...storedPaths]

    const updated = await prisma.proyecto.update({
      where: { id: Number.parseInt(id) },
      data: { adjuntos: JSON.stringify(combined) }
    })

    res.json({ success: true, adjuntos: combined })
  } catch (error) {
    console.error('Error uploading files:', error)
    res.status(500).json({ error: 'Error subiendo archivos' })
  }
}


