import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);

  const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => req.url.includes(path));
  const accessToken = tokenStorage.getAccessToken();

  const authorizedReq =
    !isAuthEndpoint && accessToken
      ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
      : req;

  return next(authorizedReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      if (!tokenStorage.getRefreshToken()) {
        // No session to refresh (guest, or already logged out) — a 401 here
        // is just "this endpoint needs auth", not an expired session. Don't
        // force a logout()/redirect for someone who was never logged in.
        return throwError(() => error);
      }

      // Silent-refresh once on 401, then retry the original request.
      return from(authService.refresh()).pipe(
        switchMap((tokens) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${tokens.accessToken}` } })),
        ),
        catchError((refreshError: unknown) => {
          authService.logout();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
