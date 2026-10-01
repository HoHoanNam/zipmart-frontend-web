import { Component, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { Order } from '../../../core/models/order.model';
import type { PaymentGateway } from '../../../core/models/payment.model';
import { OrdersService } from '../orders.service';
import { PaymentService } from '../payment.service';

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 20; // ~50s — generous for a gateway round-trip + webhook processing

type ReturnState = 'confirming' | 'polling' | 'paid' | 'failed' | 'timeout';

/**
 * Landing page VNPay/Momo redirect the browser back to (see Infra D + A.2
 * in the expansion plan). Neither gateway carries our own `orderId` in the
 * redirect — VNPay sends `vnp_TxnRef` (our `Payment.id`) + `vnp_ResponseCode`;
 * Momo sends its own `orderId` (also our `Payment.id`, Momo's naming) +
 * `resultCode`. This page forwards whichever set of query params is present
 * to the matching `GET /payments/<gateway>/return` endpoint, which
 * re-verifies the gateway signature and resolves the real `Order.id`. Only
 * after that does it fall back to polling `GET /orders/:id`, since the
 * IPN/webhook that finalizes payment can land slightly after the browser
 * redirect. Public route (no authGuard) per the expansion plan.
 */
@Component({
  selector: 'app-payment-return',
  imports: [RouterLink],
  templateUrl: './payment-return.html',
})
export class PaymentReturn implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersService = inject(OrdersService);
  private readonly paymentService = inject(PaymentService);

  readonly state = signal<ReturnState>('confirming');
  readonly orderId = signal<string | null>(null);

  private pollHandle: ReturnType<typeof setTimeout> | undefined;
  private attempts = 0;

  constructor() {
    void this.confirm();
  }

  ngOnDestroy(): void {
    clearTimeout(this.pollHandle);
  }

  private async confirm(): Promise<void> {
    const params = this.route.snapshot.queryParamMap;
    const gateway: PaymentGateway | null = params.has('vnp_TxnRef')
      ? 'vnpay'
      : params.has('resultCode') || params.has('partnerCode')
        ? 'momo'
        : null;

    if (!gateway) {
      this.state.set('failed');
      return;
    }

    const queryParams: Record<string, string> = {};
    for (const key of params.keys) {
      queryParams[key] = params.get(key) ?? '';
    }

    try {
      const result = await this.paymentService.confirmReturn(gateway, queryParams);
      if (!result.success || !result.orderId) {
        this.state.set('failed');
        return;
      }
      this.orderId.set(result.orderId);
      this.state.set('polling');
      void this.poll();
    } catch {
      this.state.set('failed');
    }
  }

  private async poll(): Promise<void> {
    const orderId = this.orderId();
    if (!orderId) return;
    this.attempts++;
    try {
      const order = await this.ordersService.findOne(orderId);

      if (order.paymentStatus === 'paid' || order.status === 'paid') {
        this.state.set('paid');
        return;
      }
      if (order.status === 'cancelled') {
        this.state.set('failed');
        return;
      }
    } catch {
      // A transient fetch error mid-poll shouldn't end the flow early — keep retrying until MAX_POLL_ATTEMPTS.
    }

    if (this.attempts >= MAX_POLL_ATTEMPTS) {
      this.state.set('timeout');
      return;
    }
    this.pollHandle = setTimeout(() => void this.poll(), POLL_INTERVAL_MS);
  }
}
