import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { ProjectService, Project, BackendProject } from "../../services/project.service"
import { AuthService } from "../../services/auth.service"
import { UsuarioService, UserSearchResult } from "../../services/usuario.service" 
import { PostulacionService } from '../../services/postulacion.service'; // Asegúrate de crear este servicio


@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  activeTab: "projects" | "people" = "projects"

  projects: Project[] = []
  users: UserSearchResult[] = [] // Added users array

  loading = true
  error = ""
  
  
  
  private readonly API_BASE_URL = 'http://localhost:3000'; // Ajusta según tu .env
  
  
  // Filter states
  searchQuery = ""
  selectedStack: { [key: string]: boolean } = {} // Changed to object for multiple selection
  selectedType = ""
  selectedCompensation = "" // Range slider logic will be separate

  // Range slider values
  minBudget = 20
  maxBudget = 100

  // Pagination
  currentPage = 1
  totalPages = 1
  itemsPerPage = 6

  // Available filters
  techStacks = [
    "React",
    "Angular",
    "Vue",
    "Next.js",
    "Node.js",
    "Python",
    "Java",
    "Spring Boot",
    "Docker",
    "AWS",
    "TypeScript",
    "PostgreSQL",
    "MongoDB",
  ]

  contractTypes = ["Full Time", "Part Time", "Contract", "Freelance"]
  experienceLevels = ["Junior", "Mid-Level", "Senior", "Lead"]

  // User data
  currentUser: any = null
  showLogoutModal = false

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private postulacionService: PostulacionService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadUserProfile()
    this.performSearch() // Initial search
  }

  

  performSearch() {
    this.loading = true
    const filters = {
      search: this.searchQuery,
      tecnologias: Object.keys(this.selectedStack)
        .filter((k) => this.selectedStack[k])
        .join(","),
      // Add other filters if needed by backend
      minBudget: this.minBudget,
      maxBudget: this.maxBudget,
    }

    if (this.activeTab === "projects") {
      this.projectService.getProjects().subscribe({
  next: (projects: BackendProject[]) => {
  this.projects = projects.map(p => ({
    id: p.id,
    title: p.titulo,
    description: p.descripcion,
    type: p.tipo_proyecto,
    techStack: p.tecnologias,
    budget: p.presupuesto,
    usuarioCreadorId: p.usuarioCreadorId,
    compensation: p.presupuesto,
    compensationType: p.tipo_pago ?? "Fixed",
    duration: p.duracion,
    location: p.ubicacion,
    createdAt: p.createdAt,
    creator: p.usuarioCreador
      ? {
          id: p.usuarioCreador.id,
          name: p.usuarioCreador.nombre,
          avatar: p.usuarioCreador.avatar
        }
      : undefined
  }));

  this.loading = false;
}
,
  error: (err) => {
    console.error(err);
    this.error = "Error al cargar los proyectos";
    this.loading = false;  // También debe actualizarse en caso de error
  }
})

    } else {
      this.usuarioService.searchUsers(filters).subscribe({
        next: (data) => {
          this.users = data
          this.loading = false
          this.calculatePagination(this.users.length)
        },
        error: (err) => {
          this.error = "Error al cargar usuarios"
          this.loading = false
          console.error(err)
        },
      })
    }
  }

  calculatePagination(totalItems: number) {
    this.totalPages = Math.ceil(totalItems / this.itemsPerPage)
    if (this.currentPage > this.totalPages) this.currentPage = 1
  }

  get paginatedProjects(): Project[] {
  const start = (this.currentPage - 1) * this.itemsPerPage
  const end = start + this.itemsPerPage
  return this.projects.slice(start, end)
}

get paginatedUsers(): UserSearchResult[] {
  const start = (this.currentPage - 1) * this.itemsPerPage
  const end = start + this.itemsPerPage
  return this.users.slice(start, end)
}


  switchTab(tab: "projects" | "people") {
    this.activeTab = tab
    this.currentPage = 1
    this.performSearch()
  }

  toggleTech(tech: string) {
    if (this.selectedStack[tech]) {
      delete this.selectedStack[tech]
    } else {
      this.selectedStack[tech] = true
    }
  }

  loadUserProfile() {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentUser = response.data
        }
      },
      error: (err) => {
        console.error("Error loading profile:", err)
      },
    })
  }

 // 3. FUNCIÓN VER DETALLES CORREGIDA
  viewDetails(id: number) {
    if (this.activeTab === "projects") {
      // Navegar a detalle de proyecto (si tienes el componente)
      this.router.navigate(["/project", id]); 
    } else {
      //  AHORA NAVEGA AL PERFIL PÚBLICO
      this.router.navigate(["/user", id]); 
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
    }
  }

  // Navigation Methods
  navigateToCreateProject() {
    this.router.navigate(["/create-project"])
  }

  navigateToMessages() {
    this.router.navigate(["/messages"])
  }

  navigateToProfile() {
    this.router.navigate(["/configurar-perfil"]) // Or wherever the edit profile is
  }

  confirmLogout() {
    this.showLogoutModal = true
  }

  cancelLogout() {
    this.showLogoutModal = false
  }

  logout() {
    this.authService.logout()
    this.router.navigate(["/"])
    this.showLogoutModal = false
  }

  // ✅ NUEVO: Método para construir la URL completa de la foto
 getFullPhotoUrl(fileName: string | null | undefined): string {
  if (!fileName) return 'assets/default-avatar.png';
  if (fileName.startsWith('/uploads')) {
    return `${this.API_BASE_URL}${fileName}`;
  }
  return `${this.API_BASE_URL}/uploads/${fileName}`;
}

applyToProject(projectId: number) {
  if (!this.currentUser) {
    alert("Debes iniciar sesión para postularte a un proyecto.");
    return;
  }

  const payload = {
    usuarioId: this.currentUser.id,
    proyectoId: projectId,
    mensaje: "¡Hola! Me interesa postularme a este proyecto.", // Opcional, puedes abrir modal para personalizar
    propuesta: "", // Aquí el usuario podría agregar su propuesta
    presupuestoPropuesto: null, // opcional
  };

  this.postulacionService.createPostulacion(payload).subscribe({
    next: (res) => {
      alert("Te has postulado correctamente a este proyecto.");
    },
    error: (err) => {
      console.error(err);
      alert("Hubo un error al postularte.");
    },
  });
}

editProject(projectId: number) {
  // Navegar al componente de edición de proyecto
  this.router.navigate(['/edit-project', projectId]);
}




}
