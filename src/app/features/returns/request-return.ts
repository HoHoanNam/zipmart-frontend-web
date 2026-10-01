import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { OrderDetail } from '../../core/models/order.model';
import type { ReturnReason } from '../../core/models/return.model';
import { VndCurrencyPipe } from '../../shared/pipes/vnd-currency.pipe';
import { OrdersService } from '../orders/orders.service';
import { ReturnsService } from './returns.service';

const REASON_LABELS: Record<ReturnReason, string> = {
  defective: 'Sản phẩm bị lỗi/hư hỏng',
  wrong_item: 'Nhận sai sản phẩm',
  not_as_described: 'Sản phẩm không giống mô tả',
  changed_mind: 'Đổi ý, không muốn mua nữa',
  other: 'Lý do khác',
};

/** A.5 — route `orders/:id/return`, guarded (customer must own the order). */
@Component({
  selector: 'app-request-return',
  imports: [RouterLink, FormsModule, VndCurrencyPipe],
  templateUrl: './request-return.html',
})
export class RequestReturn {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ordersService = inject(OrdersService);
  private readonly returnsService = inject(ReturnsService);

  readonly reasons = Object.entries(REASON_LABELS) as [ReturnReason, string][];

  readonly order = signal<OrderDetail | null>(null);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);

  selectedOrderItemId = '';
  reason: ReturnReason = 'defective';
  note = '';

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) return;

    this.loading.set(true);
    try {
      const order = await this.ordersService.findOne(orderId);
      this.order.set(order);
      this.selectedOrderItemId = order.items[0]?.id ?? '';
    } finally {
      this.loading.set(false);
    }
  }

  reasonLabel(reason: ReturnReason): string {
    return REASON_LABELS[reason];
  }

  async onSubmit(): Promise<void> {
    const order = this.order();
    if (!order || !this.selectedOrderItemId) return;

    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.returnsService.create({
        orderId: order.id,
        orderItemId: this.selectedOrderItemId,
        reason: this.reason,
        note: this.note || undefined,
      });
      this.submitted.set(true);
    } catch {
      this.error.set('Không thể gửi yêu cầu đổi trả. Vui lòng thử lại.');
    } finally {
      this.submitting.set(false);
    }
  }

  backToOrder(): void {
    const order = this.order();
    if (order) void this.router.navigate(['/orders', order.id]);
  }
}
