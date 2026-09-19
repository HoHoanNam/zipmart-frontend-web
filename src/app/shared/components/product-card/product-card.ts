import { DecimalPipe } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '../../../core/models/product.model';
import { VndCurrencyPipe } from '../../pipes/vnd-currency.pipe';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, VndCurrencyPipe, DecimalPipe],
  templateUrl: './product-card.html',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly badge = input<string | null>(null);
  /** 0-1 — real recommendation score from `RecommendationItem.score`. Badge only renders when set. */
  readonly matchScore = input<number | null>(null);

  readonly addToCart = output<string>();

  /** Local-only UI state, not persisted — no wishlist backend exists yet. */
  readonly wishlisted = signal(false);

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.product().id);
  }

  onToggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlisted.update((value) => !value);
  }
}
