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
  email: string = '';
  nombre: string = '';
  fechaNacimiento: string = '';
  password: string = '';
  passwordConfirm: string = '';

  mostrarContrasena: boolean = false;
  mostrarConfirmar: boolean = false;
  cargando: boolean = false;
  error: string = '';
  exito: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  cambiarVisibilidad(campo: 'password' | 'confirm'): void {
    console.log(`➡️ Cambiando visibilidad del campo: ${campo}`);
    
    if (campo === 'password') {
      this.mostrarContrasena = !this.mostrarContrasena;
      console.log('🔍 mostrarContrasena:', this.mostrarContrasena);
    } else {
      this.mostrarConfirmar = !this.mostrarConfirmar;
      console.log('🔍 mostrarConfirmar:', this.mostrarConfirmar);
    }
  }

  enviar(): void {
    console.log('📤 Enviando formulario de registro...');
    console.log('📄 Datos ingresados:', {
      email: this.email,
      nombre: this.nombre,
      fechaNacimiento: this.fechaNacimiento,
      password: this.password,
      passwordConfirm: this.passwordConfirm,
    });

    // Validar campos
    if (!this.email || !this.nombre || !this.fechaNacimiento || !this.password || !this.passwordConfirm) {
      this.error = 'Por favor completa todos los campos';
      console.log('❌ Error: faltan campos');
      return;
    }

    // Validar que contraseñas coincidan
    if (this.password !== this.passwordConfirm) {
      this.error = 'Las contraseñas no coinciden';
      console.log('❌ Error: contraseñas no coinciden');
      return;
    }

    this.cargando = true;
    this.error = '';
    console.log('⏳ Cargando = true');

    const payload = {
      email: this.email,
      nombre: this.nombre,
      fechaNacimiento: this.fechaNacimiento,
      password: this.password,
      passwordConfirm: this.passwordConfirm,
    };

    console.log('📨 Enviando payload al backend:', payload);

    this.authService.register(payload).subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta del backend:', response);

        if (response.success) {
          console.log('🎉 Registro exitoso, guardando email...');
          sessionStorage.setItem('emailVerificacion', this.email);

          this.exito = response.message;
          
          console.log('⏳ Redirigiendo a /verificacion en 2 segundos...');
          setTimeout(() => {
            console.log('➡️ Navegando a /verificacion...');
            this.router.navigate(['/verificacion']);
          }, 2000);
        } else {
          console.log('❌ El backend respondió success = false');
          this.error = response.message;
        }

        this.cargando = false;
        console.log('⏳ Cargando = false');
      },

      error: (err: any) => {
        console.log('🚨 Error recibido del backend:', err);
        console.log('📌 err.error:', err?.error);

        this.error = err.error?.message || 'Error al registrarse';
        this.cargando = false;

        console.log('⏳ Cargando = false');
      },
    });
  }
}
