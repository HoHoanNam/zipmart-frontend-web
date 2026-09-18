import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AuthTokens, JwtPayload } from '../models/auth.model';
import { TokenStorageService } from './token-storage.service';

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payloadBase64 = token.split('.')[1];
    return JSON.parse(atob(payloadBase64)) as JwtPayload;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  private readonly currentUserSignal = signal<JwtPayload | null>(this.readUserFromStorage());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  private readUserFromStorage(): JwtPayload | null {
    const token = this.tokenStorage.getAccessToken();
    return token ? decodeJwt(token) : null;
  }

  async register(email: string, password: string): Promise<void> {
    const tokens = await firstValueFrom(
      this.http.post<AuthTokens>(`${environment.apiUrl}/auth/register`, { email, password }),
    );
    this.applyTokens(tokens);
  }

  async login(email: string, password: string): Promise<void> {
    const tokens = await firstValueFrom(
      this.http.post<AuthTokens>(`${environment.apiUrl}/auth/login`, { email, password }),
    );
    this.applyTokens(tokens);
  }

  async refresh(): Promise<AuthTokens> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    const tokens = await firstValueFrom(
      this.http.post<AuthTokens>(`${environment.apiUrl}/auth/refresh`, { refreshToken }),
    );
    this.applyTokens(tokens);
    return tokens;
  }

  logout(): void {
    this.tokenStorage.clear();
    this.currentUserSignal.set(null);
    this.router.navigateByUrl('/login');
  }

  private applyTokens(tokens: AuthTokens): void {
    this.tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    this.currentUserSignal.set(decodeJwt(tokens.accessToken));
  }
}
