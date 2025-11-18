// Middleware para proteger rutas que requieren autenticación

import { Request, Response, NextFunction } from 'express';
import { obtenerIdDelToken } from '../utils/jwt';

export interface UsuarioRequest extends Request {
  usuarioId?: number;
}

export const autenticar = (
  req: UsuarioRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const usuarioId = obtenerIdDelToken(authHeader);

  if (!usuarioId) {
    res.status(401).json({
      success: false,
      message: 'Token no válido o expirado',
    });
    return;
  }

  req.usuarioId = usuarioId;
  next();
};
