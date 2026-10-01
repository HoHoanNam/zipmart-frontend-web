import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import type { Notification } from '../../core/models/notification.model';
import { RealtimeService } from '../../core/realtime/realtime.service';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly realtime = inject(RealtimeService);

  private readonly notificationsSignal = signal<Notification[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();
  readonly unreadCount = computed(() => this.notificationsSignal().filter((n) => !n.isRead).length);

  constructor() {
    // A.8 — the `setInterval` poll this service used to run was replaced by
    // a push over the shared `RealtimeService` socket (Infra B: server emits
    // into room `user:{userId}` on `notification:new`). `RealtimeService.on`
    // is safe to call before the socket exists, so this registration doesn't
    // need to be gated on auth state itself — only the initial REST load
    // below does.
    this.realtime.on('notification:new', (...args) => {
      const notification = args[0] as Notification;
      this.notificationsSignal.update((list) => [notification, ...list]);
    });

    // Same pattern as `WishlistService`: load reactively off auth state
    // (not just when the inbox dropdown is opened) so the bell badge is
    // already correct as soon as any authenticated page renders, and clears
    // immediately on logout so the next session on the same tab never
    // shows a previous user's notifications.
    effect(() => {
      if (this.authService.isAuthenticated()) {
        void this.load();
      } else {
        this.notificationsSignal.set([]);
      }
    });
  }

  async load(): Promise<void> {
    const notifications = await firstValueFrom(
      this.http.get<Notification[]>(`${environment.apiUrl}/notifications`),
    );
    this.notificationsSignal.set(notifications);
  }

  async markRead(id: string): Promise<void> {
    await firstValueFrom(this.http.patch(`${environment.apiUrl}/notifications/${id}/read`, {}));
    this.notificationsSignal.update((list) =>
      list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }

  async markAllRead(): Promise<void> {
    await firstValueFrom(this.http.patch(`${environment.apiUrl}/notifications/read-all`, {}));
    this.notificationsSignal.update((list) => list.map((n) => ({ ...n, isRead: true })));
  }
}
