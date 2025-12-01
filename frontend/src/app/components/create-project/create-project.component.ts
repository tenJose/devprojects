import { Component, OnInit } from "@angular/core"; // 1. Agregado OnInit
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute, RouterLink } from "@angular/router"; // 2. Agregado ActivatedRoute
import { ProjectService } from "../../services/project.service";
import { AuthService } from "../../services/auth.service";
import { UsuarioService } from "../../services/usuario.service";

@Component({
  selector: "app-create-project",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./create-project.component.html",
  styleUrls: ["./create-project.component.css"],
})
export class CreateProjectComponent implements OnInit { // 3. Implementar OnInit

  currentUser: any = null;
  isEditMode = false;
  projectId: number | null = null;

  project = {
    title: "",
    description: "",
    techStack: [] as string[],
    newTech: "",
    type: "Frontend",
    budget: null,
    compensationType: "Fixed Price",
    duration: "",
    location: "Remote",
    teamSize: "",
    deadline: "",
  };

  techInput = "";
  loading = false;
  error = "";

  availableTechs = ["React", "Angular", "Vue", "Node.js", "Python", "Java", "AWS", "Docker", "Figma", "TypeScript"];
  projectTypes = ["Frontend", "Backend", "Full Stack", "Mobile", "DevOps", "UI/UX", "Data Science"];

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute, // 4. Inyectar ActivatedRoute (Soluciona error 'route does not exist')
    private authService: AuthService,      
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    
    // 5. Tipar 'params' explícitamente como 'any' (Soluciona error 'implicitly has an any type')
    this.route.params.subscribe((params: any) => {
      if (params['id']) {
        this.isEditMode = true;
        this.projectId = +params['id'];
        this.loadProjectData(this.projectId);
      }
    });
  }

  loadProjectData(id: number) {
    this.loading = true;
    this.projectService.getProjectById(id).subscribe({
      next: (data: any) => {
        this.project = {
            title: data.titulo,
            description: data.descripcion,
            // Aseguramos que sea array. Si el backend lo devuelve como string JSON, lo parseamos.
            techStack: Array.isArray(data.tecnologias) ? data.tecnologias : JSON.parse(data.tecnologias || '[]'),
            newTech: "",
            type: data.tipo_proyecto || data.tipoProyecto, // Ajustar según lo que devuelva tu backend
            budget: data.presupuesto,
            compensationType: data.presupuestoTipo || "Fixed Price",
            duration: data.duracion || data.duracionEstimada,
            location: data.ubicacion,
            teamSize: data.tamanoEquipo || "",
            deadline: data.fechaLimite ? data.fechaLimite.split('T')[0] : ""
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = "Error al cargar el proyecto";
        this.loading = false;
      }
    });
  }

  addTech(tech: string) {
    if (tech && !this.project.techStack.includes(tech)) {
      this.project.techStack.push(tech);
    }
    this.techInput = "";
  }

  removeTech(tech: string) {
    this.project.techStack = this.project.techStack.filter((t) => t !== tech);
  }

  onTechInputKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.addTech(this.techInput);
    }
  }

  createProject() {
    if (!this.project.title || !this.project.description) {
      this.error = "Por favor completa los campos requeridos";
      return;
    }

    if (!this.currentUser?.id) {
      this.error = "No se pudo identificar al usuario";
      return;
    }

    this.loading = true;
    this.error = "";

    const projectData = {
      nombre: this.project.title,
      descripcion: this.project.description,
      tecnologias: JSON.stringify(this.project.techStack),
      tipoProyecto: this.project.type,
      presupuesto: this.project.budget,
      presupuestoTipo: this.project.compensationType,
      duracionEstimada: this.project.duration,
      ubicacion: this.project.location,
      tamanoEquipo: this.project.teamSize,
      fechaLimite: this.project.deadline ? new Date(this.project.deadline) : null,
      usuarioCreadorId: this.currentUser.id
    };

    if (this.isEditMode && this.projectId) {
      // 6. Usamos 'as any' para evitar el conflicto de tipos (string vs string[])
      this.projectService.updateProject(this.projectId, projectData as any).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(["/home"]);
        },
        error: (err) => {
          this.loading = false;
          this.error = "Error al actualizar el proyecto.";
          console.error(err);
        }
      });
    } else {
      // Usamos 'as any' aquí también
      this.projectService.createProject(projectData as any).subscribe({
        next: (res) => {
          this.loading = false;
          this.router.navigate(["/home"]);
        },
        error: (err) => {
          this.loading = false;
          this.error = "Error al crear el proyecto. Intenta nuevamente.";
          console.error(err);
        },
      });
    }
  }

  loadUserProfile() {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.currentUser = res.data;
        }
      },
      error: (err) => console.error("Error loading profile:", err)
    });
  }

  getFullPhotoUrl(fileName: string | null | undefined): string {
    if (!fileName) return 'assets/default-avatar.png';
    if (fileName.startsWith('/uploads')) return `http://localhost:3000${fileName}`;
    return `http://localhost:3000/uploads/${fileName}`;
  }

saveAsDraft() {
    console.log("Guardando borrador...", this.project);
    // Aquí puedes implementar la lógica real, por ejemplo guardar en localStorage
    alert("Funcionalidad de borrador no implementada aún, pero el botón funciona.");
  }

}