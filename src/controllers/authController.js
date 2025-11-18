// Controlador de autenticación
// Aquí están las funciones para registro, login y verificación

import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { createToken } from '../config/jwt.js';
import { enviarCodigoVerificacion } from '../utils/email.js';
import { validarEmail, validarContraseña, generarCodigoVerificacion } from '../utils/validaciones.js';

// REGISTRO: Crear una nueva cuenta
export const registro = async (req, res) => {
  try {
    const { email, nombre, fecha_nacimiento, contraseña, confirmacion_contraseña } = req.body;

    // Validaciones básicas
    if (!email || !nombre || !fecha_nacimiento || !contraseña || !confirmacion_contraseña) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (!validarEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (contraseña !== confirmacion_contraseña) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    if (!validarContraseña(contraseña)) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Verificar si el email ya existe
    const connection = await pool.getConnection();
    const [usuariosExistentes] = await connection.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuariosExistentes.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Generar código de verificación
    const codigoVerificacion = generarCodigoVerificacion();

    // Hashear la contraseña (encriptarla)
    const contraseñaHasheada = await bcrypt.hash(contraseña, 10);

    // Insertar el nuevo usuario en la base de datos
    await connection.query(
      'INSERT INTO usuarios (email, nombre, fecha_nacimiento, contraseña, codigo_verificacion) VALUES (?, ?, ?, ?, ?)',
      [email, nombre, fecha_nacimiento, contraseñaHasheada, codigoVerificacion]
    );

    connection.release();

    // Enviar código de verificación por email
    await enviarCodigoVerificacion(email, codigoVerificacion);

    res.status(201).json({ 
      mensaje: 'Usuario registrado. Verifica tu email.',
      email: email 
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// VERIFICACIÓN: Verificar el código que el usuario recibió por email
export const verificarEmail = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
      return res.status(400).json({ error: 'Email y código son requeridos' });
    }

    const connection = await pool.getConnection();

    // Buscar el usuario
    const [usuarios] = await connection.query(
      'SELECT id, codigo_verificacion FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarios.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = usuarios[0];

    // Verificar que el código coincida
    if (usuario.codigo_verificacion !== codigo) {
      connection.release();
      return res.status(400).json({ error: 'Código de verificación incorrecto' });
    }

    // Marcar el usuario como verificado
    await connection.query(
      'UPDATE usuarios SET verificado = TRUE, codigo_verificacion = NULL WHERE id = ?',
      [usuario.id]
    );

    connection.release();

    res.json({ mensaje: 'Email verificado exitosamente' });

  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({ error: 'Error al verificar email' });
  }
};

// LOGIN: Iniciar sesión
export const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const connection = await pool.getConnection();

    // Buscar el usuario
    const [usuarios] = await connection.query(
      'SELECT id, contraseña, verificado, perfil_completado FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarios.length === 0) {
      connection.release();
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const usuario = usuarios[0];

    // Verificar que el usuario esté verificado
    if (!usuario.verificado) {
      connection.release();
      return res.status(401).json({ error: 'Email no verificado. Verifica tu correo' });
    }

    // Verificar la contraseña
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!contraseñaValida) {
      connection.release();
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    connection.release();

    // Crear token JWT
    const token = createToken(usuario.id);

    res.json({ 
      mensaje: 'Sesión iniciada',
      token: token,
      usuarioId: usuario.id,
      perfilCompletado: usuario.perfil_completado
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};
