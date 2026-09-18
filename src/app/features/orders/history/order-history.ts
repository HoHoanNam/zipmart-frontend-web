import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Order } from '../../../core/models/order.model';
import { VndCurrencyPipe } from '../../../shared/pipes/vnd-currency.pipe';
import { OrdersService } from '../orders.service';

@Component({
  selector: 'app-order-history',
  imports: [RouterLink, DatePipe, VndCurrencyPipe],
  templateUrl: './order-history.html',
})
export class OrderHistory {
  private readonly ordersService = inject(OrdersService);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.orders.set(await this.ordersService.findAll());
    } finally {
      this.loading.set(false);
    }
  }

  statusLabel(status: Order['status']): string {
    return { pending: 'Đang xử lý', paid: 'Đã thanh toán', shipped: 'Đã giao' }[status];
  }
}
