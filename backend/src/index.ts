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
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static('uploads', {
  setHeaders: (res) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
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
app.use('/api/ai', aiRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'DevProject API funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 API lista en http://localhost:${PORT}/api`);
  
  // Marcar proyectos como expirados cuando pase la fechaLimite
  const markExpiredProjects = async () => {
    try {
      const now = new Date();
      const expired = await prisma.proyecto.findMany({ 
        where: { 
          fechaLimite: { lt: now }, 
          estado: 'activo' 
        } 
      });
      
      if (expired && expired.length) {
        const ids = expired.map(p => p.id);
        console.log(`⏰ Marcando proyectos como expirados: ${ids.join(', ')}`);
        await prisma.proyecto.updateMany({ 
          where: { id: { in: ids } },
          data: { estado: 'expirado' }
        });
      }
    } catch (err) {
      console.error('Error marcando proyectos expirados:', err);
    }
  };

  // Ejecutar al iniciar y luego cada hora
  markExpiredProjects();
  setInterval(markExpiredProjects, 1000 * 60 * 60);
});

export default app;