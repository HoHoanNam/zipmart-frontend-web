import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { SupportConversation, SupportMessage } from '../../core/models/support.model';

/**
 * REST half of A.7/Infra H. Sending a message is a REST `POST` (the real
 * backend added `POST /support/conversations/:id/messages` — required for
 * the chat to work at all, since the gateway only relays `support:message`
 * from server to clients, it doesn't accept it as a client→server command).
 * Receiving live messages still goes over the shared `RealtimeService`
 * socket (see `ChatWidget`).
 */
@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly http = inject(HttpClient);

  findMine(): Promise<SupportConversation[]> {
    return firstValueFrom(
      this.http.get<SupportConversation[]>(`${environment.apiUrl}/support/conversations/mine`),
    );
  }

  create(): Promise<SupportConversation> {
    return firstValueFrom(
      this.http.post<SupportConversation>(`${environment.apiUrl}/support/conversations`, {}),
    );
  }

  findMessages(conversationId: string): Promise<SupportMessage[]> {
    return firstValueFrom(
      this.http.get<SupportMessage[]>(
        `${environment.apiUrl}/support/conversations/${conversationId}/messages`,
      ),
    );
  }

  sendMessage(conversationId: string, body: string): Promise<SupportMessage> {
    return firstValueFrom(
      this.http.post<SupportMessage>(
        `${environment.apiUrl}/support/conversations/${conversationId}/messages`,
        { body },
      ),
    );
  }
}
