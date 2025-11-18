// Tipos y interfaces reutilizables en toda la aplicación

export interface RegistroRequest {
  email: string;
  nombre: string;
  fechaNacimiento: string;
  password: string;
  passwordConfirm: string;
}

export interface VerificacionRequest {
  email: string;
  codigo: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenPayload {
  id: number;
  email: string;
}

export interface ConfiguracionPerfilRequest {
  fotoPerfil?: string; // Base64
  descripcion: string;
  tecnologias: string[]; // Array de tecnologías
  lenguajes: string[]; // Array de lenguajes
  informacionExtra: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
