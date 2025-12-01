import { Response, Request } from "express"
import { PrismaClient } from "@prisma/client"
import { UsuarioRequest } from "../middleware/auth.middleware"
import { ApiResponse } from "../types"
import bcrypt from 'bcryptjs'; // Asegúrate de tener instalado bcryptjs

const prisma = new PrismaClient()

export const actualizarCuenta = async (req: UsuarioRequest, res: Response): Promise<void> => {
  try {
    if (!req.usuarioId) { res.status(401).json({ message: "No autorizado" }); return; }

    const { nombre, apellido, email, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.usuarioId } });
    if (!user) { res.status(404).json({ message: "Usuario no encontrado" }); return; }

    const dataToUpdate: any = {};
    if (nombre) dataToUpdate.nombre = nombre;
    if (apellido) dataToUpdate.apellido = apellido;
    if (email) dataToUpdate.email = email;

    // Lógica de cambio de contraseña
    if (newPassword && currentPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password); // Asumiendo que el campo se llama password
        if (!isMatch) {
             res.status(400).json({ success: false, message: "Contraseña actual incorrecta" });
             return;
        }
        const salt = await bcrypt.genSalt(10);
        dataToUpdate.password = await bcrypt.hash(newPassword, salt);
    }

    await prisma.user.update({
        where: { id: req.usuarioId },
        data: dataToUpdate
    });

    res.json({ success: true, message: "Cuenta actualizada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al actualizar cuenta" });
  }
}

// Obtener perfil
export const obtenerPerfil = async (req: UsuarioRequest, res: Response): Promise<void> => {
  try {
    if (!req.usuarioId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" } as ApiResponse<null>)
      return
    }

    const usuario = await prisma.user.findUnique({
      where: { id: req.usuarioId },
      select: {
        id: true,
        email: true,
        nombre: true,
        fotoPerfil: true,
        descripcion: true,
        tecnologias: true,
        lenguajes: true,
        informacionExtra: true,
        verificado: true,
      },
    })

    if (!usuario) {
      res.status(404).json({ success: false, message: "Usuario no encontrado" } as ApiResponse<null>)
      return
    }

    res.json({
      success: true,
      message: "Perfil obtenido correctamente",
      data: {
        ...usuario,
        tecnologias: usuario.tecnologias ? JSON.parse(usuario.tecnologias) : [],
        lenguajes: usuario.lenguajes ? JSON.parse(usuario.lenguajes) : [],
      },
    })
  } catch (error) {
    console.error("Error obteniendo perfil:", error)
    res.status(500).json({ success: false, message: "Error al obtener perfil" } as ApiResponse<null>)
  }
}

// Configurar perfil con imagen
export const configurarPerfil = async (req: UsuarioRequest, res: Response): Promise<void> => {
  try {
    if (!req.usuarioId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" } as ApiResponse<null>)
      return
    }

    const { descripcion, tecnologias, lenguajes, informacionExtra } = req.body

    if (!descripcion || descripcion.length < 10) {
      res.status(400).json({ success: false, message: "La descripción debe tener al menos 10 caracteres" })
      return
    }

    let fotoPerfil
    if (req.file) {
      fotoPerfil = `/uploads/${req.file.filename}`
    }

    const usuarioActualizado = await prisma.user.update({
      where: { id: req.usuarioId },
      data: {
        descripcion,
        tecnologias: tecnologias ? JSON.stringify(JSON.parse(tecnologias)) : undefined,
        lenguajes: lenguajes ? JSON.stringify(JSON.parse(lenguajes)) : undefined,
        informacionExtra,
        fotoPerfil: fotoPerfil || undefined,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        fotoPerfil: true,
        descripcion: true,
        tecnologias: true,
        lenguajes: true,
        informacionExtra: true,
      },
    })

    res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      data: {
        ...usuarioActualizado,
        tecnologias: usuarioActualizado.tecnologias ? JSON.parse(usuarioActualizado.tecnologias) : [],
        lenguajes: usuarioActualizado.lenguajes ? JSON.parse(usuarioActualizado.lenguajes) : [],
      },
    })
  } catch (error) {
    console.error("Error configurando perfil:", error)
    res.status(500).json({ success: false, message: "Error al configurar perfil" })
  }
}

// Buscar usuarios
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, tecnologias } = req.query

    const where: any = {
      activo: true,
    }

    if (search) {
      where.OR = [
        { nombre: { contains: String(search) } },
        { apellido: { contains: String(search) } },
        { descripcion: { contains: String(search) } },
      ]
    }

    if (tecnologias) {
      where.tecnologias = { contains: String(tecnologias) }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        fotoPerfil: true,
        descripcion: true,
        tecnologias: true,
        rol: true,
        informacionExtra: true, // Assuming you might add location later or use informacionExtra
      },
      take: 20,
    })

    const formattedUsers = users.map((user) => ({
      ...user,
      tecnologias: user.tecnologias ? JSON.parse(user.tecnologias) : [],
    }))

    res.json(formattedUsers)
  } catch (error) {
    console.error("Error searching users:", error)
    res.status(500).json({ message: "Error searching users" })
  }

}

export const obtenerUsuarioPublico = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const usuario = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        fotoPerfil: true,
        descripcion: true,
        tecnologias: true,
        lenguajes: true,
        informacionExtra: true,
        rol: true,
        createdAt: true
      },
    });

    if (!usuario) {
      res.status(404).json({ success: false, message: "Usuario no encontrado" } as ApiResponse<null>);
      return;
    }

    res.json({
      success: true,
      data: {
        ...usuario,
        tecnologias: usuario.tecnologias ? JSON.parse(usuario.tecnologias) : [],
        lenguajes: usuario.lenguajes ? JSON.parse(usuario.lenguajes) : [],
      },
    });
  } catch (error) {
    console.error("Error obteniendo usuario público:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
}
