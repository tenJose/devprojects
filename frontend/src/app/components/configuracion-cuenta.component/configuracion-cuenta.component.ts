import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { HttpClient } from '@angular/common/http'; // Importar si no usas el servicio directo

@Component({
  selector: 'app-configuracion-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cuenta-container">
      <h2>Configuración de Cuenta</h2>
      
      <div *ngIf="mensaje" [class]="tipoMensaje">{{ mensaje }}</div>

      <form (ngSubmit)="actualizar()">
        <div class="form-group">
            <label>Nombre</label>
            <input [(ngModel)]="datos.nombre" name="nombre" type="text">
        </div>
        <div class="form-group">
            <label>Apellido</label>
            <input [(ngModel)]="datos.apellido" name="apellido" type="text">
        </div>
        <div class="form-group">
            <label>Email</label>
            <input [(ngModel)]="datos.email" name="email" type="email">
        </div>

        <hr>
        <h3>Cambiar Contraseña</h3>
        <div class="form-group">
            <label>Contraseña Actual</label>
            <input [(ngModel)]="datos.currentPassword" name="currPass" type="password">
        </div>
        <div class="form-group">
            <label>Nueva Contraseña</label>
            <input [(ngModel)]="datos.newPassword" name="newPass" type="password">
        </div>

        <button type="submit" class="btn-primary">Guardar Cambios</button>
      </form>
    </div>
  `,
  styles: [`
    .cuenta-container { max-width: 600px; margin: 2rem auto; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
    .form-group input { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
    .btn-primary { background: #007bff; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; }
    .success { color: green; background: #e8f5e9; padding: 1rem; margin-bottom: 1rem; }
    .error { color: red; background: #ffebee; padding: 1rem; margin-bottom: 1rem; }
  `]
})
export class ConfiguracionCuentaComponent implements OnInit {
  datos = {
    nombre: '',
    apellido: '',
    email: '',
    currentPassword: '',
    newPassword: ''
  };
  mensaje = '';
  tipoMensaje = '';

  constructor(private usuarioService: UsuarioService, private http: HttpClient) {}

  ngOnInit() {
    this.usuarioService.obtenerPerfil().subscribe((res: any) => {
        if(res.success) {
            this.datos.nombre = res.data.nombre;
            // Asegúrate de que tu backend devuelva el apellido en obtenerPerfil
            this.datos.apellido = res.data.apellido || ''; 
            this.datos.email = res.data.email;
        }
    });
  }

  actualizar() {
    // Necesitarás agregar este método a tu UsuarioService que llame a PUT /api/users/cuenta
    // Aquí uso http directo como ejemplo rápido, pero idealmente usa el servicio.
    const token = localStorage.getItem('token'); // O usa tu AuthService
    
    this.http.put('http://localhost:3000/api/users/cuenta', this.datos, {
        headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
        next: (res: any) => {
            this.mensaje = res.message;
            this.tipoMensaje = 'success';
            this.datos.currentPassword = '';
            this.datos.newPassword = '';
        },
        error: (err) => {
            this.mensaje = err.error.message || 'Error al actualizar';
            this.tipoMensaje = 'error';
        }
    });
  }
}