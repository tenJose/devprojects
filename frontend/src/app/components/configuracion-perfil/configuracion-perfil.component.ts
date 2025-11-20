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
  fotoPerfilFile!: File | null; // Archivo seleccionado
  previewFoto: string = '';
  descripcion: string = '';
  tecnologias: string = '';
  lenguajes: string = '';
  informacionExtra: string = '';

  cargando: boolean = false;
  error: string = '';
  exito: string = '';

  tecnologiasSugeridas = ['React','Angular','Vue.js','Node.js','Python','Java','C#','PHP','Ruby','Go','Rust','Kotlin'];
  lenguajesSugeridos = ['JavaScript','TypeScript','Python','Java','C++','C#','PHP','Ruby','Go','Rust','SQL'];

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.authService.obtenerToken();
    if (!token) {
      this.router.navigate(['/login']);
    } else {
      this.usuarioService.obtenerPerfil().subscribe((res: any) => {
        if (res.success) {
          this.descripcion = res.data.descripcion;
          this.tecnologias = res.data.tecnologias.join(', ');
          this.lenguajes = res.data.lenguajes.join(', ');
          this.informacionExtra = res.data.informacionExtra;
          this.previewFoto = res.data.fotoPerfil || '';
        }
      });
    }
  }

  onFotoSeleccionada(event: any): void {
    const archivo = event.target.files[0];
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) { this.error = 'Por favor selecciona una imagen válida'; return; }
    if (archivo.size > 5 * 1024 * 1024) { this.error = 'La imagen no debe superar 5MB'; return; }

    this.fotoPerfilFile = archivo;

    const reader = new FileReader();
    reader.onload = (e: any) => this.previewFoto = e.target.result;
    reader.readAsDataURL(archivo);
  }

  obtenerTecnologiasArray(): string[] {
    return this.tecnologias.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  obtenerLenguajesArray(): string[] {
    return this.lenguajes.split(',').map(l => l.trim()).filter(l => l.length > 0);
  }

  guardar(): void {
    if (!this.descripcion.trim() || this.descripcion.length < 20) { this.error = 'La descripción debe tener al menos 20 caracteres'; return; }
    if (this.obtenerTecnologiasArray().length === 0) { this.error = 'Por favor agrega al menos una tecnología'; return; }

    const formData = new FormData();
    formData.append('descripcion', this.descripcion);
    formData.append('tecnologias', JSON.stringify(this.obtenerTecnologiasArray()));
    formData.append('lenguajes', JSON.stringify(this.obtenerLenguajesArray()));
    formData.append('informacionExtra', this.informacionExtra);
    if (this.fotoPerfilFile) formData.append('fotoPerfil', this.fotoPerfilFile);

    this.cargando = true;
    this.error = '';

    this.usuarioService.configurarPerfil(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.exito = response.message;
          setTimeout(() => this.router.navigate(['/home']), 2000);
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

  agregarTecnologia(tech: string): void {
    const tecnologiasActuales = this.obtenerTecnologiasArray();
    if (!tecnologiasActuales.includes(tech)) {
      this.tecnologias = this.tecnologias ? this.tecnologias + ', ' + tech : tech;
    }
  }

  agregarLenguaje(lang: string): void {
    const lenguajesActuales = this.obtenerLenguajesArray();
    if (!lenguajesActuales.includes(lang)) {
      this.lenguajes = this.lenguajes ? this.lenguajes + ', ' + lang : lang;
    }
  }
}
