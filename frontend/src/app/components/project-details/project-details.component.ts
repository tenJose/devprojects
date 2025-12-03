// frontend/src/app/components/project-details/project-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, Project } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { PostulacionService } from '../../services/postulacion.service';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {
  project: Project | null = null;
  loading = true;
  error = '';
  isApplied = false;
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private authService: AuthService,
    private postulacionService: PostulacionService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) this.loadProject(id);
    });
  }

  loadProject(id: number) {
    this.loading = true;
    this.projectService.getProjectById(id).subscribe({
      next: (data) => {
        // Parsear datos que vienen como string JSON o CSV desde la BD
        this.project = {
          ...data,
          tecnologias: this.safeParseArray(data.tecnologias),
          lenguajes: this.safeParseArray(data.lenguajes),
          adjuntos: this.safeParseArray(data.adjuntos),
          // normalize snake_case fields from backend
          duracionEstimada: (data as any).duracion_estimada || data.duracionEstimada || (data as any).duracion || null,
          tamanoEquipo: (data as any).tamano_equipo || data.tamanoEquipo || null,
          fechaLimite: (data as any).fecha_limite || data.fechaLimite || null,
          datosAdicionales: (data as any).datos_adicionales || data.datosAdicionales || null,
          presupuesto: data.presupuesto ? Number(data.presupuesto) : null
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar el proyecto.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  isImage(file: string | undefined): boolean {
    if (!file) return false;
    return /\.(png|jpg|jpeg|gif)$/i.test(file);
  }

  // Función auxiliar para limpiar arrays que vienen como strings
  private safeParseArray(input: string | string[] | undefined): string[] {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    try {
      // Intenta parsear JSON ["React", "Node"]
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [input];
    } catch (e) {
      // Si falla, asume que es separado por comas "React, Node"
      return input.split(',').map(item => item.trim());
    }
  }

  getFullPhotoUrl(url: string | undefined): string {
    if (!url) return 'assets/default-avatar.png';
    return url.startsWith('http') ? url : `http://localhost:3000${url}`;
  }

  openFile(url: string) {
    const full = this.getFullPhotoUrl(url);
    window.open(full, '_blank');
  }

  applyToProject() {
    if (!this.project) return;
    if (!this.currentUser) { alert('Debes iniciar sesión para postularte.'); return; }
    if (this.isApplied) { alert('Ya enviaste una solicitud para este proyecto.'); return; }
    if (this.currentUser.id === (this.project as any).usuarioCreadorId) { alert('No puedes postularte a tu propio proyecto.'); return; }

    const payload = {
      usuarioId: this.currentUser.id,
      proyectoId: this.project.id,
      mensaje: '¡Hola! Me interesa postularme a este proyecto.',
      propuesta: '',
      presupuestoPropuesto: null,
    };

    this.postulacionService.createPostulacion(payload).subscribe({
      next: () => {
        this.isApplied = true;
        alert('Solicitud enviada exitosamente.');
      },
      error: (err) => {
        console.error(err);
        const msg = err?.error?.error || err?.error?.message || 'Hubo un error al enviar tu solicitud.';
        alert(msg);
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}