// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { VerificacionComponent } from './components/verificacion/verificacion.component';
import { ConfiguracionPerfilComponent } from './components/configuracion-perfil/configuracion-perfil.component';
import { HomeComponent } from './components/home/home.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component'; // <-- AGREGAR
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'verificacion', component: VerificacionComponent },
  { path: 'configuracion-perfil', component: ConfiguracionPerfilComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'maintenance', component: MaintenanceComponent }, // <-- AGREGAR
  { path: '**', redirectTo: '' }
];