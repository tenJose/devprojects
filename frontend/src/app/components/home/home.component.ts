import { Component, type OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { ProjectService, Project } from "../../services/project.service"
import { AuthService } from "../../services/auth.service"
import { UsuarioService, UserSearchResult } from "../../services/usuario.service"
import { PostulacionService } from '../../services/postulacion.service'
import { NotificationService } from '../../services/notification.service';
import { FriendService } from '../../services/friend.service';

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit, OnDestroy {
  activeTab: "projects" | "people" = "projects"
  projects: Project[] = []
  users: UserSearchResult[] = [] 
  loading = true
  error = ""
  
  private readonly API_BASE_URL = 'http://localhost:3000';
  
  searchQuery = ""
  selectedStack: { [key: string]: boolean } = {}
  selectedType = ""
  
  minBudget = 0
  maxBudget = 10000 // Valor inicial: 10000 (sin límite efectivo)

  currentPage = 1
  totalPages = 1
  itemsPerPage = 6

  techStacks = [
    "React", "Angular", "Vue", "Next.js", "Node.js", "Python",
    "Java", "TypeScript", "JavaScript", "Docker", "AWS", "Figma",
    "PostgreSQL", "MongoDB", "MySQL", "GraphQL", "REST API",
    "Flutter", "React Native", "Swift", "Kotlin", "Firebase"
  ]

  projectTypes = ["Frontend", "Backend", "Full Stack", "Mobile", "DevOps", "UI/UX", "Data Science"]
  selectedProjectType = ""

  currentUser: any = null
  showLogoutModal = false

  showNotificationsModal = false;
  notificationTab: 'todas' | 'mensajes' = 'todas';
  notificaciones: { amistades: any[], postulaciones: any[], sistema: any[] } = { amistades: [], postulaciones: [], sistema: [] };
  hasNewNotifications = false;
  private notificationInterval: any;

  get todasNotificaciones() {
    return [...this.notificaciones.amistades, ...this.notificaciones.postulaciones, ...this.notificaciones.sistema];
  }

  get unreadNotificationsCount(): number {
    const amistadesNoLeidas = this.notificaciones.amistades.filter((a: any) => a.estado === 'pendiente').length;
    const postulacionesNoLeidas = this.notificaciones.postulaciones.filter((p: any) => p.estado === 'pendiente').length;
    const sistemaNoLeidas = this.notificaciones.sistema.length;
    return amistadesNoLeidas + postulacionesNoLeidas + sistemaNoLeidas;
  }

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
    
    // Actualizar notificaciones cada 10 segundos
    this.notificationInterval = setInterval(() => {
      this.loadNotifications();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
  }

  performSearch() {
    this.loading = true
    const filters = {
      search: this.searchQuery,
      tecnologias: Object.keys(this.selectedStack)
        .filter((k) => this.selectedStack[k])
        .join(","),
      tipoProyecto: this.selectedProjectType,
      presupuestoMin: this.minBudget,
      presupuestoMax: this.maxBudget > 0 ? this.maxBudget : undefined,
    }

    if (this.activeTab === "projects") {
      this.projectService.getProjects(filters).subscribe({
        next: (projects: Project[]) => {
          this.projects = projects;
          this.loading = false;
          this.calculatePagination(this.projects.length);
        },
        error: (err: any) => { // ✅ Corrección: Tipo 'any' explícito
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
        error: (err: any) => { // ✅ Corrección: Tipo 'any' explícito
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

// ✅ NUEVO MÉTODO: Para navegar a perfil de usuario explícitamente desde notificaciones
  viewUserProfile(userId: number) {
    this.showNotificationsModal = false; // Cerramos el modal
    this.router.navigate(['/user', userId]);
  }

  // ... (tu método viewDetails original sigue sirviendo para las listas principales)
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
    this.router.navigate(["/configuracion-perfil"])
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
      const errorMsg = err?.error?.error || err?.error?.message || "Hubo un error al postularte.";
      alert(errorMsg);
    },
  });
}

editProject(projectId: number) {
  this.router.navigate(['/edit-project', projectId]);
}


loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        console.log('[Frontend] Notificaciones recibidas:', res);
        if (res.success && res.data) {
          // Asegurar que todos los arrays existan
          this.notificaciones = {
            amistades: res.data.amistades || [],
            postulaciones: res.data.postulaciones || [],
            sistema: res.data.sistema || []
          };
          console.log('[Frontend] Amistades:', this.notificaciones.amistades);
          console.log('[Frontend] Postulaciones:', this.notificaciones.postulaciones);
          console.log('[Frontend] Sistema:', this.notificaciones.sistema);
          this.hasNewNotifications = 
            this.notificaciones.amistades.length > 0 || 
            this.notificaciones.postulaciones.length > 0 ||
            this.notificaciones.sistema.length > 0;
        }
      },
      error: (err) => {
        console.error('[Frontend] Error cargando notificaciones:', err);
      }
    });
  }

  marcarNotificacionLeida(notifId: number) {
    this.notificationService.markAsRead(notifId).subscribe({
      next: () => {
        this.notificaciones.sistema = this.notificaciones.sistema.filter((n: any) => n.id !== notifId);
      },
      error: (err) => console.error('Error al marcar notificación:', err)
    });
  }

  toggleNotifications() {
    this.showNotificationsModal = !this.showNotificationsModal;
    
    if (this.showNotificationsModal) {
      this.loadNotifications();
    }
  }

  responderAmistad(solicitud: any, aceptar: boolean) {
    if (aceptar) {
      this.friendService.acceptRequest(solicitud.id).subscribe({
        next: () => {
           this.loadNotifications();
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

  // ✅ CORREGIDO: Tipo explícito para 'postulacion'
  responderPostulacion(postulacion: any, aceptar: boolean) {
    const estado = aceptar ? 'aceptado' : 'rechazado';
    const mensaje = aceptar ? 'aceptada' : 'rechazada';
    
    this.postulacionService.responderPostulacion(postulacion.id, estado).subscribe({
        next: () => {
            // Mostrar mensaje de confirmación
            alert(`¡Postulación ${mensaje}!`);
            
            // Si se aceptó, crear conversación automáticamente
            if (aceptar) {
              this.crearConversacionAutomatica(postulacion);
            }
            
            // Recargar notificaciones (esto eliminará la notificación procesada)
            this.loadNotifications(); 
        },
        error: (err: any) => alert("Error al actualizar postulación")
    });
  }

  crearConversacionAutomatica(postulacion: any) {
    // Redirigir a mensajes con el usuario y proyecto
    const mensaje = `¡Hola! He aceptado tu postulación para el proyecto "${postulacion.proyecto.titulo}". Hablemos sobre los detalles.`;
    
    // Guardar en localStorage el mensaje inicial y proyecto
    localStorage.setItem('newConversation', JSON.stringify({
      userId: postulacion.usuario.id,
      projectId: postulacion.proyecto.id,
      initialMessage: mensaje
    }));
    
    // Cerrar modal y navegar
    this.showNotificationsModal = false;
    this.router.navigate(['/messages'], { 
      queryParams: { 
        userId: postulacion.usuario.id,
        projectId: postulacion.proyecto.id
      } 
    });
  }
}