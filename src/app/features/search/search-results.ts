import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { Product, ProductSort } from '../../core/models/product.model';
import { BehaviorTrackingService } from '../../core/tracking/behavior-tracking.service';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ToastService } from '../../shared/toast/toast.service';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';

/**
 * Dedicated `/search?q=` results page — kept separate from `/products` (which
 * also accepts a `q` param for its own filter bar) because search is meant to
 * read as its own destination with query-focused messaging ("Kết quả cho…"),
 * while `/products` stays the general catalog browse/filter experience.
 * Both call the same `ProductsService.findAll({ search })`, which already
 * hits the backend's `tsvector` full-text search — relevance sort is a
 * backend concern (`ProductSort`), harmless if not yet wired server-side.
 */
@Component({
  selector: 'app-search-results',
  imports: [FormsModule, RouterLink, ProductCard],
  templateUrl: './search-results.html',
})
export class SearchResults {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly tracking = inject(BehaviorTrackingService);
  private readonly toastService = inject(ToastService);

  query = '';
  sort: ProductSort = 'newest';

  readonly products = signal<Product[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = 12;
  readonly loading = signal(true);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));

  constructor() {
    // Subscribe (not snapshot) — navigating from one search to another
    // reuses this same route/component instance, only `q` changes.
    this.route.queryParamMap.subscribe((params) => {
      this.query = params.get('q') ?? '';
      this.page.set(1);
      void this.load();
    });
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.productsService.findAll({
        search: this.query || undefined,
        sort: this.sort,
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
    void this.router.navigate(['/search'], { queryParams: { q: this.query || null } });
  }

  onSortChange(): void {
    this.page.set(1);
    void this.load();
  }

  goToPage(page: number): void {
    this.page.set(page);
    void this.load();
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
