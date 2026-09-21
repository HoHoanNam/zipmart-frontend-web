import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CreateOrderPayload,
  Order,
  OrderDetail,
  UpdateOrderAddressPayload,
} from '../../core/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<Order[]> {
    return firstValueFrom(this.http.get<Order[]>(`${environment.apiUrl}/orders`));
  }

  findOne(id: string): Promise<OrderDetail> {
    return firstValueFrom(this.http.get<OrderDetail>(`${environment.apiUrl}/orders/${id}`));
  }

  checkout(payload: CreateOrderPayload): Promise<Order> {
    return firstValueFrom(this.http.post<Order>(`${environment.apiUrl}/orders/checkout`, payload));
  }

  update(id: string, payload: UpdateOrderAddressPayload): Promise<Order> {
    return firstValueFrom(this.http.patch<Order>(`${environment.apiUrl}/orders/${id}`, payload));
  }

  cancel(id: string): Promise<Order> {
    return firstValueFrom(this.http.patch<Order>(`${environment.apiUrl}/orders/${id}/cancel`, {}));
  }
}
