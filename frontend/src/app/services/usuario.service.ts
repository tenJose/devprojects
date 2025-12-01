// Servicio de usuario - Obtener y actualizar perfil

import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http" // Added HttpParams
import { Observable } from "rxjs"
import { AuthService } from "./auth.service"

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

interface PerfilUsuario {
  id: number
  email: string
  nombre: string
  fotoPerfil?: string
  descripcion?: string
  tecnologias: string[]
  lenguajes: string[]
  informacionExtra?: string
}

export interface UserSearchResult {
  id: number
  nombre: string
  apellido?: string
  fotoPerfil?: string
  descripcion?: string
  tecnologias: string[]
  rol: string
}

@Injectable({
  providedIn: "root",
})
export class UsuarioService {
  private API_URL = "http://localhost:3000/api/users"

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  // Obtener headers con token
  private obtenerHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken()
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    })
  }

  searchUsers(filters?: any): Observable<UserSearchResult[]> {
    let params = new HttpParams()

    if (filters) {
      if (filters.search) params = params.set("search", filters.search)
      if (filters.tecnologias) params = params.set("tecnologias", filters.tecnologias)
    }

    return this.http.get<UserSearchResult[]>(`${this.API_URL}/search`, {
      headers: this.obtenerHeaders(),
      params,
    })
  }

 // Obtener perfil del usuario autenticado (MI perfil)
  obtenerPerfil(): Observable<ApiResponse<PerfilUsuario>> {
    return this.http.get<ApiResponse<PerfilUsuario>>(`${this.API_URL}/perfil`, { headers: this.obtenerHeaders() })
  }

  // ✅ NUEVO MÉTODO: Obtener perfil público de otro usuario
  obtenerUsuarioPublico(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/${id}`, {
      headers: this.obtenerHeaders(),
    });
  }

  // Configurar perfil
  configurarPerfil(
    datos:
      | FormData
      | {
          fotoPerfil?: string
          descripcion: string
          tecnologias: string[]
          lenguajes: string[]
          informacionExtra: string
        },
  ): Observable<ApiResponse<PerfilUsuario>> {
    return this.http.put<ApiResponse<PerfilUsuario>>(
      `${this.API_URL}/configurar`,
      datos,
      { headers: this.obtenerHeaders() }, // NO agregar 'Content-Type': 'application/json', FormData lo define
    )
  }

  obtenerUsuarioPorId(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/${id}`, {
      headers: this.obtenerHeaders(),
    })
  }

}
