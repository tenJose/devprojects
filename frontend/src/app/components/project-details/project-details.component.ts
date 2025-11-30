import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// 🔴 ANTES: import type { ActivatedRoute, Router } from '@angular/router';
// 🟢 AHORA (Sin 'type'):
import { ActivatedRoute, Router } from '@angular/router';

// 🔴 ANTES: import type { ProjectService, Project } from '../../services/project.service';
// 🟢 AHORA (Sin 'type' para el servicio):
import { ProjectService, Project } from '../../services/project.service';

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
  isSaved = false;

  constructor(
    private route: ActivatedRoute,       // Ahora sí funciona
    private router: Router,
    private projectService: ProjectService // Ahora sí funciona
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadProject(id);
      }
    });
  }

  loadProject(id: number) {
    this.loading = true;
    this.projectService.getProjectById(id).subscribe({
      next: (data) => {
        this.project = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el proyecto';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyToProject() {
    this.isApplied = true;
    // Lógica futura para postularse
  }

  saveProject() {
    this.isSaved = !this.isSaved;
    // Lógica futura para guardar
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}