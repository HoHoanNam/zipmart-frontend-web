import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '../../../core/models/product.model';
import { VndCurrencyPipe } from '../../pipes/vnd-currency.pipe';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, VndCurrencyPipe],
  templateUrl: './product-card.html',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly badge = input<string | null>(null);

  readonly addToCart = output<string>();

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.product().id);
  }
}
