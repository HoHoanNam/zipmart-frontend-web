import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import type { Category } from '../../../core/models/category.model';
import { CartService } from '../../../features/cart/cart.service';
import { CategoriesService } from '../../../features/categories/categories.service';
import { NotificationsService } from '../../../features/notifications/notifications.service';
import type { ProductSuggestion } from '../../../features/products/products.service';
import { ProductsService } from '../../../features/products/products.service';
import { WishlistService } from '../../../features/wishlist/wishlist.service';
import { CompareService } from '../../compare/compare.service';

const SUGGEST_DEBOUNCE_MS = 250;
const MIN_SUGGEST_LENGTH = 2;

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, FormsModule],
  templateUrl: './navbar.html',
})
export class Navbar {
  private readonly router = inject(Router);
  private readonly categoriesService = inject(CategoriesService);
  private readonly productsService = inject(ProductsService);
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  readonly compareService = inject(CompareService);
  readonly notificationsService = inject(NotificationsService);

  search = '';

  readonly categories = signal<Category[]>([]);
  readonly menuOpen = signal(false);
  readonly notificationsOpen = signal(false);
  readonly suggestions = signal<ProductSuggestion[]>([]);
  readonly showSuggestions = signal(false);
  private suggestTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    if (this.authService.isAuthenticated()) {
      void this.cartService.load();
    }
    void this.categoriesService.getAll().then((categories) => this.categories.set(categories));
  }

  onSearch(): void {
    this.showSuggestions.set(false);
    void this.router.navigate(['/products'], { queryParams: { q: this.search || null } });
  }

  onSearchInput(): void {
    clearTimeout(this.suggestTimer);
    const q = this.search.trim();
    if (q.length < MIN_SUGGEST_LENGTH) {
      this.suggestions.set([]);
      this.showSuggestions.set(false);
      return;
    }
    this.suggestTimer = setTimeout(() => void this.fetchSuggestions(q), SUGGEST_DEBOUNCE_MS);
  }

  private async fetchSuggestions(q: string): Promise<void> {
    const results = await this.productsService.suggest(q);
    // The query could have changed again while this request was in flight — drop a stale response.
    if (this.search.trim() !== q) return;
    this.suggestions.set(results);
    this.showSuggestions.set(results.length > 0);
  }

  selectSuggestion(productId: string): void {
    this.showSuggestions.set(false);
    this.search = '';
    void this.router.navigate(['/products', productId]);
  }

  closeSuggestions(): void {
    this.showSuggestions.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleNotifications(): void {
    this.notificationsOpen.update((open) => !open);
  }

  closeNotifications(): void {
    this.notificationsOpen.set(false);
  }

  async openNotification(notificationId: string, isRead: boolean): Promise<void> {
    if (!isRead) {
      await this.notificationsService.markRead(notificationId);
    }
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.notificationsService.markAllRead();
  }

  logout(): void {
    this.authService.logout();
  }
}
