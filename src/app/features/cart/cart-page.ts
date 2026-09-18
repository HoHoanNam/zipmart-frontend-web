import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '../../core/models/product.model';
import { VndCurrencyPipe } from '../../shared/pipes/vnd-currency.pipe';
import { ProductsService } from '../products/products.service';
import { CartService } from './cart.service';

interface CartRow {
  itemId: string;
  product: Product;
  quantity: number;
  lineTotal: number;
}

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, VndCurrencyPipe],
  templateUrl: './cart-page.html',
})
export class CartPage {
  private readonly cartService = inject(CartService);
  private readonly productsService = inject(ProductsService);

  readonly rows = signal<CartRow[]>([]);
  readonly loading = signal(true);
  readonly total = computed(() => this.rows().reduce((sum, row) => sum + row.lineTotal, 0));

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      await this.cartService.load();
      const items = this.cartService.items();
      const rows = await Promise.all(
        items.map(async (item) => {
          const product = await this.productsService.findOne(item.productId);
          return {
            itemId: item.id,
            product,
            quantity: item.quantity,
            lineTotal: Number(product.price) * item.quantity,
          };
        }),
      );
      this.rows.set(rows);
    } finally {
      this.loading.set(false);
    }
  }

  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    if (quantity < 1) return;
    await this.cartService.updateItem(itemId, quantity);
    await this.load();
  }

  async removeItem(itemId: string): Promise<void> {
    await this.cartService.removeItem(itemId);
    await this.load();
  }
}
