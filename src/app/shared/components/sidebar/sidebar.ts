import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import type { Category } from '../../../core/models/category.model';
import type { Order } from '../../../core/models/order.model';
import type { RecommendationItem } from '../../../core/models/recommendation.model';
import { CategoriesService } from '../../../features/categories/categories.service';
import { OrdersService } from '../../../features/orders/orders.service';
import { RecService } from '../../../features/recommendations/rec.service';
import { VndCurrencyPipe } from '../../pipes/vnd-currency.pipe';

const STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'Đang xử lý',
  paid: 'Đã thanh toán',
  shipped: 'Đã giao',
};

/**
 * Mounted directly by ShellWithSidebar (Home, Products — see DESIGN.md /
 * IMPLEMENTATION_PLAN.md layout notes), not passed data from a parent page,
 * so it fetches its own order-history / recommendation preview rather than
 * relying on `@Input`.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, VndCurrencyPipe, DecimalPipe],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly authService = inject(AuthService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly ordersService = inject(OrdersService);
  private readonly recService = inject(RecService);

  readonly categories = signal<Category[]>([]);

  // Placeholder content — no best-seller API exists yet in zipmart-backend-nest
  // (see DESIGN.md plan notes). Static on purpose, not fetched, so nobody
  // mistakes it for real data.
  readonly staticBestSellers = ['Tai nghe không dây chống ồn', 'Bàn phím cơ không dây'];

  readonly recentOrders = signal<Order[]>([]);
  readonly topRecommendation = signal<RecommendationItem | null>(null);

  constructor() {
    void this.loadCategories();
    if (this.authService.isAuthenticated()) {
      void this.loadRecentOrders();
      void this.loadTopRecommendation();
    }
  }

  private async loadCategories(): Promise<void> {
    this.categories.set(await this.categoriesService.getAll());
  }

  statusLabel(status: Order['status']): string {
    return STATUS_LABEL[status];
  }

  private async loadRecentOrders(): Promise<void> {
    const orders = await this.ordersService.findAll();
    this.recentOrders.set(orders.slice(0, 2));
  }

  private async loadTopRecommendation(): Promise<void> {
    const result = await this.recService.getRecommendations(1);
    // Cold-start items are just top-sellers with score 0 — showing them as
    // a "% match" would be misleading, so only surface genuine personalized
    // recommendations here (the placeholder "Bán chạy nhất" section above
    // already covers the top-seller case).
    this.topRecommendation.set(result.coldStart ? null : (result.items[0] ?? null));
  }
}
