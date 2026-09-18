import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../cart/cart.service';
import { BehaviorTrackingService } from '../../../core/tracking/behavior-tracking.service';
import type { Product } from '../../../core/models/product.model';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-products-list',
  imports: [FormsModule, ProductCard],
  templateUrl: './products-list.html',
})
export class ProductsList {
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly tracking = inject(BehaviorTrackingService);

  readonly products = signal<Product[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = 12;
  readonly loading = signal(true);
  search = '';

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.productsService.findAll({
        search: this.search || undefined,
        page: this.page(),
        limit: this.limit,
      });
      this.products.set(result.items);
      this.total.set(result.total);
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(): void {
    this.page.set(1);
    void this.load();
  }

  goToPage(page: number): void {
    this.page.set(page);
    void this.load();
  }

  async onAddToCart(productId: string): Promise<void> {
    await this.cartService.addItem(productId, 1);
    this.tracking.track(productId, 'add_to_cart');
  }
}
