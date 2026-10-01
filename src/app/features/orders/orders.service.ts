import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CreateOrderPayload,
  Order,
  OrderDetail,
  ShipmentEvent,
  UpdateOrderAddressPayload,
} from '../../core/models/order.model';

/**
 * `POST /orders/checkout` response — per A.2 in the expansion plan, the
 * backend now returns `{ order, requiresPayment }` instead of a bare
 * `Order` so the frontend knows whether to hand off to a payment gateway
 * (`requiresPayment: true` for vnpay/momo) or land straight on order
 * history (COD, `requiresPayment: false`).
 */
export interface CheckoutResult {
  order: Order;
  requiresPayment: boolean;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<Order[]> {
    return firstValueFrom(this.http.get<Order[]>(`${environment.apiUrl}/orders`));
  }

  findOne(id: string): Promise<OrderDetail> {
    return firstValueFrom(this.http.get<OrderDetail>(`${environment.apiUrl}/orders/${id}`));
  }

  findEvents(id: string): Promise<ShipmentEvent[]> {
    return firstValueFrom(this.http.get<ShipmentEvent[]>(`${environment.apiUrl}/orders/${id}/events`));
  }

  checkout(payload: CreateOrderPayload): Promise<CheckoutResult> {
    return firstValueFrom(
      this.http.post<CheckoutResult>(`${environment.apiUrl}/orders/checkout`, payload),
    );
  }

  update(id: string, payload: UpdateOrderAddressPayload): Promise<Order> {
    return firstValueFrom(this.http.patch<Order>(`${environment.apiUrl}/orders/${id}`, payload));
  }

  cancel(id: string): Promise<Order> {
    return firstValueFrom(this.http.patch<Order>(`${environment.apiUrl}/orders/${id}/cancel`, {}));
  }

  markReceived(id: string): Promise<Order> {
    return firstValueFrom(this.http.patch<Order>(`${environment.apiUrl}/orders/${id}/received`, {}));
  }
}
