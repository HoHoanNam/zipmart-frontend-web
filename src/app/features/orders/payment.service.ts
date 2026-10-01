import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  PaymentCheckoutPayload,
  PaymentCheckoutResult,
  PaymentGateway,
  PaymentReturnResult,
} from '../../core/models/payment.model';

/**
 * A.2 — online payment (VNPay/Momo), backed by Infra D on the backend.
 * `checkout()` starts a gateway session for an already-created order;
 * the caller is expected to full-page-navigate to `checkoutUrl` afterwards
 * (not handled here, since that's a one-way trip out of the SPA).
 */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  checkout(payload: PaymentCheckoutPayload): Promise<PaymentCheckoutResult> {
    return firstValueFrom(
      this.http.post<PaymentCheckoutResult>(`${environment.apiUrl}/payments/checkout`, payload),
    );
  }

  /**
   * Called by the `payment-return` landing page with the exact query
   * string VNPay/Momo redirected the browser back with — the backend
   * re-verifies the gateway signature and resolves the `Payment.id` (the
   * `vnp_TxnRef`/Momo `orderId` param) back to our real `Order.id`.
   */
  confirmReturn(gateway: PaymentGateway, queryParams: Record<string, string>): Promise<PaymentReturnResult> {
    return firstValueFrom(
      this.http.get<PaymentReturnResult>(`${environment.apiUrl}/payments/${gateway}/return`, {
        params: queryParams,
      }),
    );
  }
}
