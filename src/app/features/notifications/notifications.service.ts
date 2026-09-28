import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import type { Notification } from '../../core/models/notification.model';

/** No WebSocket/SSE infra in this app yet — periodic polling is the simplest way to keep the badge reasonably fresh. */
const POLL_INTERVAL_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly notificationsSignal = signal<Notification[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();
  readonly unreadCount = computed(() => this.notificationsSignal().filter((n) => !n.isRead).length);

  private pollHandle: ReturnType<typeof setInterval> | undefined;

  constructor() {
    // Same pattern as `WishlistService`: load reactively off auth state
    // (not just when the inbox dropdown is opened) so the bell badge is
    // already correct as soon as any authenticated page renders, and clears
    // immediately on logout so the next session on the same tab never
    // shows a previous user's notifications.
    effect(() => {
      if (this.authService.isAuthenticated()) {
        void this.load();
        this.startPolling();
      } else {
        this.notificationsSignal.set([]);
        this.stopPolling();
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

  private startPolling(): void {
    if (this.pollHandle) return;
    this.pollHandle = setInterval(() => void this.load(), POLL_INTERVAL_MS);
  }

  private stopPolling(): void {
    clearInterval(this.pollHandle);
    this.pollHandle = undefined;
  }
}
