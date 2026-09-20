import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../cart/cart.service';
import { BehaviorTrackingService } from '../../../core/tracking/behavior-tracking.service';
import type { Category } from '../../../core/models/category.model';
import type { Product } from '../../../core/models/product.model';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { CategoriesService } from '../../categories/categories.service';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-products-list',
  imports: [FormsModule, RouterLink, ProductCard],
  templateUrl: './products-list.html',
})
export class ProductsList {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly cartService = inject(CartService);
  private readonly tracking = inject(BehaviorTrackingService);
  private readonly route = inject(ActivatedRoute);

  readonly products = signal<Product[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = 12;
  readonly loading = signal(true);
  readonly activeCategory = signal<Category | null>(null);
  search = '';
  categoryId: string | null = null;

  constructor() {
    // Subscribe, not `route.snapshot` — ShellWithSidebar keeps ProductsList's
    // component instance alive across `/products?categoryId=X` ->
    // `/products?categoryId=Y` navigations (same route, only query params
    // change), so the constructor doesn't re-run and a one-time snapshot
    // read would go stale. queryParamMap emits on every such change.
    this.route.queryParamMap.subscribe((params) => {
      this.search = params.get('q') ?? '';
      this.categoryId = params.get('categoryId');
      this.page.set(1);
      void this.loadActiveCategory();
      void this.load();
    });
  }

  private async loadActiveCategory(): Promise<void> {
    if (!this.categoryId) {
      this.activeCategory.set(null);
      return;
    }
    const categories = await this.categoriesService.getAll();
    this.activeCategory.set(categories.find((c) => c.id === this.categoryId) ?? null);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.productsService.findAll({
        search: this.search || undefined,
        categoryId: this.categoryId || undefined,
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
