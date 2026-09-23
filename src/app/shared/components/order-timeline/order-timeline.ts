import { Component, computed, input } from '@angular/core';
import type { OrderStatus } from '../../../core/models/order.model';

interface TimelineStep {
  status: OrderStatus;
  label: string;
  icon: string;
}

const STEPS: TimelineStep[] = [
  { status: 'pending', label: 'Đặt hàng', icon: 'receipt_long' },
  { status: 'paid', label: 'Đã thanh toán', icon: 'payments' },
  { status: 'shipped', label: 'Đang giao', icon: 'local_shipping' },
  { status: 'completed', label: 'Hoàn thành', icon: 'task_alt' },
];

@Component({
  selector: 'app-order-timeline',
  templateUrl: './order-timeline.html',
})
export class OrderTimeline {
  readonly status = input.required<OrderStatus>();

  readonly isCancelled = computed(() => this.status() === 'cancelled');

  readonly steps = computed(() => {
    const currentIndex = STEPS.findIndex((s) => s.status === this.status());
    return STEPS.map((step, index) => ({
      ...step,
      done: currentIndex >= 0 && index <= currentIndex,
    }));
  });
}
