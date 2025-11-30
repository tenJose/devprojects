import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private apiUrl = 'http://localhost:3000/api/friends';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  sendRequest(friendId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, { friendId }, { headers: this.getHeaders() });
  }

  checkStatus(friendId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/${friendId}`, { headers: this.getHeaders() });
  }

  // 🔴 ANTES (Causaba el error 404):
  // acceptRequest(requestId: number): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/accept/${requestId}`, {}, { headers: this.getHeaders() });
  // }

  // 🟢 AHORA (Correcto):
  acceptRequest(friendshipId: number): Observable<any> {
    // Enviamos al nuevo endpoint '/respond' con el estado 'aceptado'
    return this.http.put(
      `${this.apiUrl}/respond`, 
      { friendshipId, estado: 'aceptado' }, 
      { headers: this.getHeaders() }
    );
  }

  // ✅ Agregamos también para rechazar, ya que lo usas en el home
  rejectRequest(friendshipId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/respond`, 
      { friendshipId, estado: 'rechazado' }, 
      { headers: this.getHeaders() }
    );
  }
}