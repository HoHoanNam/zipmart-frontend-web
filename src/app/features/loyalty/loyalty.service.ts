import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import type { LoyaltyAccount } from '../../core/models/loyalty.model';

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly accountSignal = signal<LoyaltyAccount | null>(null);
  readonly account = this.accountSignal.asReadonly();
  readonly points = computed(() => this.accountSignal()?.points ?? 0);

  constructor() {
    // Same load-off-auth-state pattern as WishlistService/NotificationsService
    // — the balance must be ready as soon as profile/checkout render, and
    // clears on logout so a new session on the same tab never shows a
    // previous user's points.
    effect(() => {
      if (this.authService.isAuthenticated()) {
        void this.load();
      } else {
        this.accountSignal.set(null);
      }
    });
  }

  async load(): Promise<void> {
    const account = await firstValueFrom(
      this.http.get<LoyaltyAccount>(`${environment.apiUrl}/loyalty/me`),
    );
    this.accountSignal.set(account);
  }
}
