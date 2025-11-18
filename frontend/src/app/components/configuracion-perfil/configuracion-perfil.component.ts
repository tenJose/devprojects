// Componente de Configuración de Perfil

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-configuracion-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-perfil.component.html',
  styleUrls: ['./configuracion-perfil.component.css'],
})
export class ConfiguracionPerfilComponent implements OnInit {
  // Datos del formulario
  fotoPerfil: string = '';
  fotoPerfilBase64: string = '';
  descripcion: string = '';
  tecnologias: string = '';
  lenguajes: string = '';
  informacionExtra: string = '';

  // Estados
  cargando: boolean = false;
  error: string = '';
  exito: string = '';
  previewFoto: string = '';

  // Listas de tecnologías y lenguajes sugeridos
  tecnologiasSugeridas = [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java',
    'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Kotlin'
  ];

  lenguajesSugeridos = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++',
    'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'SQL'
  ];

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar que el usuario esté autenticado
    const token = this.authService.obtenerToken();
    if (!token) {
      this.router.navigate(['/login']);
    }
  }

  // Manejar selección de foto
  onFotoSeleccionada(event: any): void {
    const archivo = event.target.files[0];
    if (!archivo) return;

    // Validar que sea imagen
    if (!archivo.type.startsWith('image/')) {
      this.error = 'Por favor selecciona una imagen válida';
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      this.error = 'La imagen no debe superar 5MB';
      return;
    }

    // Convertir a Base64
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fotoPerfilBase64 = e.target.result; // Base64
      this.previewFoto = e.target.result; // Para mostrar preview
    };
    reader.readAsDataURL(archivo);
  }

  // Dividir string de tecnologías en array
  obtenerTecnologiasArray(): string[] {
    return this.tecnologias
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  // Dividir string de lenguajes en array
  obtenerLenguajesArray(): string[] {
    return this.lenguajes
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }

  // Enviar configuración de perfil
  guardar(): void {
    // Validar campos requeridos
    if (!this.descripcion.trim() || this.descripcion.length < 20) {
      this.error = 'La descripción debe tener al menos 20 caracteres';
      return;
    }

    if (this.obtenerTecnologiasArray().length === 0) {
      this.error = 'Por favor agrega al menos una tecnología';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.usuarioService
      .configurarPerfil({
        fotoPerfil: this.fotoPerfil || undefined,
        descripcion: this.descripcion,
        tecnologias: this.obtenerTecnologiasArray(),
        lenguajes: this.obtenerLenguajesArray(),
        informacionExtra: this.informacionExtra,
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.exito = response.message;
            
            // Redirigir al home después de 2 segundos
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 2000);
          } else {
            this.error = response.message;
          }
          this.cargando = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al guardar perfil';
          this.cargando = false;
        },
      });
  }

  // Agregar tecnología sugerida
  agregarTecnologia(tech: string): void {
    const tecnologiasActuales = this.obtenerTecnologiasArray();
    if (!tecnologiasActuales.includes(tech)) {
      this.tecnologias = this.tecnologias 
        ? this.tecnologias + ', ' + tech 
        : tech;
    }
  }

  // Agregar lenguaje sugerido
  agregarLenguaje(lang: string): void {
    const lenguajesActuales = this.obtenerLenguajesArray();
    if (!lenguajesActuales.includes(lang)) {
      this.lenguajes = this.lenguajes 
        ? this.lenguajes + ', ' + lang 
        : lang;
    }
  }
}
