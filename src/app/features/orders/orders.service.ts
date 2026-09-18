import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Order } from '../../core/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<Order[]> {
    return firstValueFrom(this.http.get<Order[]>(`${environment.apiUrl}/orders`));
  }

  checkout(): Promise<Order> {
    return firstValueFrom(this.http.post<Order>(`${environment.apiUrl}/orders/checkout`, {}));
  }
}
