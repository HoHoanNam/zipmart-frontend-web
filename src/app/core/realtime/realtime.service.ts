import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { io, type Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { TokenStorageService } from '../auth/token-storage.service';

export type RealtimeConnectionState = 'disconnected' | 'connecting' | 'connected';

// socket.io runs on the bare Nest HTTP server, not under the REST `/api/v1`
// prefix — derive the origin from `environment.apiUrl` instead of adding a
// separate env var that could drift out of sync with it.
const SOCKET_ORIGIN = new URL(environment.apiUrl).origin;
const SOCKET_NAMESPACE = '/ws';

/**
 * Single shared socket.io connection for the whole app — per Infra B in the
 * expansion plan (`@WebSocketGateway({ namespace: '/ws' })`, JWT passed as
 * `handshake.auth.token`). Reused by the live-chat widget (A.7) and realtime
 * notifications (A.8) so there's exactly one socket per session, not one
 * per feature.
 *
 * `on()`/`off()` are safe to call at any time, including before the socket
 * exists (e.g. a guest-rendered component, or a race with the auth-state
 * effect below) — handlers are kept in `listeners` and replayed onto every
 * new underlying `Socket` instance, since a fresh instance is created each
 * time `connect()` runs (login, or reconnect after logout+login).
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly authService = inject(AuthService);
  private readonly tokenStorage = inject(TokenStorageService);

  private socket: Socket | null = null;
  private readonly listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  private readonly stateSignal = signal<RealtimeConnectionState>('disconnected');
  readonly state = this.stateSignal.asReadonly();
  readonly connected = computed(() => this.stateSignal() === 'connected');

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  on(event: string, handler: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
    this.socket?.on(event, handler);
  }

  off(event: string, handler: (...args: unknown[]) => void): void {
    this.listeners.get(event)?.delete(handler);
    this.socket?.off(event, handler);
  }

  emit(event: string, payload?: unknown): void {
    this.socket?.emit(event, payload);
  }

  private connect(): void {
    if (this.socket) return;
    const token = this.tokenStorage.getAccessToken();
    if (!token) return;

    this.stateSignal.set('connecting');
    const socket = io(`${SOCKET_ORIGIN}${SOCKET_NAMESPACE}`, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => this.stateSignal.set('connected'));
    socket.on('disconnect', () => this.stateSignal.set('disconnected'));
    socket.on('connect_error', () => this.stateSignal.set('disconnected'));

    for (const [event, handlers] of this.listeners) {
      for (const handler of handlers) socket.on(event, handler);
    }

    this.socket = socket;
  }

  private disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.stateSignal.set('disconnected');
  }
}
