import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable } from "rxjs"
import { AuthService } from "./auth.service"

export interface Message {
  id: number
  remitente: number
  destinatario: number
  contenido: string
  leido: boolean
  createdAt: string
  usuarioRemitente?: {
    id: number
    nombre: string
    apellido: string
    fotoPerfil: string
  }
}

export interface Conversation {
  conversacionId: string
  otherUser: {
    id: number
    nombre: string
    apellido: string
    fotoPerfil: string
  }
  proyecto?: {
    id: number
    nombre: string
  }
  ultimoMensaje: string
  fecha: string
  leido: boolean
  mensajesNoLeidos: number
}

@Injectable({
  providedIn: "root",
})
export class MessageService {
  private apiUrl = "http://localhost:3000/api/messages"

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

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`, { headers: this.getHeaders() })
  }

  getMessages(otherUserId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/${otherUserId}`, { headers: this.getHeaders() })
  }

  sendMessage(destinatario: number, contenido: string, proyectoId?: number): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, { destinatario, contenido, proyectoId }, { headers: this.getHeaders() })
  }

  markAsRead(otherUserId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${otherUserId}/read`, {}, { headers: this.getHeaders() })
  }
}
