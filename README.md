# DevProjects - Plataforma de Proyectos de Software

**DevProjects** es una plataforma web completa donde ingenieros de software pueden buscar y postularse para proyectos.

## Características Principales

✅ **Autenticación Segura**
- Registro con email y contraseña
- Verificación de email con código de 6 dígitos
- Contraseñas encriptadas con bcrypt
- Tokens JWT para sesiones seguras

✅ **Configuración de Perfil**
- Agregar foto de perfil
- Información académica y profesional
- Tecnologías y lenguajes de programación
- Información personal adicional

✅ **Base de Datos Completa**
- Estructura MySQL bien diseñada
- Relaciones entre tablas
- Campos para futuras funcionalidades

✅ **API REST Profesional**
- Endpoints bien documentados
- Validaciones en frontend y backend
- Manejo de errores
- CORS configurado

## Stack Tecnológico

### Frontend
- **Angular 17** - Framework web
- **TypeScript** - Lenguaje tipado
- **Reactive Forms** - Formularios avanzados
- **CSS3** - Estilos modernos

### Backend
- **Express.js** - Servidor Node.js
- **MySQL** - Base de datos
- **Bcrypt** - Encriptación de contraseñas
- **JWT** - Autenticación
- **Nodemailer** - Envío de emails

## Instalación Rápida

### 1. Clonar el repositorio
\`\`\`bash
git clone https://github.com/tuusuario/devprojects.git
cd devprojects
\`\`\`

### 2. Configurar Backend
\`\`\`bash
cd backend
npm install
# Editar .env con tus credenciales
npm start
\`\`\`

### 3. Configurar Frontend (en otra terminal)
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

### 4. Abrir en navegador
\`\`\`
http://localhost:4200
\`\`\`

## Documentación Completa

- **[GUIA_INSTALACION.md](./GUIA_INSTALACION.md)** - Instalación paso a paso
- **[EXPLICACION_CODIGO.md](./EXPLICACION_CODIGO.md)** - Cómo funciona cada parte
- **[API_ENDPOINTS.md](./API_ENDPOINTS.md)** - Documentación de endpoints

## Flujo de Usuario

\`\`\`
┌─────────────────────────────────────────┐
│       Visitante en el Sitio             │
└──────────────┬──────────────────────────┘
               │
        ┌──────▼───────┐
        │   Login?     │
        ├──────┬───────┤
        │ No   │ Sí    │
        │      │       │
        ▼      │       ▼
    Registro   │     ┌───────────────┐
        │      │     │ Ingresar      │
        │      │     │ Contraseña    │
        │      │     └───────┬───────┘
        │      │             │
        ▼      ▼             ▼
    Verificar Email (código de 6 dígitos)
        │
        ▼
    Login
        │
        ▼
    ¿Perfil Completado?
        │
    ┌───┴────┐
    │ No     │ Sí
    │        │
    ▼        ▼
Completar   Home
Perfil   (Próximas features)
    │
    ▼
  Home
\`\`\`

## Base de Datos

La aplicación usa 3 tablas principales:

### usuarios
Almacena la información de los usuarios registrados.

\`\`\`sql
- id (PRIMARY KEY)
- email (UNIQUE)
- nombre
- fecha_nacimiento
- contraseña (hasheada)
- verificado (boolean)
- codigo_verificacion
- foto_perfil (BLOB)
- descripcion_academica
- tecnologias
- lenguajes
- informacion_personal
- perfil_completado
- created_at
- updated_at
\`\`\`

### proyectos
Almacena los proyectos que crean los usuarios.

\`\`\`sql
- id (PRIMARY KEY)
- usuario_id (FOREIGN KEY)
- nombre
- descripcion (mínimo 200 palabras)
- tecnologias
- lenguajes
- datos_adicionales
- estado (borrador, publicado, finalizado)
- created_at
- updated_at
\`\`\`

### postulaciones
Almacena cuando un usuario se postula a un proyecto.

\`\`\`sql
- id (PRIMARY KEY)
- usuario_id (FOREIGN KEY)
- proyecto_id (FOREIGN KEY)
- estado (pendiente, aceptada, rechazada)
- created_at
- UNIQUE(usuario_id, proyecto_id) - Un usuario solo se puede postular una vez por proyecto
\`\`\`

## Componentes Angular

### LoginComponent
- Página de inicio de sesión
- Validación de email y contraseña
- Visibilidad de contraseña
- Redirección a registro o perfil después del login

### RegistroComponent
- Formulario de registro completo
- Validación de datos
- Verificación de coincidencia de contraseñas
- Confirmación visual de campos

### VerificacionComponent
- 6 inputs para código de verificación
- Navegación automática entre inputs
- Reenvío de código
- Validación en tiempo real

### ConfiguracionPerfilComponent
- Subida de foto de perfil con preview
- Textarea para descripción académica
- Inputs para tecnologías y lenguajes
- Información personal adicional

## Endpoints Disponibles

### Sin Autenticación
- `POST /api/auth/registro` - Registrar usuario
- `POST /api/auth/verificar` - Verificar email
- `POST /api/auth/login` - Iniciar sesión

### Con Autenticación (requiere token JWT)
- `GET /api/usuario/me` - Obtener datos del usuario
- `PUT /api/usuario/perfil` - Actualizar perfil
- `PUT /api/usuario/foto` - Subir foto de perfil

## Seguridad

✅ **Contraseñas Hasheadas**
- Usamos bcrypt con 10 rondas de salt
- Imposible recuperar la contraseña original

✅ **Autenticación con JWT**
- Token valido por 7 días
- Se invalida si no se incluye en el header

✅ **CORS Configurado**
- Solo el frontend puede acceder al backend
- Previene ataques desde otros dominios

✅ **Validación Doble**
- Frontend valida datos antes de enviar
- Backend valida nuevamente (nunca confiar en el cliente)

## Próximas Features

En los próximos releases:

- [ ] Página principal con proyectos disponibles
- [ ] Crear y publicar proyectos
- [ ] Postularse a proyectos
- [ ] Sistema de búsqueda y filtros
- [ ] Mensajería entre usuarios
- [ ] Perfil público de usuarios
- [ ] Ratings y reviews
- [ ] Dashboard para ver postulaciones
- [ ] Notificaciones
- [ ] Google OAuth

## Contribuir

¿Quieres mejorar DevProjects? 

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Soporte

Si tienes preguntas o problemas:

1. Revisa la [GUIA_INSTALACION.md](./GUIA_INSTALACION.md)
2. Revisa la [EXPLICACION_CODIGO.md](./EXPLICACION_CODIGO.md)
3. Abre un Issue en GitHub

## Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo LICENSE para más detalles.

---

**Hecho con ❤️ para desarrolladores que quieren aprender**

¡Feliz Coding! 🚀
