import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService } from "./auth.service";

export interface Project {
  id: number;
  nombre: string;
  titulo?: string;
  descripcion: string;
  tecnologias: string[];
  lenguajes: string[];
  adjuntos: string[];
  tipoProyecto?: string;
  presupuesto?: number | null;
  presupuestoTipo?: string;
  duracionEstimada?: string;
  ubicacion?: string;
  fechaLimite?: string | Date;
  tamanoEquipo?: string;
  datosAdicionales?: string;
  estado: string;
  destacado: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
  usuarioCreadorId: number;
  usuarioAsignadoId?: number | null;
  estadoFinalizacion?: string | null;
  fechaFinalizacion?: string | Date | null;
  usuarioCreador?: {
    id: number;
    nombre: string;
    apellido?: string;
    fotoPerfil?: string;
    rol?: string;
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
  private apiUrl = (typeof window !== 'undefined' && window.location.hostname === 'localhost') 
    ? 'http://localhost:3000/api/projects'
    : 'https://devback.mnz.dom.my.id/api/projects';

  constructor(private http: HttpClient, private authService: AuthService) {}

  uploadProjectFiles(projectId: number, files: FileList): Observable<any> {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('files', f));
    const headers = this.getHeaders().delete('Content-Type'); // Let browser set multipart boundary
    return this.http.post(`${this.apiUrl}/${projectId}/upload`, form, { headers });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ''}`,
    });
  }

  // 🔥 MAGIA AQUÍ: Función recursiva para limpiar datos muy anidados
  private cleanData(input: any): string[] {
    if (!input) return [];

    // 1. Si es string, intentamos parsearlo como JSON. Si falla, es texto normal.
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        return this.cleanData(parsed); // Recursividad: intentar limpiar lo que salió
      } catch {
        // Si falla el parseo, es un string normal (ej: "React, Node" o "Java")
        return input.includes(',') ? input.split(',').map(s => s.trim()) : [input];
      }
    }

    // 2. Si es array, limpiamos cada elemento y lo aplanamos
    if (Array.isArray(input)) {
      return input
        .map(item => this.cleanData(item)) // Limpiar hijos
        .flat() // Aplanar arrays (ej: [['React']] se vuelve ['React'])
        .filter(item => typeof item === 'string' && item.trim().length > 0 && item !== '[' && item !== ']'); 
    }

    return [];
  }

  // Transformar el proyecto usando la función de limpieza
  private transformProject(data: any): Project {
    return {
      ...data,
      // Aplicamos la limpieza profunda a estos campos
      tecnologias: this.cleanData(data.tecnologias),
      lenguajes: this.cleanData(data.lenguajes),
      adjuntos: this.cleanData(data.adjuntos)
    };
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

    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getHeaders(),
      params,
    }).pipe(
      map(projects => projects.map(p => this.transformProject(p)))
    );
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(p => this.transformProject(p))
    );
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