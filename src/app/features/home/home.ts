import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import type { Banner } from '../../core/models/banner.model';
import type { Category } from '../../core/models/category.model';
import type { Product } from '../../core/models/product.model';
import { BannerCarousel } from '../../shared/components/banner-carousel/banner-carousel';
import { CategoryGrid } from '../../shared/components/category-grid/category-grid';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { BehaviorTrackingService } from '../../core/tracking/behavior-tracking.service';
import { ToastService } from '../../shared/toast/toast.service';
import { CartService } from '../cart/cart.service';
import { CategoriesService } from '../categories/categories.service';
import { RecWidget } from '../recommendations/rec-widget/rec-widget';
import { BannersService } from './banners.service';
import { ProductsService } from '../products/products.service';

/** Shown only if there are no admin-configured banners yet, so the homepage never looks broken. */
const FALLBACK_SLIDE: Banner = {
  id: 'fallback',
  imageUrl:
    'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80',
  headline: 'Mua sắm thông minh hơn với zipmart',
  subtext:
    'Gợi ý sản phẩm được cá nhân hoá dựa trên hành vi mua sắm của bạn — càng dùng nhiều, gợi ý càng chính xác.',
  ctaLabel: 'Khám phá sản phẩm',
  ctaLink: '/products',
  sortOrder: 0,
  active: true,
  createdAt: new Date().toISOString(),
};

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, RecWidget, CategoryGrid, BannerCarousel, ProductCard],
  templateUrl: './home.html',
})
export class Home {
  private readonly router = inject(Router);
  private readonly categoriesService = inject(CategoriesService);
  private readonly bannersService = inject(BannersService);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly tracking = inject(BehaviorTrackingService);
  private readonly toastService = inject(ToastService);
  readonly authService = inject(AuthService);

  searchQuery = '';
  readonly categories = signal<Category[]>([]);
  readonly banners = signal<Banner[]>([FALLBACK_SLIDE]);
  readonly bestSellers = signal<Product[]>([]);
  readonly bestSellersLoading = signal(true);

  constructor() {
    void this.loadCategories();
    void this.loadBanners();
    void this.loadBestSellers();
  }

  private async loadCategories(): Promise<void> {
    this.categories.set(await this.categoriesService.getAll());
  }

  private async loadBanners(): Promise<void> {
    const banners = await this.bannersService.findActive();
    this.banners.set(banners.length > 0 ? banners : [FALLBACK_SLIDE]);
  }

  private async loadBestSellers(): Promise<void> {
    this.bestSellersLoading.set(true);
    try {
      const page = await this.productsService.findAll({ sort: 'bestselling', limit: 10 });
      this.bestSellers.set(page.items);
    } finally {
      this.bestSellersLoading.set(false);
    }
  }

  onSearch(): void {
    void this.router.navigate(['/products'], { queryParams: { q: this.searchQuery || null } });
  }

  async onAddToCart(productId: string): Promise<void> {
    const product = this.bestSellers().find((p) => p.id === productId);
    await this.cartService.addItem(productId, 1);
    this.tracking.track(productId, 'add_to_cart');
    if (product) {
      this.toastService.showCartAdded(product.name);
    }
  }
}
