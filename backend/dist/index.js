"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const friend_routes_1 = __importDefault(require("./routes/friend.routes")); // 👈 AGREGAR ESTO
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const postulacion_routes_1 = __importDefault(require("./routes/postulacion.routes"));
const rating_routes_1 = __importDefault(require("./routes/rating.routes")); // ✅ NUEVO
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Lista de orígenes permitidos (añade tu dominio de producción)
const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:62884',
    'https://devproject.mnz.dom.my.id',
    process.env.FRONTEND_URL // Permitir URL desde .env
].filter(Boolean); // Eliminar valores undefined
// Middleware CORS dinámico
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir requests sin origin (como Postman, curl, mobile apps)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.warn(`⚠️ CORS bloqueó origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Servir archivos estáticos con CORS
app.use('/uploads', express_1.default.static('uploads', {
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
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/messages', message_routes_1.default);
app.use('/api/friends', friend_routes_1.default); // 👈 AGREGAR ESTO IMPORTANTE
app.use('/api/notifications', notification_routes_1.default); // 👈 REGISTRAR
app.use('/api/postulaciones', postulacion_routes_1.default);
app.use('/api/ratings', rating_routes_1.default); // ✅ NUEVO
app.use('/api/ai', ai_routes_1.default);
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
        }
        catch (err) {
            console.error('Error cleaning expired projects:', err);
        }
    };
    // Run once at startup, then every hour
    cleanupExpired();
    setInterval(cleanupExpired, 1000 * 60 * 60);
});
exports.default = app;
//# sourceMappingURL=index.js.map