import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const logedGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if (typeof localStorage !== 'undefined' && localStorage.getItem('userToken')) {
    return router.parseUrl('/feed');
  }

  return true;
};

export const guestGuard = logedGuard;

