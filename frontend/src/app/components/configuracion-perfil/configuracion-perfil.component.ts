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
  // Estado de selección de rol
  rolSeleccionado: 'usuario' | 'ingeniero' | null = null;

  fotoPerfilFile!: File | null;
  previewFoto: string = '';
  descripcion: string = '';
  tecnologias: string = '';
  lenguajes: string = '';
  informacionExtra: string = '';

  // Nuevos campos para redes sociales
  githubLink: string = '';
  twitterLink: string = '';
  facebookLink: string = '';

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
      // Cargamos datos existentes por si el usuario está editando su perfil
      this.usuarioService.obtenerPerfil().subscribe((res: any) => {
        if (res.success) {
          this.previewFoto = res.data.fotoPerfil || '';
          this.descripcion = res.data.descripcion || '';
          
          // Si ya tiene un rol definido distinto a usuario (ej. admin o ingeniero previo), lo seteamos
          // O si ya tiene tecnologías, asumimos que es ingeniero
          if (res.data.rol === 'ingeniero' || (res.data.tecnologias && res.data.tecnologias.length > 0)) {
             this.rolSeleccionado = 'ingeniero';
             this.tecnologias = res.data.tecnologias.join(', ');
             this.lenguajes = res.data.lenguajes.join(', ');
             this.informacionExtra = res.data.informacionExtra || '';
             
             // Cargar redes sociales si existen
             if (res.data.redesSociales) {
                const redes = typeof res.data.redesSociales === 'string' ? JSON.parse(res.data.redesSociales) : res.data.redesSociales;
                this.githubLink = redes.github || '';
                this.twitterLink = redes.twitter || '';
                this.facebookLink = redes.facebook || '';
             }
          } else if (res.data.descripcion) {
             // Si tiene descripción pero no tecnologías, probablemente ya configuró como usuario
             this.rolSeleccionado = 'usuario';
          }
          // Si no tiene nada, rolSeleccionado se mantiene null y muestra la selección
        }
      });
    }
  }

  seleccionarRol(rol: 'usuario' | 'ingeniero') {
    this.rolSeleccionado = rol;
    this.error = '';
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
    this.error = '';

    // Validaciones
    if (!this.descripcion.trim()) { 
        this.error = 'La descripción es obligatoria'; 
        return; 
    }

    if (this.rolSeleccionado === 'ingeniero') {
        if (this.descripcion.length < 20) { this.error = 'Como ingeniero, tu descripción debe ser más detallada (mínimo 20 caracteres)'; return; }
        if (this.obtenerTecnologiasArray().length === 0) { this.error = 'Por favor agrega al menos una tecnología'; return; }
    }

    const formData = new FormData();
    formData.append('rol', this.rolSeleccionado!); // Enviamos el rol
    formData.append('descripcion', this.descripcion);
    
    if (this.rolSeleccionado === 'ingeniero') {
        formData.append('tecnologias', JSON.stringify(this.obtenerTecnologiasArray()));
        formData.append('lenguajes', JSON.stringify(this.obtenerLenguajesArray()));
        formData.append('informacionExtra', this.informacionExtra);
        
        // Empaquetar redes sociales
        const redes = {
            github: this.githubLink,
            twitter: this.twitterLink,
            facebook: this.facebookLink
        };
        formData.append('redesSociales', JSON.stringify(redes));
    } else {
        // Para usuario normal, enviamos arrays vacíos para limpiar si hubiera basura
        formData.append('tecnologias', '[]');
        formData.append('lenguajes', '[]');
    }

    if (this.fotoPerfilFile) formData.append('fotoPerfil', this.fotoPerfilFile);

    this.cargando = true;

    this.usuarioService.configurarPerfil(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.exito = '¡Perfil configurado con éxito!';
          setTimeout(() => this.router.navigate(['/home']), 1500);
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