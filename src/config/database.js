// Configuración de conexión a MySQL
// Este archivo establece la conexión con la base de datos

import mysql from 'mysql2/promise.js';
import dotenv from 'dotenv';

dotenv.config();

// Crear un pool de conexiones (es más eficiente que una sola conexión)
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dev_projects',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
