import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '../../../core/models/product.model';
import { ToastService } from '../../toast/toast.service';
import { WishlistService } from '../../../features/wishlist/wishlist.service';
import { VndCurrencyPipe } from '../../pipes/vnd-currency.pipe';
import { StarRating } from '../star-rating/star-rating';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, VndCurrencyPipe, DecimalPipe, StarRating],
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

  readonly hasDiscount = computed(() => {
    const original = this.product().originalPrice;
    return original !== null && Number(original) > Number(this.product().price);
  });

  readonly discountPercent = computed(() => {
    const product = this.product();
    if (!product.originalPrice) return 0;
    const original = Number(product.originalPrice);
    const current = Number(product.price);
    return Math.round((1 - current / original) * 100);
  });

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
