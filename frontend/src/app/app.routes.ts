// Configuración de rutas de la aplicación

import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { VerificacionComponent } from './components/verificacion/verificacion.component';
import { ConfiguracionPerfilComponent } from './components/configuracion-perfil/configuracion-perfil.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'verificacion', component: VerificacionComponent },
  { path: 'configuracion-perfil', component: ConfiguracionPerfilComponent },
];
