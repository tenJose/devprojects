# DevProjects AI Coding Agent Instructions

## Architecture Overview

**DevProjects** is a full-stack freelance platform for collaborative software projects.

- **Backend**: Express + TypeScript + Prisma ORM + MySQL
- **Frontend**: Angular 20 with standalone components and functional routing
- **Structure**: Monorepo (root level) with separate `/backend` and `/frontend` folders

### Core Data Flow
1. **Frontend** (Angular) → HTTP requests with Bearer tokens to **Backend** API
2. **Backend** validates JWT, processes via controllers → Prisma queries → **MySQL** database
3. Response flows back with standardized `ApiResponse<T>` type wrapping

## Backend Patterns

### Key Directories & Files
- `backend/src/controllers/` - Business logic handlers for each domain (auth, projects, users, messages, etc.)
- `backend/src/routes/` - Express route definitions, mounted in `index.ts` at `/api/{resource}` paths
- `backend/src/middleware/` - `autenticar` JWT middleware (extracts `usuarioId` from Bearer token)
- `backend/prisma/schema.prisma` - **Single source of truth** for data models and relationships
- `backend/src/utils/` - Reusable helpers: JWT generation, email, validators

### Controller Response Pattern
Always return `ApiResponse<T>` wrapper:
```typescript
res.status(200).json({
  success: true,
  message: 'Operación exitosa',
  data: result
});
```

For errors: `success: false, message: 'error description'` with appropriate HTTP status codes.

### Middleware Usage
Routes requiring auth use `autenticar` middleware (see `auth.routes.ts` pattern):
```typescript
router.post('/endpoint', autenticar, controllerFunction);
```
This injects `req.usuarioId` automatically. Import `UsuarioRequest` interface to access it.

### Database Schema Patterns
- **JSON fields**: Technologies, languages, social networks stored as `@db.Text` (parse/stringify in controllers)
- **Relationships**: Use Prisma relations with proper cascade on delete (e.g., `onDelete: Cascade`)
- **Indexes**: Applied to frequently-filtered fields (estado, destacado, usuarioCreadorId)
- **Unique constraints**: Prevent duplicates (e.g., `@@unique([usuarioId, proyectoId])` in Postulacion)

### Email & Verification
- `utils/email.ts` handles verification codes: `generarCodigoVerificacion()`, `enviarCodigoVerificacion()`
- Called in `auth.controller.ts` during signup
- User `verificado` field defaults to `false`, set to `true` after code verification

## Frontend Patterns

### Service Architecture
Services inject `HttpClient` and `AuthService`. Always:
1. Get token via `this.authService.getToken()`
2. Build headers with `Authorization: Bearer ${token}`
3. Return `Observable<T>` for async chaining
4. Use RxJS operators like `tap()` for side effects (localStorage updates, routing)

**Example** (`project.service.ts`):
```typescript
private getHeaders(): HttpHeaders {
  const token = this.authService.getToken();
  return new HttpHeaders({ Authorization: `Bearer ${token || ''}` });
}
```

### Data Transformation
Backend often returns JSON-stringified arrays in database fields. Services **clean & parse** recursively:
- `cleanData()` in `ProjectService` handles nested string parsing
- Always apply transformation in service layer before passing to components

### Routing & Guards
- Use standalone components with functional routing in `app.routes.ts`
- Protected routes require `canActivate: [AuthGuard]`
- `AuthGuard` checks `isAuthenticated()` (JWT validity + expiry check)
- Failed auth redirects to `/login` with `returnUrl` parameter

### Token Management
- JWT decoded client-side: `atob(token.split('.')[1])` to extract payload
- `userId` and `auth_token` stored in `localStorage` during login
- Both cleared on logout or before new login attempt

## Development Workflows

### Running the Stack
```powershell
# Backend (from root or backend/)
npm run dev          # ts-node-dev with auto-restart

# Frontend (from frontend/)
npm start            # ng serve on http://localhost:4200

# Database migrations
npm run prisma:migrate    # From backend/
npm run prisma:generate   # Regenerate Prisma client
```

### API Endpoints Structure
All routes prefixed with `/api/{resource}`:
- `/api/auth/` - registro, login, verificar
- `/api/users/` - profile updates, fetches
- `/api/projects/` - CRUD, search with filters
- `/api/messages/` - conversation threads
- `/api/friends/` - friendship requests
- `/api/notifications/` - user notifications
- `/api/postulaciones/` - project applications

### CORS & Uploads
- CORS configured for `http://localhost:4200` only
- Uploads served from `/uploads` static directory with CORS headers
- Multer configured for image/file uploads in `upload.middleware.ts`

## Key Conventions

### Naming & Types
- **Database models**: PascalCase (User, Proyecto, Postulacion)
- **API fields**: snake_case in responses (e.g., `usuario_creador_id`)
- **Frontend properties**: camelCase (usuarioCreadorId, fotoPerfil)
- Always use `TokenPayload` interface for JWT claims

### Error Handling
- Validate inputs before DB queries (see `validators.ts` for email, password, date validation)
- Return 400 for bad requests, 401 for auth failures, 500 for server errors
- Always include `message` field explaining error

### Relations & Cascade Deletion
- When deleting users: cascades delete projects, messages, postulaciones, amistades, notificaciones
- Use `onDelete: SetNull` for optional foreign keys (e.g., proyecto in Mensaje)
- Ensure migrations run: `npm run prisma:migrate`

## Common Patterns by Feature

### Authentication Flow
1. User submits email/password in `registro` or `login`
2. Controller validates, hashes password with `bcryptjs`
3. JWT generated with `{ id, email }` payload
4. Frontend stores token + userId in localStorage
5. All subsequent requests include `Authorization: Bearer {token}`

### Project Filtering
Backend accepts query params: `search`, `tecnologias`, `tipoProyecto`, `presupuestoMin/Max`
Frontend `ProjectService.getProjects()` builds `HttpParams` and passes to `/api/projects`

### File Uploads
Use multer middleware on specific routes. Files saved to `uploads/` directory.
Frontend constructs FormData and POST with token in headers (not just JSON).

## Important Gotchas

1. **JSON in Text Fields**: Always `JSON.parse()` tecnologias/lenguajes from DB; stringify before saving
2. **Token Expiry**: JWT checked on frontend before making requests (`isAuthenticated()` method)
3. **User ID Consistency**: Both `id` from JWT payload AND `userId` from URL params should be available
4. **Cascade Migrations**: Never delete schema fields without creating migrations first
5. **Email Verification**: Code sent via nodemailer; must be verified before user can perform actions
