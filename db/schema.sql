-- Tabla de Usuarios
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  verificado BOOLEAN DEFAULT FALSE,
  codigo_verificacion VARCHAR(6),
  foto_perfil LONGBLOB,
  descripcion_academica LONGTEXT,
  tecnologias TEXT,
  lenguajes TEXT,
  informacion_personal LONGTEXT,
  perfil_completado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Proyectos (para que el ingeniero pueda crear proyectos)
CREATE TABLE proyectos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion LONGTEXT NOT NULL,
  tecnologias TEXT,
  lenguajes TEXT,
  datos_adicionales LONGTEXT,
  estado ENUM('borrador', 'publicado', 'finalizado') DEFAULT 'borrador',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de Postulaciones (para las solicitudes a proyectos)
CREATE TABLE postulaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  proyecto_id INT NOT NULL,
  estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_postulacion (usuario_id, proyecto_id)
);
