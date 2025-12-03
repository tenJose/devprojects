import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // ✅ RouterLink importante
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { FriendService } from '../../services/friend.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink], // ✅ Agregado RouterLink
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

  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private friendService: FriendService,
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
      }
    });
  }

  cargarUsuario(id: number) {
    this.loading = true;
    this.error = '';

    // Verificar si es mi propio perfil
    this.esMiPerfil = (this.currentUserId === id);

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

    if (this.currentUserId === friendId) {
        alert("No puedes enviarte una solicitud a ti mismo");
        return;
    }
    
    this.friendService.sendRequest(friendId).subscribe({
      next: () => {
        this.solicitudEnviada = true;
        alert('Solicitud de amistad enviada correctamente');
      },
      error: (err: any) => {
        console.error('Error al enviar solicitud', err);
        const errorMsg = err?.error?.error || err?.error?.message || 'Error al enviar la solicitud';
        alert(errorMsg);
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


  
}