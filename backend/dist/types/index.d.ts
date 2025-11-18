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
    fotoPerfil?: string;
    descripcion: string;
    tecnologias: string[];
    lenguajes: string[];
    informacionExtra: string;
}
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map