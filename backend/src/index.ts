import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import friendRoutes from './routes/friend.routes'; // 👈 AGREGAR ESTO
import notificationRoutes from './routes/notification.routes'

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
app.use('/api/friends', friendRoutes); // 👈 AGREGAR ESTO IMPORTANTE
app.use('/api/notifications', notificationRoutes); // 👈 REGISTRAR

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'DevProject API funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 API lista en http://localhost:${PORT}/api`);
});

export default app;