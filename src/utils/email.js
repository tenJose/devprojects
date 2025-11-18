// Servicio de envío de emails
// Aquí configuramos nodemailer para enviar correos de verificación

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configurar el transportador de email
// IMPORTANTE: Debes configurar variables de entorno para tu servicio de email
const transporter = nodemailer.createTransport({
  service: 'gmail', // o el servicio que uses
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Función para enviar código de verificación
export const enviarCodigoVerificacion = async (email, codigo) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Tu código de verificación - DevProjects',
      html: `
        <h2>Verifica tu correo electrónico</h2>
        <p>Tu código de verificación es: <strong>${codigo}</strong></p>
        <p>Este código expira en 15 minutos.</p>
      `
    });
    console.log('Email enviado a:', email);
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
};

export default enviarCodigoVerificacion;
