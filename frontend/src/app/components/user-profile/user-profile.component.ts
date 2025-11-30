import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service'; // ✅ Importar AuthService
import { FriendService } from '../../services/friend.service'; // ✅ Importar FriendService

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  API_URL = 'http://localhost:3000';
  
  // ✅ Propiedades faltantes agregadas
  currentUserId: number | null = null;
  areFriends: boolean = false;
  solicitudEnviada: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private authService: AuthService, // ✅ Inyectar
    private friendService: FriendService, // ✅ Inyectar
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener ID del usuario logueado
    const tokenPayload = this.authService.getCurrentUser();
    this.currentUserId = tokenPayload ? tokenPayload.id : null;
    
    // Si no lo encuentras en el token, intenta buscarlo en localStorage si tu authService lo guarda ahí
    if (!this.currentUserId) {
        const storedId = localStorage.getItem('userId');
        if (storedId) this.currentUserId = parseInt(storedId);
    }

    this.route.params.subscribe(params => {
      const id = +params['id']; // El '+' convierte el string a número
      if (id) {
        this.cargarUsuario(id);
        // Si no es mi propio perfil, verificar amistad
        if (this.currentUserId && this.currentUserId !== id) {
           this.verificarAmistad(id);
        }
      }
    });
  }

  cargarUsuario(id: number) {
    this.usuarioService.obtenerUsuarioPorId(id).subscribe({
      next: (res) => {
        if (res.success) { // Asegúrate que tu backend devuelve { success: true, data: ... } o ajusta esto
          this.user = res.data || res; // Ajuste por si devuelve el objeto directo
        } else {
           this.user = res; // Fallback
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // ✅ Método faltante
  verificarAmistad(friendId: number) {
    this.friendService.checkStatus(friendId).subscribe({
      next: (res) => {
        // Asumiendo que el backend responde: { status: 'aceptado' | 'pendiente' | null }
        this.areFriends = res.status === 'aceptado';
        this.solicitudEnviada = res.status === 'pendiente';
      },
      error: () => {
        this.areFriends = false;
        this.solicitudEnviada = false;
      }
    });
  }

  // ✅ Método faltante
  enviarSolicitudAmistad(friendId: number) {
    if (!this.currentUserId) {
        alert("Debes iniciar sesión");
        return;
    }
    
    this.friendService.sendRequest(friendId).subscribe({
      next: () => {
        this.solicitudEnviada = true;
        alert('Solicitud enviada correctamente');
      },
      error: (err) => {
        console.error('Error al enviar solicitud', err);
        alert('Error al enviar la solicitud');
      }
    });
  }

  // ✅ Método faltante
  enviarMensaje(friendId: number) {
    // Navegar a la página de mensajes con el chat abierto
    this.router.navigate(['/messages'], { queryParams: { userId: friendId } });
  }

  getFullPhotoUrl(fileName: string): string {
    if (!fileName) return 'assets/default-avatar.png';
    if (fileName.startsWith('http')) return fileName;
    return `${this.API_URL}${fileName}`;
  }
  
  goBack() {
    this.router.navigate(['/home']);
  }
}