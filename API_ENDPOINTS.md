# Documentación de Endpoints

Aquí está la documentación completa de todos los endpoints del backend.

## Base URL

\`\`\`
http://localhost:3001/api
\`\`\`

## Autenticación (Sin token)

### 1. Registro de Usuario

**POST** `/auth/registro`

**Body:**
\`\`\`json
{
  "email": "usuario@email.com",
  "nombre": "Juan Pérez",
  "fecha_nacimiento": "1995-05-15",
  "contraseña": "MiContraseña123",
  "confirmacion_contraseña": "MiContraseña123"
}
\`\`\`

**Respuesta exitosa (201):**
\`\`\`json
{
  "mensaje": "Usuario registrado. Verifica tu email.",
  "email": "usuario@email.com"
}
\`\`\`

**Errores posibles:**
- 400: "Todos los campos son requeridos"
- 400: "Email inválido"
- 400: "Las contraseñas no coinciden"
- 400: "La contraseña debe tener al menos 8 caracteres"
- 400: "El email ya está registrado"

---

### 2. Verificar Email

**POST** `/auth/verificar`

**Body:**
\`\`\`json
{
  "email": "usuario@email.com",
  "codigo": "123456"
}
\`\`\`

**Respuesta exitosa (200):**
\`\`\`json
{
  "mensaje": "Email verificado exitosamente"
}
\`\`\`

**Errores posibles:**
- 400: "Email y código son requeridos"
- 404: "Usuario no encontrado"
- 400: "Código de verificación incorrecto"

---

### 3. Login

**POST** `/auth/login`

**Body:**
\`\`\`json
{
  "email": "usuario@email.com",
  "contraseña": "MiContraseña123"
}
\`\`\`

**Respuesta exitosa (200):**
\`\`\`json
{
  "mensaje": "Sesión iniciada",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuarioId": 1,
  "perfilCompletado": false
}
\`\`\`

**Errores posibles:**
- 400: "Email y contraseña son requeridos"
- 401: "Email o contraseña incorrectos"
- 401: "Email no verificado. Verifica tu correo"

---

## Usuario (Requiere Token)

Para estos endpoints, debes incluir el token en el header:

\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### 4. Obtener Datos del Usuario

**GET** `/usuario/me`

**Headers:**
\`\`\`
Authorization: Bearer {token}
\`\`\`

**Respuesta exitosa (200):**
\`\`\`json
{
  "id": 1,
  "email": "usuario@email.com",
  "nombre": "Juan Pérez",
  "foto_perfil": null,
  "descripcion_academica": "Ingeniero en Sistemas con 5 años...",
  "tecnologias": "React, Node.js, MySQL",
  "lenguajes": "JavaScript, Python",
  "informacion_personal": "Me interesa IA",
  "perfil_completado": true
}
\`\`\`

**Errores posibles:**
- 401: "Token no proporcionado"
- 401: "Token inválido o expirado"
- 404: "Usuario no encontrado"

---

### 5. Actualizar Perfil

**PUT** `/usuario/perfil`

**Headers:**
\`\`\`
Authorization: Bearer {token}
Content-Type: application/json
\`\`\`

**Body:**
\`\`\`json
{
  "descripcion_academica": "Soy ingeniero en sistemas con 5 años de experiencia en desarrollo web. Estudié en la Universidad Nacional...",
  "tecnologias": "React,Vue.js,Node.js,MySQL,Docker,Git",
  "lenguajes": "JavaScript,TypeScript,Python,Java",
  "informacion_personal": "Me interesa trabajar en proyectos de IA y Machine Learning. Actualmente disponible para freelance."
}
\`\`\`

**Respuesta exitosa (200):**
\`\`\`json
{
  "mensaje": "Perfil actualizado exitosamente"
}
\`\`\`

**Errores posibles:**
- 401: "Token no proporcionado"
- 401: "Token inválido o expirado"

---

### 6. Subir Foto de Perfil

**PUT** `/usuario/foto`

**Headers:**
\`\`\`
Authorization: Bearer {token}
Content-Type: multipart/form-data
\`\`\`

**Body:** (form-data)
\`\`\`
foto: [archivo de imagen]
\`\`\`

**Respuesta exitosa (200):**
\`\`\`json
{
  "mensaje": "Foto de perfil actualizada"
}
\`\`\`

**Errores posibles:**
- 401: "Token no proporcionado"
- 401: "Token inválido o expirado"

---

## Ejemplo de Uso con curl

### Registrar usuario
\`\`\`bash
curl -X POST http://localhost:3001/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@email.com",
    "nombre": "Test User",
    "fecha_nacimiento": "1995-05-15",
    "contraseña": "Contraseña123",
    "confirmacion_contraseña": "Contraseña123"
  }'
\`\`\`

### Verificar email
\`\`\`bash
curl -X POST http://localhost:3001/api/auth/verificar \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@email.com",
    "codigo": "123456"
  }'
\`\`\`

### Login
\`\`\`bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@email.com",
    "contraseña": "Contraseña123"
  }'
\`\`\`

### Obtener datos del usuario
\`\`\`bash
curl -X GET http://localhost:3001/api/usuario/me \
  -H "Authorization: Bearer {token}"
\`\`\`

---

## Códigos de Estado HTTP

- **200** - OK (solicitud exitosa)
- **201** - Created (recurso creado)
- **400** - Bad Request (datos inválidos)
- **401** - Unauthorized (sin autenticación o token inválido)
- **404** - Not Found (recurso no encontrado)
- **500** - Server Error (error del servidor)

---

## Validaciones del Backend

### Email
- Debe ser un email válido (ejemplo@email.com)
- Debe ser único en la base de datos

### Contraseña
- Mínimo 8 caracteres
- Se hashea con bcrypt antes de guardar
- No puede ser la misma que las anteriores (en el frontend)

### Token
- Valido por 7 días
- Se invalida si el JWT_SECRET cambia
- Debe incluirse en el header Authorization

---

## Próximos Endpoints (A Implementar)

- `POST /proyectos` - Crear proyecto
- `GET /proyectos` - Obtener todos los proyectos
- `GET /proyectos/:id` - Obtener un proyecto específico
- `PUT /proyectos/:id` - Actualizar proyecto
- `DELETE /proyectos/:id` - Eliminar proyecto
- `POST /postulaciones` - Postularse a un proyecto
- `GET /postulaciones` - Obtener postulaciones del usuario
- `PUT /postulaciones/:id` - Actualizar estado de postulación
