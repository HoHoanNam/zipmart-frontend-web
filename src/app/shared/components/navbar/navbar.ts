import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../../../features/cart/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
})
export class Navbar {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);

  constructor() {
    if (this.authService.isAuthenticated()) {
      void this.cartService.load();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
