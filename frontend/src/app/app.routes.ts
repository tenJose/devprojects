// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { VerificacionComponent } from './components/verificacion/verificacion.component';
import { ConfiguracionPerfilComponent } from './components/configuracion-perfil/configuracion-perfil.component';
import { HomeComponent } from './components/home/home.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { MessagesComponent } from './components/messages/messages.component';
import { CreateProjectComponent } from './components/create-project/create-project.component'; // ✅ Importar
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'verificacion', component: VerificacionComponent },
  { path: 'configuracion-perfil', component: ConfiguracionPerfilComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'create-project', component: CreateProjectComponent, canActivate: [AuthGuard] }, // ✅ NUEVA RUTA
  { path: 'user/:id', component: ConfiguracionPerfilComponent, canActivate: [AuthGuard] }, // ✅ RUTA para ver otros perfiles
  { path: 'maintenance', component: MaintenanceComponent },
  { path: 'user/:id', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];