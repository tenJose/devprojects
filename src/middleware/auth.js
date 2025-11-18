// Middleware de autenticación
// Verifica que el usuario tenga un token válido antes de acceder a rutas protegidas

import { verifyToken } from '../config/jwt.js';

export const authMiddleware = (req, res, next) => {
  // El token viene en el header Authorization como "Bearer token"
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Guardamos el ID del usuario en req para usarlo después
  req.usuarioId = decoded.id;
  next();
};
