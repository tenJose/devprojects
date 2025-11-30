import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
// ✅ Importamos solo Project (BackendProject ya no es necesario)
import { ProjectService, Project } from "../../services/project.service"
import { AuthService } from "../../services/auth.service"
import { UsuarioService, UserSearchResult } from "../../services/usuario.service"
import { PostulacionService } from '../../services/postulacion.service'
import { NotificationService } from '../../services/notification.service';
import { FriendService } from '../../services/friend.service'; // Usaremos este para aceptar

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
  users: UserSearchResult[] = [] 
  loading = true
  error = ""
  
  private readonly API_BASE_URL = 'http://localhost:3000';
  
  // Filter states
  searchQuery = ""
  selectedStack: { [key: string]: boolean } = {}
  selectedType = ""
  
  minBudget = 20
  maxBudget = 100

  currentPage = 1
  totalPages = 1
  itemsPerPage = 6

  techStacks = [
    "React", "Angular", "Vue", "Next.js", "Node.js", "Python",
    "Java", "Spring Boot", "Docker", "AWS", "TypeScript", "PostgreSQL", "MongoDB",
  ]

  currentUser: any = null
  showLogoutModal = false

  // Variables para notificaciones
  showNotificationsModal = false;
  notificationTab: 'amistades' | 'postulaciones' = 'amistades';
  notificaciones: { amistades: any[], postulaciones: any[] } = { amistades: [], postulaciones: [] };
  hasNewNotifications = false;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private postulacionService: PostulacionService,
    private router: Router,
    private notificationService: NotificationService,
    private friendService: FriendService
  ) {}

  ngOnInit() {
    this.loadUserProfile()
    this.performSearch()
    this.loadNotifications()
  }

  

  performSearch() {
    this.loading = true
    const filters = {
      search: this.searchQuery,
      tecnologias: Object.keys(this.selectedStack)
        .filter((k) => this.selectedStack[k])
        .join(","),
      minBudget: this.minBudget,
      maxBudget: this.maxBudget,
    }

    if (this.activeTab === "projects") {
      this.projectService.getProjects(filters).subscribe({
        next: (projects: Project[]) => {
          // ✅ Asignación directa sin mapeo manual
          this.projects = projects;
          this.loading = false;
          this.calculatePagination(this.projects.length);
        },
        error: (err) => {
          console.error(err);
          this.error = "Error al cargar los proyectos";
          this.loading = false;
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

  viewDetails(id: number) {
    if (this.activeTab === "projects") {
      this.router.navigate(["/project", id]); 
    } else {
      this.router.navigate(["/user", id]); 
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
    }
  }

  navigateToCreateProject() {
    this.router.navigate(["/create-project"])
  }

  navigateToMessages() {
    this.router.navigate(["/messages"])
  }

  navigateToProfile() {
    this.router.navigate(["/configurar-perfil"])
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
    mensaje: "¡Hola! Me interesa postularme a este proyecto.",
    propuesta: "",
    presupuestoPropuesto: null,
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
  this.router.navigate(['/edit-project', projectId]);
}


loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        if (res.success) {
          this.notificaciones = res.data;
          this.hasNewNotifications = 
            this.notificaciones.amistades.length > 0 || 
            this.notificaciones.postulaciones.length > 0;
        }
      }
    });
  }

  toggleNotifications() {
    console.log("Abriendo notificaciones..."); // 👈 Agrega esto para depurar
    this.showNotificationsModal = !this.showNotificationsModal;
    
    if (this.showNotificationsModal) {
      this.loadNotifications();
    }
  
  }

  responderAmistad(solicitud: any, aceptar: boolean) {
    if (aceptar) {
      this.friendService.acceptRequest(solicitud.id).subscribe({
        next: () => {
           this.loadNotifications(); // Recargar lista
           alert("Solicitud aceptada");
        },
        error: (err) => {
          console.error(err);
          alert("Error al aceptar solicitud");
        }
      });
    } else {
      // Si implementaste rejectRequest
      this.friendService.rejectRequest(solicitud.id).subscribe({
        next: () => {
           this.loadNotifications();
           alert("Solicitud rechazada");
        },
        error: (err) => {
          console.error(err);
          alert("Error al rechazar solicitud");
        }
      });
    }
  }
}
