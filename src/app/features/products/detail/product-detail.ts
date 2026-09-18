import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { BehaviorTrackingService } from '../../../core/tracking/behavior-tracking.service';
import type { Product } from '../../../core/models/product.model';
import { CartService } from '../../cart/cart.service';
import { VndCurrencyPipe } from '../../../shared/pipes/vnd-currency.pipe';
import { RecWidget } from '../../recommendations/rec-widget/rec-widget';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-product-detail',
  imports: [RecWidget, VndCurrencyPipe],
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly tracking = inject(BehaviorTrackingService);
  readonly authService = inject(AuthService);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly quantity = signal(1);
  readonly justAdded = signal(false);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    try {
      const product = await this.productsService.findOne(id);
      this.product.set(product);
      this.tracking.track(id, 'view');
    } finally {
      this.loading.set(false);
    }
  }

  async onAddToCart(): Promise<void> {
    const product = this.product();
    if (!product) return;

    await this.cartService.addItem(product.id, this.quantity());
    this.tracking.track(product.id, 'add_to_cart');
    this.justAdded.set(true);
    setTimeout(() => this.justAdded.set(false), 2000);
  }
}
