import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth_token';
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const token = this.getToken();
    if (token) {
      this.loadUserFromToken();
    }
  }

  // Método para verificar si está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // Método para obtener el token (nombre en inglés)
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Método para obtener el token (nombre en español - para compatibilidad)
  obtenerToken(): string | null {
    return this.getToken();
  }

  // Método para guardar el token
  guardarToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.loadUserFromToken();
  }

  // Método para obtener el usuario actual
  getCurrentUser(): any {
    return this.userSubject.value;
  }

  // Login
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.guardarToken(response.token);
          this.router.navigate(['/home']);
        }
      })
    );
  }

  // Registro (nombre en inglés)
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, userData);
  }

  // Registro (nombre en español - para compatibilidad)
  registro(userData: any): Observable<any> {
    return this.register(userData);
  }

  // Verificación de código
  verificar(email: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar`, { email, codigo }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.guardarToken(response.token);
        }
      })
    );
  }

  // Reenviar código de verificación
  reenviarCodigo(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reenviar-codigo`, { email });
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
    this.router.navigate(['/']);
  }

  // Cargar usuario desde token
  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userSubject.next(payload);
      } catch (error) {
        console.error('Error al decodificar token:', error);
      }
    }
  }
}