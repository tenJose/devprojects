import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // ✅ Importar AuthService

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private apiUrl = 'http://localhost:3000/api/friends';

  constructor(
    private http: HttpClient,
    private authService: AuthService // ✅ Inyectar AuthService
  ) {}

  // ✅ Método privado para generar las cabeceras con el Token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Aquí va el token
    });
  }

  // Enviar solicitud de amistad
  sendRequest(friendId: number): Observable<any> {
    // ✅ Agregamos { headers: this.getHeaders() }
    return this.http.post(
      `${this.apiUrl}/request`, 
      { friendId }, 
      { headers: this.getHeaders() } 
    );
  }

  // Verificar estado de amistad
  checkStatus(friendId: number): Observable<any> {
    // ✅ Agregamos headers
    return this.http.get(
      `${this.apiUrl}/status/${friendId}`, 
      { headers: this.getHeaders() }
    );
  }

  // Aceptar solicitud (para el futuro)
  acceptRequest(requestId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/accept/${requestId}`, 
      {}, 
      { headers: this.getHeaders() }
    );
  }
}