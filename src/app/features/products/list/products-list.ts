import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../cart/cart.service';
import { BehaviorTrackingService } from '../../../core/tracking/behavior-tracking.service';
import type { Category } from '../../../core/models/category.model';
import type { Product, ProductSort } from '../../../core/models/product.model';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { ToastService } from '../../../shared/toast/toast.service';
import { CategoriesService } from '../../categories/categories.service';
import { ProductsService } from '../products.service';
import { Breadcrumb } from '../../../shared/components/breadcrumb/breadcrumb';

@Component({
  selector: 'app-products-list',
  imports: [FormsModule, RouterLink, ProductCard, Breadcrumb],
  templateUrl: './products-list.html',
})
export class ProductsList {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly cartService = inject(CartService);
  private readonly tracking = inject(BehaviorTrackingService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly products = signal<Product[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = 12;
  readonly loading = signal(true);
  readonly activeCategory = signal<Category | null>(null);
  search = '';
  categoryId: string | null = null;

  readonly brands = signal<string[]>([]);
  sort: ProductSort = 'newest';
  brand = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  readonly breadcrumbItems = computed(() => {
    const items: { label: string; routerLink?: string | unknown[]; queryParams?: Record<string, string> }[] = [
      { label: 'Trang chủ', routerLink: '/' },
    ];
    const category = this.activeCategory();
    items.push(category ? { label: 'Sản phẩm', routerLink: '/products' } : { label: 'Sản phẩm' });
    if (category) {
      items.push({ label: category.name });
    }
    return items;
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  /** First, last, current ±1, with 'ellipsis' filling any gap — avoids a wide flat button strip. */
  readonly pageWindow = computed<(number | 'ellipsis')[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const keep = new Set<number>([1, total, current]);
    if (current - 1 >= 1) keep.add(current - 1);
    if (current + 1 <= total) keep.add(current + 1);
    const sorted = [...keep].sort((a, b) => a - b);
    const result: (number | 'ellipsis')[] = [];
    let previous = 0;
    for (const p of sorted) {
      if (previous && p - previous > 1) result.push('ellipsis');
      result.push(p);
      previous = p;
    }
    return result;
  });

  constructor() {
    // Subscribe, not `route.snapshot` — ShellSimple keeps ProductsList's
    // component instance alive across `/products?categoryId=X` ->
    // `/products?categoryId=Y` navigations (same route, only query params
    // change), so the constructor doesn't re-run and a one-time snapshot
    // read would go stale. queryParamMap emits on every such change.
    this.route.queryParamMap.subscribe((params) => {
      this.search = params.get('q') ?? '';
      this.categoryId = params.get('categoryId');
      this.page.set(1);
      void this.loadActiveCategory();
      void this.loadBrands();
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

  private async loadBrands(): Promise<void> {
    this.brands.set(await this.productsService.findBrands(this.categoryId ?? undefined));
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.productsService.findAll({
        search: this.search || undefined,
        categoryId: this.categoryId || undefined,
        brand: this.brand || undefined,
        minPrice: this.minPrice ?? undefined,
        maxPrice: this.maxPrice ?? undefined,
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
    this.page.set(1);
    void this.load();
  }

  onFilterChange(): void {
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
