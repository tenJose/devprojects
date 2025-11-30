import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private apiUrl = 'http://localhost:3000/api/friends'; // Asegúrate de crear esta ruta en tu backend

  constructor(private http: HttpClient) {}

  // Enviar solicitud de amistad
  sendRequest(friendId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, { friendId });
  }

  // Verificar estado de amistad (si ya son amigos o hay solicitud pendiente)
  checkStatus(friendId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/${friendId}`);
  }

  // Aceptar solicitud
  acceptRequest(requestId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/accept/${requestId}`, {});
  }
}