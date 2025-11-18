// Controlador de autenticación - Maneja registro, login y verificación

import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { UsuarioRequest } from '../middleware/auth.middleware';
import { RegistroRequest, VerificacionRequest, LoginRequest, ApiResponse } from '../types';
import {
  validarEmail,
  validarContraseña,
  validarNombre,
  validarFechaNacimiento,
  validarCodigoVerificacion,
} from '../utils/validators';
import { generarToken } from '../utils/jwt';
import {
  generarCodigoVerificacion,
  enviarCodigoVerificacion,
} from '../utils/email';

const prisma = new PrismaClient();

// 1. REGISTRO - El usuario se registra con email, nombre, fecha y contraseña
export const registro = async (
  req: UsuarioRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, nombre, fechaNacimiento, password, passwordConfirm } =
      req.body as RegistroRequest;

    // Validar que todos los campos estén presentes
    if (!email || !nombre || !fechaNacimiento || !password || !passwordConfirm) {
      res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos',
      } as ApiResponse<null>);
      return;
    }

    // Validar email
    if (!validarEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Email no válido',
      } as ApiResponse<null>);
      return;
    }

    // Validar nombre
    if (!validarNombre(nombre)) {
      res.status(400).json({
        success: false,
        message: 'Nombre debe tener entre 2 y 50 caracteres',
      } as ApiResponse<null>);
      return;
    }

    // Validar fecha de nacimiento
    if (!validarFechaNacimiento(fechaNacimiento)) {
      res.status(400).json({
        success: false,
        message: 'Debes ser mayor de 18 años',
      } as ApiResponse<null>);
      return;
    }

    // Validar contraseña
    if (!validarContraseña(password)) {
      res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres',
      } as ApiResponse<null>);
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== passwordConfirm) {
      res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden',
      } as ApiResponse<null>);
      return;
    }

    // Verificar que el email no exista
    const usuarioExistente = await prisma.user.findUnique({ where: { email } });
    if (usuarioExistente) {
      res.status(400).json({
        success: false,
        message: 'El email ya está registrado',
      } as ApiResponse<null>);
      return;
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Generar código de verificación
    const codigoVerificacion = generarCodigoVerificacion();

    // Crear usuario
    const usuario = await prisma.user.create({
      data: {
        email,
        nombre,
        fechaNacimiento: new Date(fechaNacimiento),
        password: passwordHash,
        codigoVerificacion,
        verificado: false,
      },
    });

    // Enviar email con código
    await enviarCodigoVerificacion(email, codigoVerificacion);

    res.status(201).json({
      success: true,
      message: 'Registro exitoso. Verifica tu email para continuar',
      data: { email: usuario.email },
    } as ApiResponse<{ email: string }>);
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
    } as ApiResponse<null>);
  }
};

// 2. VERIFICACIÓN - El usuario ingresa el código de verificación recibido por email
export const verificar = async (
  req: UsuarioRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, codigo } = req.body as VerificacionRequest;

    // Validar campos
    if (!email || !codigo) {
      res.status(400).json({
        success: false,
        message: 'Email y código requeridos',
      } as ApiResponse<null>);
      return;
    }

    // Validar código
    if (!validarCodigoVerificacion(codigo)) {
      res.status(400).json({
        success: false,
        message: 'Código no válido',
      } as ApiResponse<null>);
      return;
    }

    // Buscar usuario
    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      } as ApiResponse<null>);
      return;
    }

    // Validar código
    if (usuario.codigoVerificacion !== codigo) {
      res.status(400).json({
        success: false,
        message: 'Código incorrecto',
      } as ApiResponse<null>);
      return;
    }

    // Marcar como verificado
    await prisma.user.update({
      where: { email },
      data: {
        verificado: true,
        codigoVerificacion: null,
      },
    });

    res.json({
      success: true,
      message: 'Email verificado correctamente. Puedes iniciar sesión',
    } as ApiResponse<null>);
  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar email',
    } as ApiResponse<null>);
  }
};

// 3. LOGIN - El usuario inicia sesión con email y contraseña
export const login = async (
  req: UsuarioRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validar campos
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email y contraseña requeridos',
      } as ApiResponse<null>);
      return;
    }

    // Buscar usuario
    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario) {
      res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos',
      } as ApiResponse<null>);
      return;
    }

    // Verificar que el email está verificado
    if (!usuario.verificado) {
      res.status(403).json({
        success: false,
        message: 'Por favor verifica tu email antes de iniciar sesión',
      } as ApiResponse<null>);
      return;
    }

    // Comparar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos',
      } as ApiResponse<null>);
      return;
    }

    // Generar token
    const token = generarToken({ id: usuario.id, email: usuario.email });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          perfilCompleto: !!usuario.descripcion,
        },
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
    } as ApiResponse<null>);
  }
};
