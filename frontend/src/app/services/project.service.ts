import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs"
import { AuthService } from "./auth.service"

export interface Project {
  id: number
  title: string
  description: string
  type: string
  techStack: string[]
  budget: number
  usuarioCreadorId: number
  compensation: number
  compensationType: string
  duration: string
  location: string
  createdAt: string
  creator?: {
    id: number
    name: string
    avatar?: string
  }
}

export interface BackendProject {
  id: number;
  titulo: string;
  descripcion: string;
  tipo_proyecto: string;
  tecnologias: string[];
  presupuesto: number;
  usuarioCreadorId: number;
  tipo_pago?: string;
  duracion: string;
  ubicacion: string;
  createdAt: string;
  usuarioCreador?: {
    id: number;
    nombre: string;
    avatar?: string;
  };
}


@Injectable({
  providedIn: "root",
})
export class ProjectService {
  private apiUrl = "http://localhost:3000/api/projects"

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken()
    return new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    })
  }

  getProjects(filters?: any): Observable<BackendProject[]> {
    let params = new HttpParams()

    if (filters) {
      if (filters.search) params = params.set("search", filters.search)
      if (filters.tecnologias) params = params.set("tecnologias", filters.tecnologias)
      if (filters.tipoProyecto) params = params.set("tipoProyecto", filters.tipoProyecto)
      if (filters.minBudget) params = params.set("presupuestoMin", filters.minBudget)
      if (filters.maxBudget) params = params.set("presupuestoMax", filters.maxBudget)
    }

  return this.http.get<BackendProject[]>(this.apiUrl, {
      headers: this.getHeaders(),
      params,
    })
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
  }

  createProject(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project, { headers: this.getHeaders() })
  }

  updateProject(id: number, project: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project, { headers: this.getHeaders() })
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
  }
}
