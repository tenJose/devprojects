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
          adjuntos: this.safeParseArray(data.adjuntos)
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

  applyToProject() {
    if (!this.project || !this.currentUser) return;
    
    // Aquí iría la llamada real al servicio de postulación
    alert("Funcionalidad de postulación lista para conectar con backend.");
    this.isApplied = true;
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}