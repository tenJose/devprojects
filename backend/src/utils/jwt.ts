// Utilidades para manejar JWT tokens

import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { TokenPayload } from '../types';

const SECRET: string = process.env.JWT_SECRET || 'secreto_por_defecto';
const EXPIRATION: string = process.env.JWT_EXPIRATION || '7d';

export const generarToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: EXPIRATION as any,
  };
  return jwt.sign(payload, SECRET, options);
};

export const verificarToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const obtenerIdDelToken = (authHeader: string | undefined): number | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verificarToken(token);
  return payload?.id || null;
};
