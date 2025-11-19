// Componente de Registro

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent {
  // Formulario
  email: string = '';
  nombre: string = '';
  fechaNacimiento: string = '';
  password: string = '';
  passwordConfirm: string = '';

  // Estados
  mostrarContrasena: boolean = false;
  mostrarConfirmar: boolean = false;
  cargando: boolean = false;
  error: string = '';
  exito: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Cambiar visibilidad de contraseña
  cambiarVisibilidad(campo: 'password' | 'confirm'): void {
    if (campo === 'password') {
      this.mostrarContrasena = !this.mostrarContrasena;
    } else {
      this.mostrarConfirmar = !this.mostrarConfirmar;
    }
  }

  // Enviar formulario de registro
  enviar(): void {
    // Validar campos
    if (
      !this.email ||
      !this.nombre ||
      !this.fechaNacimiento ||
      !this.password ||
      !this.passwordConfirm
    ) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    // Validar que contraseñas coincidan
    if (this.password !== this.passwordConfirm) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.authService
      .register({
        email: this.email,
        nombre: this.nombre,
        fechaNacimiento: this.fechaNacimiento,
        password: this.password,
        passwordConfirm: this.passwordConfirm,
      })
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            // Guardar email para verificación
            sessionStorage.setItem('emailVerificacion', this.email);
            this.exito = response.message;
            
            // Redirigir a verificación después de 2 segundos
            setTimeout(() => {
              this.router.navigate(['/verificacion']);
            }, 2000);
          } else {
            this.error = response.message;
          }
          this.cargando = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Error al registrarse';
          this.cargando = false;
        },
      });
  }
}
