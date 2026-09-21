import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../../../features/cart/cart.service';
import { WishlistService } from '../../../features/wishlist/wishlist.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, FormsModule],
  templateUrl: './navbar.html',
})
export class Navbar {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  search = '';

  constructor() {
    if (this.authService.isAuthenticated()) {
      void this.cartService.load();
    }
  }

  onSearch(): void {
    void this.router.navigate(['/products'], { queryParams: { q: this.search || null } });
  }

  logout(): void {
    this.authService.logout();
  }
}
