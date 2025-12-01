import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verificacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verificacion.component.html',
  styleUrls: ['./verificacion.component.css'],
})
export class VerificacionComponent implements OnInit {
  // ✅ CAMBIO: 'codigo' ahora es un simple string, no un array []
  codigo: string = '';
  email: string = '';

  cargando: boolean = false;
  bloqueoReenvio: boolean = false;
  error: string = '';
  mensaje: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ CORRECCIÓN: Recuperamos el email de sessionStorage (donde lo guarda tu registro)
    const emailGuardado = sessionStorage.getItem('emailVerificacion');
    
    if (emailGuardado) {
      this.email = emailGuardado;
    } else {
      // Si no hay email, significa que no viene del registro -> volver
      this.router.navigate(['/registro']);
    }
  }

  verificar(): void {
    // Validamos que haya algo escrito
    if (!this.codigo || this.codigo.length < 4) {
      this.error = 'Por favor ingresa el código completo.';
      return;
    }

    this.cargando = true;
    this.error = '';

    // ✅ Enviamos 'this.codigo' directamente (ya es el string completo)
    this.authService.verificar(this.email, this.codigo).subscribe({
      next: (response: any) => {
        this.cargando = false;
        
        if (response.success) {
          this.mensaje = '¡Cuenta verificada exitosamente!';
          
          // Limpiamos la sesión
          sessionStorage.removeItem('emailVerificacion');

          setTimeout(() => {
            // Redirigir al login (o home si el backend devuelve token y lo guardas)
            this.router.navigate(['/login']);
          }, 1500);
        } else {
          this.error = response.message;
        }
      },
      error: (err: any) => {
        this.cargando = false;
        this.error = err.error?.message || 'Código incorrecto o expirado.';
      }
    });
  }

  reenviar(): void {
    if (this.bloqueoReenvio) return;
    
    this.bloqueoReenvio = true;
    this.mensaje = '';
    this.error = '';

    this.authService.reenviarCodigo(this.email).subscribe({
      next: (res: any) => {
        this.mensaje = 'Código reenviado. Revisa tu correo.';
        // Bloqueo de 30 seg para evitar spam
        setTimeout(() => this.bloqueoReenvio = false, 30000);
      },
      error: (err: any) => {
        this.bloqueoReenvio = false;
        this.error = 'No se pudo reenviar el código.';
      }
    });
  }
}