# Guía Completa de Instalación - DevProjects

Esta es una guía paso a paso para instalar y ejecutar la aplicación completa (Backend + Frontend).

## Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior) - [Descargar](https://nodejs.org/)
- **MySQL** (versión 5.7 o superior) - [Descargar](https://www.mysql.com/downloads/)
- **Angular CLI** - Instalar con: `npm install -g @angular/cli`

## Paso 1: Configurar la Base de Datos MySQL

### 1.1 Abrir MySQL

En Windows:
\`\`\`bash
mysql -u root -p
\`\`\`

En macOS/Linux:
\`\`\`bash
mysql -u root -p
\`\`\`

Se te pedirá la contraseña. Si no la tienes, solo presiona Enter.

### 1.2 Crear la Base de Datos

Dentro de MySQL, ejecuta:

\`\`\`sql
CREATE DATABASE dev_projects;
USE dev_projects;
\`\`\`

### 1.3 Crear las Tablas

Copia el contenido del archivo `db/schema.sql` y ejecútalo en MySQL:

\`\`\`sql
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

-- Tabla de Proyectos
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

-- Tabla de Postulaciones
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
\`\`\`

Luego escribe:
\`\`\`sql
EXIT;
\`\`\`

## Paso 2: Configurar el Backend (Express)

### 2.1 Abrir la carpeta del Backend

\`\`\`bash
cd ruta/a/tu/carpeta/backend
\`\`\`

### 2.2 Instalar dependencias

\`\`\`bash
npm install
\`\`\`

Esto instalará todos los paquetes necesarios (express, cors, bcrypt, etc.)

### 2.3 Crear archivo .env

Crea un archivo `.env` en la raíz del backend con la siguiente configuración:

\`\`\`env
# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=dev_projects

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui_cambia_esto_en_produccion

# Email (Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion_gmail

# Puerto
PORT=3001
\`\`\`

**IMPORTANTE:** Para que funcione el envío de emails con Gmail:

1. Habilita la autenticación de dos factores en tu cuenta de Google
2. Crea una contraseña de aplicación: https://myaccount.google.com/apppasswords
3. Usa esa contraseña en `EMAIL_PASSWORD`

Si no quieres configurar Gmail ahora, puedes dejar el envío de emails por defecto y el código se guardará en la consola.

### 2.4 Iniciar el Backend

\`\`\`bash
npm start
\`\`\`

O para desarrollo con reinicio automático:

\`\`\`bash
npm run dev
\`\`\`

Deberías ver:
\`\`\`
Servidor ejecutándose en http://localhost:3001
\`\`\`

## Paso 3: Configurar el Frontend (Angular)

### 3.1 Abrir una nueva terminal

Abre otra terminal/consola sin cerrar la del backend.

### 3.2 Navegar a la carpeta del Frontend

\`\`\`bash
cd ruta/a/tu/carpeta/frontend
\`\`\`

### 3.3 Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 3.4 Iniciar el servidor de desarrollo

\`\`\`bash
npm start
\`\`\`

O:

\`\`\`bash
ng serve
\`\`\`

Deberías ver algo como:
\`\`\`
✔ Compiled successfully.
✔ Build complete.

Application bundle generation complete.
...
→ Local:   http://localhost:4200/
\`\`\`

## Paso 4: Prueba la Aplicación

1. Abre tu navegador en: `http://localhost:4200`
2. Deberías ver la página de Login
3. Haz clic en "Crea una cuenta" para registrarte
4. Completa el formulario de registro
5. Verifica tu email (el código aparecerá en la consola del backend si no configuraste Gmail)
6. Inicia sesión
7. Completa tu perfil

## Flujo de la Aplicación

\`\`\`
Inicio
  ↓
Login/Registro
  ↓
Registro → Verificación Email → Login → Configuración Perfil → Home
\`\`\`

## Solución de Problemas

### Error: "Cannot find module"

**Solución:** Ejecuta `npm install` nuevamente en la carpeta donde tengas el error.

### Error: "Connection refused" (Base de Datos)

**Solución:** 
- Asegúrate de que MySQL está corriendo
- Verifica que los datos en `.env` son correctos (usuario, contraseña, host)

### Error: CORS

**Solución:** El backend ya tiene CORS configurado. Si persiste:
- Reinicia ambos servidores (backend y frontend)

### No llegan los emails

**Solución:**
- El código aparecerá en la consola del backend
- Cópialo manualmente para verificar

### Angular CLI no encontrado

**Solución:**
\`\`\`bash
npm install -g @angular/cli
\`\`\`

## Estructura de Carpetas

\`\`\`
proyecto/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración (BD, JWT, Email)
│   │   ├── controllers/     # Lógica de negocios
│   │   ├── middleware/      # Autenticación
│   │   ├── routes/          # Endpoints
│   │   ├── utils/           # Funciones auxiliares
│   │   └── index.js         # Archivo principal
│   ├── db/
│   │   └── schema.sql       # Estructura de la BD
│   ├── .env                 # Variables de entorno
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/   # Componentes Angular
    │   │   ├── services/     # Servicios (llamadas HTTP)
    │   │   └── app-routing.module.ts
    │   └── index.html
    └── package.json
\`\`\`

## Endpoints Disponibles

### Autenticación

- `POST /api/auth/registro` - Registrar nuevo usuario
- `POST /api/auth/verificar` - Verificar email
- `POST /api/auth/login` - Iniciar sesión

### Usuario

- `GET /api/usuario/me` - Obtener datos del usuario (requiere token)
- `PUT /api/usuario/perfil` - Actualizar perfil (requiere token)
- `PUT /api/usuario/foto` - Subir foto de perfil (requiere token)

## Próximos Pasos

Ahora que tienes la base, puedes:

1. Crear endpoints para proyectos
2. Crear endpoints para postulaciones
3. Crear componentes para ver proyectos
4. Crear componentes para crear proyectos
5. Agregar componentes de búsqueda
6. Agregar sistema de mensajes

¡Éxito con tu proyecto!
