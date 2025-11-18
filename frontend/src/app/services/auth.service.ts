// Servicio de autenticación - Comunica con el backend

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

// Interfaz para respuestas del servidor
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    email: string;
    nombre: string;
    perfilCompleto: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // URL del backend
  private API_URL = 'http://localhost:3000/api';

  // Subject para saber si hay usuario autenticado
  private usuarioAutenticado$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    // Verificar si hay token guardado al iniciar
    if (localStorage.getItem('token')) {
      this.usuarioAutenticado$.next(true);
    }
  }

  // Registrar nuevo usuario
  registro(datos: {
    email: string;
    nombre: string;
    fechaNacimiento: string;
    password: string;
    passwordConfirm: string;
  }): Observable<ApiResponse<{ email: string }>> {
    return this.http.post<ApiResponse<{ email: string }>>(`${this.API_URL}/auth/registro`, datos);
  }

  // Verificar email con código
  verificar(email: string, codigo: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.API_URL}/auth/verificar`, {
      email,
      codigo,
    });
  }

  // Iniciar sesión
  login(email: string, password: string): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/auth/login`, {
      email,
      password,
    });
  }

  // Guardar token
  guardarToken(token: string): void {
    localStorage.setItem('token', token);
    this.usuarioAutenticado$.next(true);
  }

  // Obtener token
  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  // Verificar si está autenticado
  estaAutenticado$(): Observable<boolean> {
    return this.usuarioAutenticado$.asObservable();
  }

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    this.usuarioAutenticado$.next(false);
  }
}
