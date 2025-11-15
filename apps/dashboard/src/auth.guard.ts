import { inject } from '@angular/core';
import { CanMatchFn, UrlTree, Router } from '@angular/router';

export const canMatchAuthed: CanMatchFn = (): boolean | UrlTree => {
  const token = localStorage.getItem('jwt');
  const router = inject(Router);
  // If no token, return a UrlTree (lets Angular router redirect without hard reload)
  return token ? true : router.parseUrl('/login');
};