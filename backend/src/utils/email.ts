// Utilidades para enviar emails

import * as nodemailer from 'nodemailer';
import { generarToken } from './jwt';

// Configuración SMTP para producción (compatible con cualquier servidor)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  }
});

export const enviarCodigoVerificacion = async (
  email: string,
  codigo: string
): Promise<boolean> => {
  try {
    console.log(`[EMAIL] 📧 Enviando código de verificación a: ${email}`);
    
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@devprojects.com';
    const fromName = process.env.SMTP_FROM_NAME || 'DevProjects';
    
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Código de verificación - DevProjects',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 DevProjects</h1>
            </div>
            <div class="content">
              <h2>¡Bienvenido a DevProjects!</h2>
              <p>Gracias por registrarte. Para completar tu registro, utiliza el siguiente código de verificación:</p>
              <div class="code">${codigo}</div>
              <p><strong>⏰ Este código expira en 1 hora.</strong></p>
              <p>Si no solicitaste este código, puedes ignorar este correo de forma segura.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DevProjects. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    console.log(`[EMAIL] ✅ Correo enviado exitosamente. Message ID: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error('[EMAIL] ❌ Error enviando correo:');
    console.error('  - Error:', error.message);
    console.error('  - Code:', error.code);
    console.error('  - Response:', error.response);
    return false;
  }
};

export const generarCodigoVerificacion = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
