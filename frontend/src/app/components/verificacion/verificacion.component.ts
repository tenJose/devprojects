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

  codigo: string[] = ['', '', '', '', '', ''];
  email: string = '';
  cargando = false;
  error = '';
  exito = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const emailGuardado = sessionStorage.getItem('emailVerificacion');
    if (!emailGuardado) {
      this.router.navigate(['/registro']);
      return;
    }
    this.email = emailGuardado;
  }

  // Cuando el usuario escribe un número
  onInputChange(index: number): void {
    const valor = this.codigo[index];

    // Solo permitir dígitos
    if (!/^\d$/.test(valor)) {
      this.codigo[index] = '';
      return;
    }

    // Enfocar siguiente input
    if (index < 5) {
      const next = document.getElementById(`digit-${index + 1}`) as HTMLInputElement;
      next?.focus();
    }
  }

  // Manejo de retroceso
  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && this.codigo[index] === '' && index > 0) {
      const prev = document.getElementById(`digit-${index - 1}`) as HTMLInputElement;
      prev?.focus();
    }
  }

  verificar(): void {
    const codigoCompleto = this.codigo.join('');

    if (codigoCompleto.length !== 6) {
      this.error = 'Por favor completa los 6 dígitos';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.authService.verificar(this.email, codigoCompleto).subscribe({
      next: (response) => {
        if (response.success) {
          this.exito = response.message;

          setTimeout(() => {
            sessionStorage.removeItem('emailVerificacion');
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.error = response.message;
        }
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al verificar el código';
        this.cargando = false;
      }
    });
  }

  reenviar(): void {
    this.exito = 'Código reenviado a ' + this.email;
  }
}
