// Utilidades para enviar emails

import * as nodemailer from 'nodemailer';
import { generarToken } from './jwt';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const enviarCodigoVerificacion = async (
  email: string,
  codigo: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Código de verificación - DevProjects',
      html: `
        <h2>Bienvenido a DevProjects</h2>
        <p>Tu código de verificación es: <strong>${codigo}</strong></p>
        <p>Este código expira en 1 hora.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
};

export const generarCodigoVerificacion = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
