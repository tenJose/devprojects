// Configuración de JWT para autenticación
// JWT es un token seguro que se envía al cliente para mantenerlo autenticado

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_aqui';

// Función para crear un token JWT
export const createToken = (usuarioId) => {
  return jwt.sign({ id: usuarioId }, JWT_SECRET, { expiresIn: '7d' });
};

// Función para verificar un token JWT
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export default JWT_SECRET;
