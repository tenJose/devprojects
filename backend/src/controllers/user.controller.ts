// Controlador de usuarios - Maneja configuración de perfil y obtener datos

import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UsuarioRequest } from '../middleware/auth.middleware';
import { ConfiguracionPerfilRequest, ApiResponse } from '../types';

const prisma = new PrismaClient();

// Obtener datos del usuario autenticado
export const obtenerPerfil = async (
  req: UsuarioRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.usuarioId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      } as ApiResponse<null>);
      return;
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
    });

    if (!usuario) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      } as ApiResponse<null>);
      return;
    }

    res.json({
      success: true,
      message: 'Perfil obtenido correctamente',
      data: {
        ...usuario,
        tecnologias: usuario.tecnologias ? JSON.parse(usuario.tecnologias) : [],
        lenguajes: usuario.lenguajes ? JSON.parse(usuario.lenguajes) : [],
      },
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
    } as ApiResponse<null>);
  }
};

// Configurar perfil del usuario (primera vez después de verificación)
export const configurarPerfil = async (
  req: UsuarioRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.usuarioId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      } as ApiResponse<null>);
      return;
    }

    const { fotoPerfil, descripcion, tecnologias, lenguajes, informacionExtra } =
      req.body as ConfiguracionPerfilRequest;

    // Validar que descripción tenga al menos 10 caracteres
    if (descripcion && descripcion.length < 10) {
      res.status(400).json({
        success: false,
        message: 'La descripción debe tener al menos 10 caracteres',
      } as ApiResponse<null>);
      return;
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.user.update({
      where: { id: req.usuarioId },
      data: {
        fotoPerfil: fotoPerfil || undefined,
        descripcion: descripcion || undefined,
        tecnologias: tecnologias ? JSON.stringify(tecnologias) : undefined,
        lenguajes: lenguajes ? JSON.stringify(lenguajes) : undefined,
        informacionExtra: informacionExtra || undefined,
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
    });

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: {
        ...usuarioActualizado,
        tecnologias: usuarioActualizado.tecnologias
          ? JSON.parse(usuarioActualizado.tecnologias)
          : [],
        lenguajes: usuarioActualizado.lenguajes
          ? JSON.parse(usuarioActualizado.lenguajes)
          : [],
      },
    });
  } catch (error) {
    console.error('Error configurando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al configurar perfil',
    } as ApiResponse<null>);
  }
};
