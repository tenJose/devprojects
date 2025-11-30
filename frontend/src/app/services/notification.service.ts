import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  // Responder solicitud de amistad (Aceptar/Rechazar)
  responderAmistad(friendshipId: number, aceptar: boolean): Observable<any> {
    const estado = aceptar ? 'aceptado' : 'rechazado';
    // Nota: Necesitarás crear este endpoint en friend.routes si no existe, 
    // o usar update genérico. Asumiremos una ruta simple de update aquí.
    return this.http.put(`${this.apiUrl}/friends/respond`, { friendshipId, estado }, { headers: this.getHeaders() });
  }
}