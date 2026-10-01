import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';

/**
 * A.8 — browser Push API registration. Depends on A.9 (PWA/service worker)
 * being active, since `SwPush` talks to the registered `ngsw-worker.js`.
 * The VAPID *public* key is fetched from `GET /notifications/vapid-public-key`
 * rather than hardcoded — it's safe to expose (that's the point of the
 * public/private VAPID keypair) and this way it can never drift from
 * whatever `VAPID_PUBLIC_KEY` the backend actually has configured.
 * Everything here is best-effort: a denied permission, unsupported browser,
 * or VAPID not configured server-side should never break the rest of the app.
 */
@Injectable({ providedIn: 'root' })
export class PushService {
  private readonly swPush = inject(SwPush);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  constructor() {
    // Same load/clear-on-auth-state pattern as the other per-user services
    // (WishlistService, NotificationsService) — subscribe as soon as a
    // session starts, drop the subscription immediately on logout so a
    // later login on the same device doesn't keep pushing to the previous
    // account's stale endpoint registration.
    effect(() => {
      if (this.authService.isAuthenticated()) {
        void this.subscribe();
      } else {
        void this.unsubscribe();
      }
    });
  }

  async subscribe(): Promise<void> {
    if (!this.swPush.isEnabled) return;

    try {
      const { publicKey } = await firstValueFrom(
        this.http.get<{ publicKey: string }>(`${environment.apiUrl}/notifications/vapid-public-key`),
      );
      if (!publicKey) return; // VAPID not configured on the backend yet

      const subscription = await this.swPush.requestSubscription({ serverPublicKey: publicKey });
      const json = subscription.toJSON();
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/notifications/push-subscriptions`, {
          endpoint: json.endpoint,
          p256dh: json.keys?.['p256dh'],
          auth: json.keys?.['auth'],
        }),
      );
    } catch {
      // Permission denied, or the browser doesn't support Push — leave the
      // user on REST-load + realtime-socket notifications only.
    }
  }

  async unsubscribe(): Promise<void> {
    if (!this.swPush.isEnabled) return;

    const current = await firstValueFrom(this.swPush.subscription);
    if (!current) return;

    try {
      await this.swPush.unsubscribe();
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/notifications/push-subscriptions`, {
          body: { endpoint: current.endpoint },
        }),
      );
    } catch {
      // Best-effort cleanup — nothing actionable if this fails (e.g. already logged out).
    }
  }

  async updatePreferences(preferences: Record<string, boolean>): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${environment.apiUrl}/notifications/preferences`, preferences),
    );
  }
}
