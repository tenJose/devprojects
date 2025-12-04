import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Rating {
  id: number;
  proyectoId: number;
  calificadorId: number;
  calificadoId: number;
  puntuacion: number;
  comentario?: string;
  createdAt: string;
  calificador: {
    id: number;
    nombre: string;
    apellido: string;
    fotoPerfil?: string;
  };
  proyecto: {
    id: number;
    nombre: string;
  };
}

export interface RatingsResponse {
  success: boolean;
  message?: string;
  data: {
    promedio: number;
    totalCalificaciones: number;
    calificaciones: Rating[];
  };
}

export interface ProjectsResponse {
  success: boolean;
  message?: string;
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = (typeof window !== 'undefined' && window.location.hostname === 'localhost') 
    ? 'http://localhost:3000/api/ratings'
    : 'https://devback.mnz.dom.my.id/api/ratings';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`
    });
  }

  // Calificar un proyecto
  rateProject(projectId: number, calificadorId: number, puntuacion: number, comentario?: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${projectId}/rate`,
      { calificadorId, puntuacion, comentario },
      { headers: this.getHeaders() }
    );
  }

  // Obtener calificaciones de un usuario
  getUserRatings(userId: number): Observable<RatingsResponse> {
    return this.http.get<RatingsResponse>(`${this.apiUrl}/users/${userId}/ratings`);
  }

  // Obtener proyectos completados de un usuario
  getCompletedProjects(userId: number): Observable<ProjectsResponse> {
    return this.http.get<ProjectsResponse>(`${this.apiUrl}/users/${userId}/completed`);
  }

  // Obtener proyectos activos de un usuario
  getActiveProjects(userId: number): Observable<ProjectsResponse> {
    return this.http.get<ProjectsResponse>(`${this.apiUrl}/users/${userId}/active`);
  }

  // Solicitar finalización de proyecto
  requestCompletion(projectId: number, usuarioId: number): Observable<any> {
    const apiUrl = this.apiUrl.replace('/ratings', '/projects');
    return this.http.post(
      `${apiUrl}/${projectId}/request-completion`,
      { usuarioId },
      { headers: this.getHeaders() }
    );
  }

  // Confirmar o rechazar finalización
  confirmCompletion(projectId: number, usuarioId: number, confirmar: boolean): Observable<any> {
    const apiUrl = this.apiUrl.replace('/ratings', '/projects');
    return this.http.post(
      `${apiUrl}/${projectId}/confirm-completion`,
      { usuarioId, confirmar },
      { headers: this.getHeaders() }
    );
  }

  // Obtener estado de finalización
  getCompletionStatus(projectId: number): Observable<any> {
    const apiUrl = this.apiUrl.replace('/ratings', '/projects');
    return this.http.get(
      `${apiUrl}/${projectId}/completion-status`,
      { headers: this.getHeaders() }
    );
  }

  // ✅ NUEVO: Obtener proyectos que pueden ser calificados entre dos usuarios
  getProjectsToRate(creatorId: number, engineerId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/projects-to-rate?creatorId=${creatorId}&engineerId=${engineerId}`,
      { headers: this.getHeaders() }
    );
  }
}
