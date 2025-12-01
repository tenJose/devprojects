import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostulacionService {
  private API_BASE_URL = 'http://localhost:3000/api'; // Ajustado para incluir /api si es necesario

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createPostulacion(data: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/postulaciones`, data, { headers: this.getHeaders() });
  }

  // ✅ NUEVO MÉTODO AGREGADO
  responderPostulacion(id: number, estado: 'aceptado' | 'rechazado'): Observable<any> {
    // Asegúrate de que esta ruta coincida con la que creaste en el backend
    // Si no creaste la ruta específica, usa un update genérico o crea la ruta en postulacion.routes.ts
    return this.http.put(`${this.API_BASE_URL}/postulaciones/${id}/responder`, { estado }, { headers: this.getHeaders() });
  }
}