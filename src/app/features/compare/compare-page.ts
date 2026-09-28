import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '../../core/models/product.model';
import { CompareService } from '../../shared/compare/compare.service';
import { VndCurrencyPipe } from '../../shared/pipes/vnd-currency.pipe';
import { StarRating } from '../../shared/components/star-rating/star-rating';
import { ProductsService } from '../products/products.service';

@Component({
  selector: 'app-compare-page',
  imports: [RouterLink, VndCurrencyPipe, StarRating],
  templateUrl: './compare-page.html',
})
export class ComparePage {
  private readonly compareService = inject(CompareService);
  private readonly productsService = inject(ProductsService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);

  /** Union of every attribute key across the compared products, in first-seen order — each row of the attributes table is one key. */
  readonly attributeKeys = computed(() => {
    const keys: string[] = [];
    for (const product of this.products()) {
      for (const key of Object.keys(product.attributes)) {
        if (!keys.includes(key)) keys.push(key);
      }
    }
    return keys;
  });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.products.set(await this.productsService.findManyForCompare(this.compareService.ids()));
    } finally {
      this.loading.set(false);
    }
  }

  attributeValue(product: Product, key: string): string {
    const value = product.attributes[key];
    if (value === undefined || value === null || value === '') return '—';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  async remove(productId: string): Promise<void> {
    this.compareService.remove(productId);
    await this.load();
  }

  async clearAll(): Promise<void> {
    this.compareService.clear();
    await this.load();
  }
}
