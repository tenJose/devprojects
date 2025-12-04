import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = (typeof window !== 'undefined' && window.location.hostname === 'localhost') 
    ? 'http://localhost:3000/api/auth'
    : 'https://devback.mnz.dom.my.id/api/auth';
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

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  obtenerToken(): string | null {
    return this.getToken();
  }

  guardarToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.loadUserFromToken();

    // ❗ Guardar también userId para usarlo en requests a /perfil
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.id) {
      localStorage.setItem('userId', payload.id);
    }
  }

  getCurrentUser(): any {
    return this.userSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    // ❗ Limpiar token y userId previos antes de iniciar sesión
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('userId');

    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.guardarToken(response.token);
          this.router.navigate(['/home']);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, userData);
  }

  registro(userData: any): Observable<any> {
    return this.register(userData);
  }

  verificar(email: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar`, { email, codigo }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.guardarToken(response.token);
        }
      })
    );
  }

  reenviarCodigo(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reenviar-codigo`, { email });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('userId'); // ❗ limpiar userId también
    this.userSubject.next(null);
    this.router.navigate(['/']);
  }

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
