# Primeros Pasos - Guía Rápida

Siguen estos pasos si es tu primera vez con Node.js, Angular o bases de datos.

## Paso 1: Instalar Software Requerido

### Windows

1. **Node.js** (incluye npm)
   - Ve a https://nodejs.org/
   - Descarga "LTS" (versión estable)
   - Ejecuta el instalador y sigue los pasos
   - Abre Terminal/PowerShell y verifica: `node -v`

2. **MySQL**
   - Ve a https://www.mysql.com/downloads/
   - Descarga MySQL Community Server
   - Instala con las opciones por defecto
   - Recuerda la contraseña que estableciste

3. **Visual Studio Code** (editor recomendado)
   - Ve a https://code.visualstudio.com/
   - Descarga e instala
   - Extensiones recomendadas:
     - Angular Language Service
     - MySQL

### macOS

1. **Node.js**
   - Instala Homebrew: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
   - Instala Node: `brew install node`

2. **MySQL**
   - `brew install mysql`
   - Inicia: `brew services start mysql`

3. **VS Code**
   - Ve a https://code.visualstudio.com/
   - Descarga para macOS

### Linux (Ubuntu)

1. **Node.js y npm**
   \`\`\`bash
   sudo apt update
   sudo apt install nodejs npm
   \`\`\`

2. **MySQL**
   \`\`\`bash
   sudo apt install mysql-server
   sudo mysql_secure_installation
   \`\`\`

3. **VS Code**
   \`\`\`bash
   sudo snap install code --classic
   \`\`\`

## Paso 2: Entender la Terminal

La terminal (o consola) es donde ejecutas comandos.

### Comandos Básicos

\`\`\`bash
# Ver ubicación actual
pwd

# Listar archivos
ls

# Entrar a carpeta
cd nombre-carpeta

# Subir un nivel
cd ..

# Crear carpeta
mkdir nombre-carpeta

# Ver contenido de archivo
cat archivo.txt

# Limpiar pantalla
clear
\`\`\`

## Paso 3: Crear Estructura de Carpetas

En tu computadora, crea esta estructura:

\`\`\`
mi-proyecto-devprojects/
├── backend/
└── frontend/
\`\`\`

Ej en Windows (PowerShell):
\`\`\`powershell
mkdir mi-proyecto-devprojects
cd mi-proyecto-devprojects
mkdir backend
mkdir frontend
\`\`\`

## Paso 4: Configurar Backend

\`\`\`bash
# Ir a carpeta backend
cd backend

# Copiar archivos del backend aquí

# Instalar dependencias
npm install

# Verificar que se creó node_modules
ls

# Ver si todas las dependencias se instalaron
npm list
\`\`\`

Si ves errores como "Module not found", significa que falta instalar dependencias.

## Paso 5: Configurar Base de Datos MySQL

### Abrir MySQL

**Windows (PowerShell):**
\`\`\`powershell
mysql -u root -p
# Te pedirá contraseña - ingresa la que estableciste en instalación
\`\`\`

**macOS/Linux:**
\`\`\`bash
mysql -u root -p
\`\`\`

### Crear Base de Datos

Una vez dentro de MySQL (ves el prompt `mysql>`):

\`\`\`sql
CREATE DATABASE dev_projects;
USE dev_projects;

-- Copia el contenido de db/schema.sql aquí
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  -- ... resto de campos
);

-- Repite para proyectos y postulaciones

EXIT;
\`\`\`

### Verificar que se creó

\`\`\`bash
mysql -u root -p
mysql> SHOW DATABASES;
# Deberías ver "dev_projects"

mysql> USE dev_projects;
mysql> SHOW TABLES;
# Deberías ver "usuarios"

mysql> EXIT;
\`\`\`

## Paso 6: Configurar Variables de Entorno

En la carpeta `backend/`, crea un archivo llamado `.env`:

**Windows (Notepad):**
1. Click derecho → Nuevo → Archivo de texto
2. Renombra a `.env` (cuidado, debe terminar en .env)
3. Abre y copia:

\`\`\`env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql_aqui
DB_NAME=dev_projects
JWT_SECRET=secreto_super_seguro_aqui
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_gmail_aqui
PORT=3001
\`\`\`

**macOS/Linux:**
\`\`\`bash
nano .env
# Pega el contenido de arriba
# Ctrl+X, luego Y, luego Enter para guardar
\`\`\`

## Paso 7: Iniciar Backend

\`\`\`bash
# Debe estar en carpeta backend
cd backend

# Inicia el servidor
npm start

# Deberías ver:
# Servidor ejecutándose en http://localhost:3001
\`\`\`

¡Déjalo ejecutándose! Abre OTRA terminal para el frontend.

## Paso 8: Instalar Angular CLI

En una terminal nueva:

\`\`\`bash
npm install -g @angular/cli

# Verifica que se instaló
ng version
\`\`\`

## Paso 9: Configurar Frontend

\`\`\`bash
# Ir a carpeta frontend
cd frontend

# Copiar archivos del frontend aquí

# Instalar dependencias
npm install

# Inicia el servidor
ng serve

# Deberías ver:
# ✔ Compiled successfully
# → Local: http://localhost:4200/
\`\`\`

## Paso 10: Prueba la Aplicación

1. Abre navegador en http://localhost:4200
2. Deberías ver la página de login
3. Haz clic en "Crea una cuenta"
4. Completa el formulario

**IMPORTANTE:** El código de verificación aparecerá en la consola del backend (porque no configuramos Gmail).

Ej:
\`\`\`
Código de verificación enviado a: usuario@email.com
Código: 123456
\`\`\`

5. Copia ese código y úsalo en la página de verificación

## Solución de Problemas Comunes

### Error: "comando no encontrado: npm"

**Solución:** Node.js no está instalado o no está en el PATH
- Reinstala Node.js desde https://nodejs.org/
- Reinicia la terminal después

### Error: "ECONNREFUSED - No se puede conectar a MySQL"

**Solución:** MySQL no está corriendo
- Windows: Abre Services y busca MySQL, verifica que esté "Running"
- macOS: `brew services start mysql`
- Linux: `sudo systemctl start mysql`

### Error: "Cannot find module"

**Solución:** Falta ejecutar npm install
\`\`\`bash
npm install
\`\`\`

### Error: "El puerto 3001 ya está en uso"

**Solución:** Otro proceso usa el puerto
- Windows: `netstat -ano | findstr :3001` para ver qué proceso
- macOS/Linux: `lsof -i :3001`

Cierra el proceso o cambia PORT en .env

### Error: "Cannot read property 'valor' of undefined"

**Solución:** El formulario no se cargó correctamente
- Verifica que el módulo ReactiveFormsModule esté importado en app.module.ts
- Recarga la página (F5)

## Próximos Pasos

Una vez que todo funciona:

1. Lee [EXPLICACION_CODIGO.md](./EXPLICACION_CODIGO.md) para entender el código
2. Lee [API_ENDPOINTS.md](./API_ENDPOINTS.md) para entender los endpoints
3. Intenta agregar nuevas funcionalidades

## Consejos para Aprender

1. **No copies y peques ciegamente** - Lee el código y entiende qué hace
2. **Experimenta** - Cambia valores, agrega console.log(), ve qué pasa
3. **Lee los errores** - Son pistas de qué está mal
4. **Usa Google** - Si no entiendes algo, busca "(tecnología) explicado para principiantes"
5. **Haz preguntas** - En comunidades como StackOverflow o GitHub Discussions

## Documentación Oficial

- **Node.js**: https://nodejs.org/docs/
- **Angular**: https://angular.io/docs
- **Express**: https://expressjs.com/
- **MySQL**: https://dev.mysql.com/doc/
- **TypeScript**: https://www.typescriptlang.org/docs/

¡Éxito en tu viaje de programación! 🚀
