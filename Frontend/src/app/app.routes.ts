import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (component) => component.LoginComponent,
      ),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/auth/registro/registro.component').then(
        (component) => component.RegistroComponent,
      ),
  },
  {
    path: 'usuarios',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/usuarios/usuarios.component').then(
        (component) => component.UsuariosComponent,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
