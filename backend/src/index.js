"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Archivo principal del servidor Express
var express_1 = require("express");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var auth_routes_1 = require("./routes/auth.routes");
var user_routes_1 = require("./routes/user.routes");
// Cargar variables de entorno
dotenv_1.default.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3000;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Rutas
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
// Ruta de prueba
app.get('/api/health', function (req, res) {
    res.json({ message: 'Servidor funcionando correctamente' });
});
// Iniciar servidor
app.listen(PORT, function () {
    console.log("Servidor ejecut\u00E1ndose en puerto ".concat(PORT));
});
