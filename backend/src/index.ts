import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import messageRoutes from './routes/message.routes';
import friendRoutes from './routes/friend.routes'; // 👈 AGREGAR ESTO
import aiRoutes from './routes/ai.routes';
import notificationRoutes from './routes/notification.routes'
import postulacionRoutes from './routes/postulacion.routes';
import ratingRoutes from './routes/rating.routes'; // ✅ NUEVO
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

// Lista de orígenes permitidos (añade tu dominio de producción)
const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:62884',
  'https://devproject.mnz.dom.my.id',
  process.env.FRONTEND_URL // Permitir URL desde .env
].filter(Boolean); // Eliminar valores undefined

// Middleware CORS dinámico
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman, curl, mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS bloqueó origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos con CORS
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path, stat) => {
    const origin = res.req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
  }
}));

// Log para debug
app.use((req, res, next) => {
  console.log(`[v0] ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendRoutes); // 👈 AGREGAR ESTO IMPORTANTE
app.use('/api/notifications', notificationRoutes); // 👈 REGISTRAR
app.use('/api/postulaciones', postulacionRoutes);
app.use('/api/ratings', ratingRoutes); // ✅ NUEVO
app.use('/api/ai', aiRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'DevProject API funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 API lista en http://localhost:${PORT}/api`);
  // Periodic cleanup: delete projects where fechaLimite has passed
  const cleanupExpired = async () => {
    try {
      const now = new Date();
      const expired = await prisma.proyecto.findMany({ where: { fechaLimite: { lt: now }, estado: 'activo' } });
      if (expired && expired.length) {
        const ids = expired.map(p => p.id);
        console.log(`🗑 Eliminando proyectos expirados: ${ids.join(', ')}`);
        await prisma.proyecto.deleteMany({ where: { id: { in: ids } } });
      }
    } catch (err) {
      console.error('Error cleaning expired projects:', err);
    }
  };

  // Run once at startup, then every hour
  cleanupExpired();
  setInterval(cleanupExpired, 1000 * 60 * 60);
});

export default app;