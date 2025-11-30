import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { ProjectService } from "../../services/project.service"
import { AuthService } from "../../services/auth.service";
import { UsuarioService } from "../../services/usuario.service";

@Component({
  selector: "app-create-project",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./create-project.component.html",
  styleUrls: ["./create-project.component.css"],
})
export class CreateProjectComponent {

  currentUser: any = null;

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
  }

  techInput = ""
  loading = false
  error = ""

  availableTechs = ["React", "Angular", "Vue", "Node.js", "Python", "Java", "AWS", "Docker", "Figma", "TypeScript"]
  projectTypes = ["Frontend", "Backend", "Full Stack", "Mobile", "DevOps", "UI/UX", "Data Science"]

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private authService: AuthService,      
    private usuarioService: UsuarioService
  ) {
    this.loadUserProfile();
  }

  addTech(tech: string) {
    if (tech && !this.project.techStack.includes(tech)) {
      this.project.techStack.push(tech)
    }
    this.techInput = ""
  }

  removeTech(tech: string) {
    this.project.techStack = this.project.techStack.filter((t) => t !== tech)
  }

  onTechInputKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault()
      this.addTech(this.techInput)
    }
  }

  createProject() {
    if (!this.project.title || !this.project.description) {
      this.error = "Por favor completa los campos requeridos"
      return
    }

    if (!this.currentUser?.id) {
    this.error = "No se pudo identificar al usuario";
    return;
    }

    this.loading = true
    this.error = ""

    // Transform data to match backend schema if necessary
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
    usuarioCreadorId: this.currentUser.id // ✅ IMPORTANTE
  };

    this.projectService.createProject(projectData as any).subscribe({
      next: (res) => {
        this.loading = false
        this.router.navigate(["/home"])
      },
      error: (err) => {
        this.loading = false
        this.error = "Error al crear el proyecto. Intenta nuevamente."
        console.error(err)
      },
    })
  }

  saveAsDraft() {
    // Logic for saving as draft
    console.log("Guardando como borrador...", this.project)
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

}
