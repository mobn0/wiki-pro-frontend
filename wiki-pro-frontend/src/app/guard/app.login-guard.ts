import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppAuthService } from '../service/app.auth.service';

export const appLoginGuard: CanActivateFn = () => {
  const authService = inject(AppAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};
