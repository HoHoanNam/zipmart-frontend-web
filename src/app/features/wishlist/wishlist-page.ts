import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '../../core/models/product.model';
import { BehaviorTrackingService } from '../../core/tracking/behavior-tracking.service';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ToastService } from '../../shared/toast/toast.service';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { WishlistService } from './wishlist.service';

@Component({
  selector: 'app-wishlist-page',
  imports: [RouterLink, ProductCard],
  templateUrl: './wishlist-page.html',
})
export class WishlistPage {
  private readonly wishlistService = inject(WishlistService);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly tracking = inject(BehaviorTrackingService);
  private readonly toastService = inject(ToastService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  // Reactive filter, not a manual reload — removing a heart on THIS page
  // toggles WishlistService's items signal, which this recomputes off of,
  // so the card disappears immediately without refetching products.
  readonly visibleProducts = computed(() =>
    this.products().filter((p) => this.wishlistService.isWishlisted(p.id)),
  );

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      await this.wishlistService.load();
      const items = this.wishlistService.items();
      const products = await Promise.all(
        items.map((item) => this.productsService.findOne(item.productId)),
      );
      this.products.set(products);
    } finally {
      this.loading.set(false);
    }
  }

  async onAddToCart(productId: string): Promise<void> {
    const product = this.products().find((p) => p.id === productId);
    await this.cartService.addItem(productId, 1);
    this.tracking.track(productId, 'add_to_cart');
    if (product) {
      this.toastService.showCartAdded(product.name);
    }
  }
}
