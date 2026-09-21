import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../cart/cart.service';
import { BehaviorTrackingService } from '../../../core/tracking/behavior-tracking.service';
import type { RecommendationItem } from '../../../core/models/recommendation.model';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { ToastService } from '../../../shared/toast/toast.service';
import { RecService } from '../rec.service';

@Component({
  selector: 'app-rec-widget',
  imports: [RouterLink, ProductCard],
  templateUrl: './rec-widget.html',
})
export class RecWidget {
  private readonly recService = inject(RecService);
  private readonly cartService = inject(CartService);
  private readonly tracking = inject(BehaviorTrackingService);
  private readonly toastService = inject(ToastService);

  readonly recommendations = signal<RecommendationItem[]>([]);
  readonly coldStart = signal(false);
  readonly loading = signal(true);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const result = await this.recService.getRecommendations(10);
      this.recommendations.set(result.items);
      this.coldStart.set(result.coldStart);
    } finally {
      this.loading.set(false);
    }
  }

  async onAddToCart(productId: string): Promise<void> {
    const rec = this.recommendations().find((r) => r.productId === productId);
    await this.cartService.addItem(productId, 1);
    this.tracking.track(productId, 'add_to_cart');
    if (rec) {
      this.toastService.showCartAdded(rec.product.name);
    }
  }
}
