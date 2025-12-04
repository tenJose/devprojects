import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // ✅ RouterLink importante
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { FriendService } from '../../services/friend.service';
import { RatingService, Rating } from '../../services/rating.service';
import { RatingModalComponent } from '../rating-modal/rating-modal.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingModalComponent], // ✅ Agregado RatingModalComponent
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  loading: boolean = true;
  API_URL = 'http://localhost:3000';

  
  
  error: string = ''; 
  esMiPerfil: boolean = false; 

  currentUserId: number | null = null;
  areFriends: boolean = false;
  solicitudEnviada: boolean = false;

  // ✅ NUEVO: Proyectos y calificaciones
  proyectosActivos: any[] = [];
  proyectosCompletados: any[] = [];
  calificaciones: Rating[] = [];
  promedioCalificaciones: number = 0;
  totalCalificaciones: number = 0;
  loadingProjects: boolean = false;
  loadingRatings: boolean = false;

  // ✅ NUEVO: Proyectos para calificar
  proyectosParaCalificar: any[] = [];
  puedeCalificar: boolean = false;
  showRatingModal: boolean = false;
  proyectoACalificar: any = null;
  ratingLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private friendService: FriendService,
    private ratingService: RatingService,
    private router: Router
  ) {}

  ngOnInit() {
    const tokenPayload = this.authService.getCurrentUser();
    this.currentUserId = tokenPayload ? tokenPayload.id : null;
    
    if (!this.currentUserId) {
        const storedId = localStorage.getItem('userId');
        if (storedId) this.currentUserId = parseInt(storedId);
    }

    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.cargarUsuario(id);
        this.cargarProyectos(id);
        this.cargarCalificaciones(id);
        
        // Verificar si puedo calificar a este usuario
        if (this.currentUserId && this.currentUserId !== id) {
          this.verificarProyectosParaCalificar(id);
        }
      }
    });
  }

  cargarUsuario(id: number) {
    this.loading = true;
    this.error = '';

    // ✅ Ahora sí existe este método en el servicio
    this.usuarioService.obtenerUsuarioPublico(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.user = res.data;

          if (this.currentUserId && this.user) {
             this.esMiPerfil = this.currentUserId == this.user.id;

             if (!this.esMiPerfil) {
                this.verificarAmistad(id);
             }
          }
        } else {
           this.error = 'Usuario no encontrado';
        }
        this.loading = false;
      },
      error: (err: any) => { // ✅ CORRECCIÓN: Tipo 'any' explícito
        console.error(err);
        this.error = 'Error al cargar el perfil';
        this.loading = false;
      }
    });
  }

  verificarAmistad(friendId: number) {
    this.friendService.checkStatus(friendId).subscribe({
      next: (res) => {
        this.areFriends = res.status === 'aceptado';
        this.solicitudEnviada = res.status === 'pendiente';
      },
      error: () => {
        this.areFriends = false;
        this.solicitudEnviada = false;
      }
    });
  }

  enviarSolicitudAmistad(friendId: number) {
    if (!this.currentUserId) {
        alert("Debes iniciar sesión");
        return;
    }
    
    this.friendService.sendRequest(friendId).subscribe({
      next: () => {
        this.solicitudEnviada = true;
      },
      error: (err: any) => { // ✅ CORRECCIÓN: Tipo 'any' explícito
        console.error('Error al enviar solicitud', err);
        alert('Error al enviar la solicitud');
      }
    });
  }

  enviarMensaje(friendId: number) {
    this.router.navigate(['/messages'], { queryParams: { userId: friendId } });
  }

  tieneRedes(): boolean {
    return this.user?.redesSociales && (
        this.user.redesSociales.github || 
        this.user.redesSociales.twitter || 
        this.user.redesSociales.facebook
    );
  }

getFullPhotoUrl(fileName: string): string {
    if (!fileName) return 'assets/default-avatar.png'; // Imagen por defecto si es null
    
    // Si la imagen ya viene con http (ej. Google Auth), la devolvemos tal cual
    if (fileName.startsWith('http')) return fileName;
    
    // Concatenamos URL del backend + nombre del archivo (que suele ser /uploads/foto.jpg)
    return `${this.API_URL}${fileName}`;
  }
  
  goBack() {
    this.router.navigate(['/home']);
  }

  // ✅ NUEVO: Cargar proyectos activos y completados
  cargarProyectos(userId: number) {
    this.loadingProjects = true;
    
    this.ratingService.getActiveProjects(userId).subscribe({
      next: (res) => {
        this.proyectosActivos = res.data || [];
      },
      error: (err) => console.error('Error cargando proyectos activos', err)
    });

    this.ratingService.getCompletedProjects(userId).subscribe({
      next: (res) => {
        this.proyectosCompletados = res.data || [];
        this.loadingProjects = false;
      },
      error: (err) => {
        console.error('Error cargando proyectos completados', err);
        this.loadingProjects = false;
      }
    });
  }

  // ✅ NUEVO: Cargar calificaciones recibidas
  cargarCalificaciones(userId: number) {
    this.loadingRatings = true;
    this.ratingService.getUserRatings(userId).subscribe({
      next: (res) => {
        this.calificaciones = res.data.calificaciones || [];
        this.promedioCalificaciones = res.data.promedio || 0;
        this.totalCalificaciones = res.data.totalCalificaciones || 0;
        this.loadingRatings = false;
      },
      error: (err) => {
        console.error('Error cargando calificaciones', err);
        this.loadingRatings = false;
      }
    });
  }

  // ✅ NUEVO: Generar array de estrellas (1-5)
  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < Math.round(rating));
  }

  // ✅ NUEVO: Verificar si tengo proyectos finalizados con este usuario para calificar
  verificarProyectosParaCalificar(engineerId: number) {
    if (!this.currentUserId) return;

    this.ratingService.getProjectsToRate(this.currentUserId, engineerId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.proyectosParaCalificar = res.data.proyectos.filter((p: any) => !p.yaCalificado);
          this.puedeCalificar = this.proyectosParaCalificar.length > 0;
        }
      },
      error: (err) => console.error('Error verificando proyectos para calificar', err)
    });
  }

  // ✅ NUEVO: Abrir modal de calificación con el primer proyecto sin calificar
  abrirModalCalificar() {
    if (this.proyectosParaCalificar.length > 0) {
      this.proyectoACalificar = this.proyectosParaCalificar[0];
      this.showRatingModal = true;
    }
  }

  // ✅ NUEVO: Enviar calificación
  enviarCalificacion(data: { rating: number; comentario: string }) {
    if (!this.proyectoACalificar || !this.currentUserId) return;

    this.ratingLoading = true;
    this.ratingService.rateProject(
      this.proyectoACalificar.id,
      this.currentUserId,
      data.rating,
      data.comentario
    ).subscribe({
      next: () => {
        this.ratingLoading = false;
        this.showRatingModal = false;
        alert('Calificación enviada exitosamente');
        
        // Recargar datos
        if (this.user) {
          this.cargarCalificaciones(this.user.id);
          this.verificarProyectosParaCalificar(this.user.id);
        }
      },
      error: (err) => {
        this.ratingLoading = false;
        console.error('Error enviando calificación', err);
        alert(err.error?.error || 'Error al enviar calificación');
      }
    });
  }

  // ✅ NUEVO: Cancelar modal de calificación
  cancelarCalificacion() {
    this.showRatingModal = false;
    this.proyectoACalificar = null;
  }
}
