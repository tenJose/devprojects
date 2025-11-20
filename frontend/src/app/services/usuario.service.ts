// Servicio de usuario - Obtener y actualizar perfil

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface PerfilUsuario {
  id: number;
  email: string;
  nombre: string;
  fotoPerfil?: string;
  descripcion?: string;
  tecnologias: string[];
  lenguajes: string[];
  informacionExtra?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private API_URL = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  // Obtener headers con token
  private obtenerHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Obtener perfil del usuario autenticado
  obtenerPerfil(): Observable<ApiResponse<PerfilUsuario>> {
    return this.http.get<ApiResponse<PerfilUsuario>>(
      `${this.API_URL}/perfil`,
      { headers: this.obtenerHeaders() }
    );
  }

  // Configurar perfil
configurarPerfil(datos: FormData | {
  fotoPerfil?: string;
  descripcion: string;
  tecnologias: string[];
  lenguajes: string[];
  informacionExtra: string;
}): Observable<ApiResponse<PerfilUsuario>> {
  return this.http.put<ApiResponse<PerfilUsuario>>(
    `${this.API_URL}/configurar`,
    datos,
    { headers: this.obtenerHeaders() } // NO agregar 'Content-Type': 'application/json', FormData lo define
  );
}
}
