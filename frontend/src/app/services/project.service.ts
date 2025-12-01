import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

// ✅ Interfaz Actualizada para coincidir con el Backend (Prisma)
export interface Project {
  id: number;
  // El backend Prisma usa 'nombre', pero tu frontend usa 'titulo'. 
  // Mantenemos ambos por compatibilidad o deberías mapearlos.
  titulo: string; 
  nombre?: string; // Agregado por si el backend devuelve esto
  
  descripcion: string;
  tecnologias: string[]; // O string si no está parseado, pero el componente espera array
  
  // Coincidencia con Backend
  tipoProyecto?: string; // Backend: tipoProyecto
  presupuesto: number;
  presupuestoTipo?: string; // Backend: presupuestoTipo
  duracionEstimada?: string; // Backend: duracionEstimada
  ubicacion: string;
  estado?: string; // ✅ Faltaba: Backend 'estado'
  datosAdicionales?: string; // ✅ Faltaba: Backend 'datosAdicionales'
  createdAt: string; // Backend: createdAt (Tu HTML usaba fecha_creacion)
  
  usuarioCreadorId: number;
  destacado?: boolean;
  
  // Objetos relacionados
  usuarioCreador?: {
    id: number;
    nombre: string;
    avatar?: string;
    fotoPerfil?: string;
  };

  creador?: {
    id: number;
    nombre: string;
    fotoPerfil?: string;
  };
}

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  // Ajusta esto si tu backend está en otro puerto
  private apiUrl = "http://localhost:3000/api/projects";

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ''}`,
    });
  }

  getProjects(filters?: any): Observable<Project[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set("search", filters.search);
      if (filters.tecnologias) params = params.set("tecnologias", filters.tecnologias);
      if (filters.tipoProyecto) params = params.set("tipoProyecto", filters.tipoProyecto);
      if (filters.minBudget) params = params.set("presupuestoMin", filters.minBudget);
      if (filters.maxBudget) params = params.set("presupuestoMax", filters.maxBudget);
    }

    return this.http.get<Project[]>(this.apiUrl, {
      headers: this.getHeaders(),
      params,
    });
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createProject(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project, { headers: this.getHeaders() });
  }

  updateProject(id: number, project: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project, { headers: this.getHeaders() });
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}