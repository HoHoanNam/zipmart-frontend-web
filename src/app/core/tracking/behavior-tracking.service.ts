import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export type BehaviorEventType = 'view' | 'click' | 'add_to_cart' | 'purchase';

@Injectable({ providedIn: 'root' })
export class BehaviorTrackingService {
  private readonly http = inject(HttpClient);

  track(productId: string, eventType: BehaviorEventType): void {
    // Fire-and-forget — tracking must never surface an error to the UI.
    this.http.post(`${environment.apiUrl}/behaviors`, { productId, eventType }).subscribe({
      error: () => {},
    });
  }
}
