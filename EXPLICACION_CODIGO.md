# Explicación del Código - DevProjects

Este documento explica cómo funciona cada parte del código.

## Backend

### 1. Estructura General

El backend está organizado en capas:

\`\`\`
Request (Frontend)
    ↓
Router (routes/auth.js, routes/usuario.js)
    ↓
Controller (controllers/authController.js, controllers/usuarioController.js)
    ↓
Middleware (middleware/auth.js para proteger rutas)
    ↓
Database (config/database.js)
    ↓
MySQL
\`\`\`

### 2. Autenticación (Lo más importante para entender)

#### Registro

1. Usuario completa el formulario en el frontend
2. Frontend envía POST a `/api/auth/registro` con datos
3. Backend valida:
   - Que el email sea válido
   - Que las contraseñas coincidan
   - Que el email no esté registrado
4. Backend genera un código de 6 dígitos
5. Backend encripta la contraseña con `bcrypt`
6. Backend guarda al usuario en BD con `verificado = FALSE`
7. Backend envía email con el código

#### Verificación

1. Usuario recibe email con código
2. Usuario lo ingresa en `/verificacion`
3. Frontend envía POST a `/api/auth/verificar`
4. Backend verifica que el código sea correcto
5. Backend actualiza `verificado = TRUE`
6. Usuario puede iniciar sesión

#### Login

1. Usuario envía email y contraseña
2. Backend busca el usuario
3. Backend verifica que esté verificado
4. Backend usa `bcrypt.compare()` para verificar la contraseña
5. Si todo es correcto, genera un JWT token
6. Frontend guarda el token en localStorage
7. Cada solicitud posterior envía el token en el header

### 3. JWT Token

El JWT (JSON Web Token) funciona así:

\`\`\`javascript
// Crear token
const token = jwt.sign({ id: usuarioId }, JWT_SECRET, { expiresIn: '7d' });

// Resultado: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Verificar token
const decoded = jwt.verify(token, JWT_SECRET);
// Resultado: { id: 1 }
\`\`\`

## Frontend

### 1. Estructura de Angular

\`\`\`
main.ts (punto de entrada)
    ↓
AppComponent (app.component.ts)
    ↓
AppModule (app.module.ts - importa componentes)
    ↓
AppRoutingModule (app-routing.module.ts - define rutas)
    ↓
LoginComponent / RegistroComponent / etc.
\`\`\`

### 2. Flujo de Registro Paso a Paso

#### 1. Usuario abre la app
- main.ts inicia la aplicación
- Se carga AppComponent
- Se cargan las rutas
- Por defecto va a /login

#### 2. Usuario hace clic en "Crea una cuenta"
\`\`\`typescript
irARegistro(): void {
  this.router.navigate(['/registro']); // Va a /registro
}
\`\`\`
- Se carga RegistroComponent

#### 3. Usuario completa el formulario
\`\`\`typescript
formulario = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  nombre: ['', [Validators.required, Validators.minLength(3)]],
  fecha_nacimiento: ['', Validators.required],
  contraseña: ['', [Validators.required, Validators.minLength(8)]],
  confirmacion_contraseña: ['', Validators.required]
});
\`\`\`
- FormBuilder de Angular valida automáticamente
- El botón está deshabilitado si el formulario es inválido

#### 4. Usuario presiona "Crear Cuenta"
\`\`\`typescript
enviar(): void {
  this.authService.registro(this.formulario.value).subscribe({
    next: (respuesta) => {
      localStorage.setItem('email_para_verificar', respuesta.email);
      this.router.navigate(['/verificacion']);
    }
  });
}
\`\`\`
- Llama al servicio AuthService
- AuthService hace POST a `/api/auth/registro`
- Si es exitoso, guarda el email en localStorage
- Navega a la página de verificación

#### 5. Usuario ingresa el código de verificación
\`\`\`typescript
verificar(): void {
  this.authService.verificarEmail(this.email, this.codigo).subscribe({
    next: (respuesta) => {
      localStorage.removeItem('email_para_verificar');
      this.router.navigate(['/login']);
    }
  });
}
\`\`\`
- El componente tiene 6 inputs que detectan cuando escribes
- Al escribir un dígito, automáticamente va al siguiente input
- Cuando completas los 6 dígitos, puedes hacer clic en "Verificar"

#### 6. Usuario inicia sesión
\`\`\`typescript
login(email, contraseña): Observable<any> {
  return this.http.post(`${this.apiUrl}/auth/login`, { email, contraseña });
}
\`\`\`
- Backend devuelve un token
- Frontend lo guarda en localStorage
- Frontend verifica si el perfil está completo
- Si no: va a `/configuracion-perfil`
- Si sí: va a `/home`

#### 7. Usuario completa su perfil
\`\`\`typescript
actualizarPerfil(datos): Observable<any> {
  const token = this.obtenerToken();
  const headers = { 'Authorization': `Bearer ${token}` };
  return this.http.put(`${this.apiUrl}/usuario/perfil`, datos, { headers });
}
\`\`\`
- Envía el token en el header
- Backend valida el token en el middleware
- Backend actualiza los datos del usuario
- Si hay foto, la sube también

### 3. Validaciones

Las validaciones ocurren en varios niveles:

**Frontend:**
- FormBuilder valida tipos de datos
- Límites de caracteres
- Formatos (email, etc.)

**Backend:**
- Valida nuevamente todos los datos
- Verifica que el usuario no exista
- Verifica integridad de datos

Esto es importante para seguridad.

### 4. Seguridad

**Contraseñas:**
- Se envían por HTTPS (en producción)
- Se hashean con bcrypt en el backend
- Nunca se guardan sin hashear

**Tokens:**
- Se guardan en localStorage
- Se envían en cada solicitud autenticada
- Expiran en 7 días

**CORS:**
- El backend solo acepta requests del frontend
- Previene ataques desde otros dominios

## Base de Datos

### Tabla usuarios

\`\`\`sql
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,           -- ID único
  email VARCHAR(255) UNIQUE NOT NULL,          -- Email (único)
  nombre VARCHAR(255) NOT NULL,                -- Nombre completo
  fecha_nacimiento DATE NOT NULL,              -- Fecha nacimiento
  contraseña VARCHAR(255) NOT NULL,            -- Contraseña hasheada
  verificado BOOLEAN DEFAULT FALSE,            -- ¿Email verificado?
  codigo_verificacion VARCHAR(6),              -- Código de 6 dígitos
  foto_perfil LONGBLOB,                        -- Foto (binaria)
  descripcion_academica LONGTEXT,              -- Información académica
  tecnologias TEXT,                            -- Tecnologías que domina
  lenguajes TEXT,                              -- Lenguajes de programación
  informacion_personal LONGTEXT,               -- Info adicional
  perfil_completado BOOLEAN DEFAULT FALSE,     -- ¿Completó configuración?
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

### Tipos de Datos

- `INT` - Números enteros
- `VARCHAR(255)` - Texto corto (máximo 255 caracteres)
- `TEXT` - Texto medio
- `LONGTEXT` - Texto largo
- `LONGBLOB` - Datos binarios (para fotos)
- `DATE` - Fecha
- `TIMESTAMP` - Fecha y hora automática
- `BOOLEAN` - Verdadero/Falso

## Conceptos Clave

### Reactive Forms (Angular)

FormBuilder es el mejor para formularios complejos:

\`\`\`typescript
this.formulario = this.fb.group({
  email: ['valor_inicial', [validadores]]
});

// Acceder al valor
this.formulario.get('email')?.value

// Verificar si es válido
this.formulario.valid

// Limpiar
this.formulario.reset()
\`\`\`

### Observable (RxJS)

Los Observables son como eventos que puedes escuchar:

\`\`\`typescript
this.authService.login(email, pass).subscribe({
  next: (respuesta) => { }, // Si funciona
  error: (error) => { },     // Si falla
  complete: () => { }        // Cuando termina
});
\`\`\`

### LocalStorage

Para guardar datos en el navegador:

\`\`\`typescript
// Guardar
localStorage.setItem('token', token);

// Obtener
const token = localStorage.getItem('token');

// Borrar
localStorage.removeItem('token');
\`\`\`

Perfecto para guardar tokens sin reiniciar la sesión.

---

¡Con esta información deberías entender cómo funciona toda la aplicación!
