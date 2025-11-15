import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt');
  const router = inject(Router);
  
  // Debug logging
  if (!token) {
    console.warn('[AuthInterceptor] No JWT token found in localStorage for request:', req.url);
  } else {
    console.log('[AuthInterceptor] Adding JWT token to request:', req.url);
  }
  
  // Skip adding token to auth endpoints
  if (req.url.includes('/auth/')) {
    return next(req);
  }
  
  if (token) {
    req = req.clone({ 
      setHeaders: { 
        Authorization: `Bearer ${token}` 
      } 
    });
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.status === 401) {
        console.error('[AuthInterceptor] 401 Unauthorized - token expired or invalid');
        console.error('[AuthInterceptor] Removing invalid token from localStorage');
        localStorage.removeItem('jwt');
        
        // Only redirect if not already on login page
        if (!req.url.includes('/auth/') && !window.location.pathname.includes('/login')) {
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};