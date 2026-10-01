import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { RealtimeService } from '../../core/realtime/realtime.service';
import type { SupportMessage } from '../../core/models/support.model';
import { SupportService } from './support.service';

/**
 * A.7 — floating live-chat widget, mounted once in `ShellSimple`. Message
 * history loads over REST; sending is a REST `POST` (`SupportService.sendMessage`)
 * — the gateway only relays `support:message` server→client, it has no
 * client→server handler for it. Receiving live messages (including the
 * agent's replies, and our own send echoed back) goes over the shared
 * `RealtimeService` socket after joining the room via `support:join`.
 */
@Component({
  selector: 'app-chat-widget',
  imports: [FormsModule, DatePipe],
  templateUrl: './chat-widget.html',
})
export class ChatWidget implements OnDestroy {
  readonly authService = inject(AuthService);
  private readonly realtime = inject(RealtimeService);
  private readonly supportService = inject(SupportService);

  readonly open = signal(false);
  readonly loading = signal(false);
  readonly conversationId = signal<string | null>(null);
  readonly messages = signal<SupportMessage[]>([]);
  draft = '';

  private readonly onIncomingMessage = (...args: unknown[]) => {
    const message = args[0] as SupportMessage;
    if (message.conversationId !== this.conversationId()) return;
    // Our own sends are appended immediately by `send()` (which already has
    // the real saved message from the POST response) — skip the echo to
    // avoid a duplicate bubble.
    if (!message.fromAdmin) return;
    this.messages.update((list) => [...list, message]);
  };

  ngOnDestroy(): void {
    this.realtime.off('support:message', this.onIncomingMessage);
  }

  async toggle(): Promise<void> {
    this.open.update((v) => !v);
    if (this.open() && !this.conversationId()) {
      await this.openConversation();
    }
  }

  private async openConversation(): Promise<void> {
    this.loading.set(true);
    try {
      const mine = await this.supportService.findMine();
      const conversation =
        mine.find((c) => c.status !== 'closed') ?? mine[0] ?? (await this.supportService.create());
      this.conversationId.set(conversation.id);

      const messages = await this.supportService.findMessages(conversation.id);
      this.messages.set(messages);

      this.realtime.on('support:message', this.onIncomingMessage);
      this.realtime.emit('support:join', { conversationId: conversation.id });
    } finally {
      this.loading.set(false);
    }
  }

  async send(): Promise<void> {
    const body = this.draft.trim();
    const conversationId = this.conversationId();
    if (!body || !conversationId) return;

    this.draft = '';
    const message = await this.supportService.sendMessage(conversationId, body);
    this.messages.update((list) => [...list, message]);
  }
}
