import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '../../../core/models/product.model';
import { ToastService } from '../../toast/toast.service';
import { WishlistService } from '../../../features/wishlist/wishlist.service';
import { VndCurrencyPipe } from '../../pipes/vnd-currency.pipe';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, VndCurrencyPipe, DecimalPipe],
  templateUrl: './product-card.html',
})
export class ProductCard {
  private readonly wishlistService = inject(WishlistService);
  private readonly toastService = inject(ToastService);

  readonly product = input.required<Product>();
  readonly badge = input<string | null>(null);
  /** 0-1 — real recommendation score from `RecommendationItem.score`. Badge only renders when set. */
  readonly matchScore = input<number | null>(null);

  readonly addToCart = output<string>();

  readonly wishlisted = computed(() => this.wishlistService.isWishlisted(this.product().id));

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.product().id);
  }

  async onToggleWishlist(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    const name = this.product().name;
    const nowWishlisted = await this.wishlistService.toggle(this.product().id);
    if (nowWishlisted) {
      this.toastService.showWishlistAdded(name);
    } else {
      this.toastService.showWishlistRemoved(name);
    }
  }
}
