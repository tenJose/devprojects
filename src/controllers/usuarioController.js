// Controlador de usuario
// Funciones para obtener y actualizar datos del usuario

import pool from '../config/database.js';

// Obtener datos del usuario
export const obtenerUsuario = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;

    const connection = await pool.getConnection();
    const [usuarios] = await connection.query(
      'SELECT id, email, nombre, foto_perfil, descripcion_academica, tecnologias, lenguajes, informacion_personal, perfil_completado FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    connection.release();

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuarios[0]);

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
};

// Actualizar perfil del usuario (datos académicos, tecnologías, etc.)
export const actualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const { descripcion_academica, tecnologias, lenguajes, informacion_personal } = req.body;

    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE usuarios SET descripcion_academica = ?, tecnologias = ?, lenguajes = ?, informacion_personal = ?, perfil_completado = TRUE WHERE id = ?',
      [descripcion_academica, tecnologias, lenguajes, informacion_personal, usuarioId]
    );

    connection.release();

    res.json({ mensaje: 'Perfil actualizado exitosamente' });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

// Actualizar foto de perfil
export const actualizarFotoPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const fotoPerfil = req.file.buffer; // El archivo viene en req.file.buffer

    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE usuarios SET foto_perfil = ? WHERE id = ?',
      [fotoPerfil, usuarioId]
    );

    connection.release();

    res.json({ mensaje: 'Foto de perfil actualizada' });

  } catch (error) {
    console.error('Error al actualizar foto:', error);
    res.status(500).json({ error: 'Error al actualizar foto de perfil' });
  }
};
