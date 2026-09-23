import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import type { Category } from '../../../core/models/category.model';
import { CartService } from '../../../features/cart/cart.service';
import { CategoriesService } from '../../../features/categories/categories.service';
import { WishlistService } from '../../../features/wishlist/wishlist.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, FormsModule],
  templateUrl: './navbar.html',
})
export class Navbar {
  private readonly router = inject(Router);
  private readonly categoriesService = inject(CategoriesService);
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  search = '';

  readonly categories = signal<Category[]>([]);
  readonly menuOpen = signal(false);

  constructor() {
    if (this.authService.isAuthenticated()) {
      void this.cartService.load();
    }
    void this.categoriesService.getAll().then((categories) => this.categories.set(categories));
  }

  onSearch(): void {
    void this.router.navigate(['/products'], { queryParams: { q: this.search || null } });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
