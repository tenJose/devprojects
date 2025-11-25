import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

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
  API_URL = 'http://localhost:3000'; // Ajusta según tu backend

  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.cargarUsuario(id);
      }
    });
  }

  cargarUsuario(id: number) {
    this.usuarioService.obtenerUsuarioPorId(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.user = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  getFullPhotoUrl(fileName: string): string {
    if (!fileName) return 'assets/default-avatar.png';
    if (fileName.startsWith('http')) return fileName;
    return `${this.API_URL}/uploads/${fileName}`; // Importante: ruta correcta
  }
  
  goBack() {
    this.router.navigate(['/home']);
  }
}