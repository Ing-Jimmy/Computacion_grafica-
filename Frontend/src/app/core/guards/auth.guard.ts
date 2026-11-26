import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UsuarioService } from '../services/usuario.service';

export const authGuard: CanActivateFn = () => {
  const usuarioService = inject(UsuarioService);
  const router = inject(Router);

  return usuarioService.isAuthenticated() || router.createUrlTree(['/login']);
};
