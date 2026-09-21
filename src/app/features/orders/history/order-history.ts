import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Order, OrderStatus, PaymentMethod } from '../../../core/models/order.model';
import { VndCurrencyPipe } from '../../../shared/pipes/vnd-currency.pipe';
import { OrdersService } from '../orders.service';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Đang xử lý',
  paid: 'Đã thanh toán',
  shipped: 'Đã giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: 'COD',
  credit: 'Credit',
};

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

  statusLabel(status: OrderStatus): string {
    return STATUS_LABELS[status];
  }

  paymentMethodLabel(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method];
  }

  addressSummary(order: Order): string {
    return [order.district, order.city].filter(Boolean).join(', ') || '—';
  }
}
