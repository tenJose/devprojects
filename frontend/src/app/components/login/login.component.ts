// Componente de Login

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  mostrarContrasena: boolean = false;
  cargando: boolean = false;
  error: string = '';
  exito: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Cambiar visibilidad de contraseña
  cambiarVisibilidadContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  // Enviar formulario de login
  enviar(): void {
    // Validar campos
    if (!this.email || !this.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.success) {
          // Guardar token
          this.authService.guardarToken(response.data!.token);
          
          // Redirigir según si perfil está completo
          if (response.data!.usuario.perfilCompleto) {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/configuracion-perfil']);
          }
        } else {
          this.error = response.message;
        }
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al iniciar sesión';
        this.cargando = false;
      },
    });
  }
}
