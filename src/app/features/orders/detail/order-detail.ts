import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type {
  OrderDetail as OrderDetailModel,
  OrderStatus,
  PaymentMethod,
  UpdateOrderAddressPayload,
} from '../../../core/models/order.model';
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
  cod: 'Thanh toán khi nhận hàng (COD)',
  credit: 'Thẻ tín dụng (Credit)',
};

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, DatePipe, FormsModule, VndCurrencyPipe],
  templateUrl: './order-detail.html',
})
export class OrderDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersService = inject(OrdersService);

  readonly order = signal<OrderDetailModel | null>(null);
  readonly loading = signal(true);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly cancelling = signal(false);
  readonly error = signal<string | null>(null);

  editForm: UpdateOrderAddressPayload = {};

  constructor() {
    this.route.paramMap.subscribe((params) => {
      void this.load(params.get('id'));
    });
  }

  private async load(id: string | null): Promise<void> {
    if (!id) return;
    this.loading.set(true);
    try {
      const order = await this.ordersService.findOne(id);
      this.order.set(order);
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

  startEdit(): void {
    const order = this.order();
    if (!order) return;
    this.editForm = {
      recipientName: order.recipientName ?? '',
      phoneNumber: order.phoneNumber ?? '',
      city: order.city ?? '',
      district: order.district ?? '',
      ward: order.ward ?? '',
      streetAddress: order.streetAddress ?? '',
      paymentMethod: order.paymentMethod,
    };
    this.error.set(null);
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  async saveEdit(): Promise<void> {
    const order = this.order();
    if (!order) return;

    this.saving.set(true);
    this.error.set(null);
    try {
      await this.ordersService.update(order.id, this.editForm);
      await this.load(order.id);
      this.editing.set(false);
    } catch {
      this.error.set('Không thể cập nhật đơn hàng. Vui lòng thử lại.');
    } finally {
      this.saving.set(false);
    }
  }

  async cancelOrder(): Promise<void> {
    const order = this.order();
    if (!order) return;
    if (!confirm('Huỷ đơn hàng này?')) return;

    this.cancelling.set(true);
    this.error.set(null);
    try {
      await this.ordersService.cancel(order.id);
      await this.load(order.id);
    } catch {
      this.error.set('Không thể huỷ đơn hàng. Vui lòng thử lại.');
    } finally {
      this.cancelling.set(false);
    }
  }
}
