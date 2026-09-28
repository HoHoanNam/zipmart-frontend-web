import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import type { OrderStatus, ShipmentEvent } from '../../../core/models/order.model';

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

const EVENT_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Đặt hàng',
  paid: 'Đã thanh toán',
  shipped: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};

@Component({
  selector: 'app-order-timeline',
  imports: [DatePipe],
  templateUrl: './order-timeline.html',
})
export class OrderTimeline {
  readonly status = input.required<OrderStatus>();
  /** Optional — orders created before this table existed have no rows here, so the stepper above still renders fine with an empty array (the default). */
  readonly events = input<ShipmentEvent[]>([]);

  readonly isCancelled = computed(() => this.status() === 'cancelled');

  readonly sortedEvents = computed(() =>
    [...this.events()].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)),
  );

  eventLabel(event: ShipmentEvent): string {
    return EVENT_STATUS_LABELS[event.status];
  }

  readonly steps = computed(() => {
    const currentIndex = STEPS.findIndex((s) => s.status === this.status());
    return STEPS.map((step, index) => ({
      ...step,
      done: currentIndex >= 0 && index <= currentIndex,
    }));
  });
}
