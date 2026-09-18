import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CartItem } from '../../core/models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);

  private readonly itemsSignal = signal<CartItem[]>([]);
  readonly items = this.itemsSignal.asReadonly();
  readonly itemCount = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0),
  );

  async load(): Promise<void> {
    const items = await firstValueFrom(
      this.http.get<CartItem[]>(`${environment.apiUrl}/cart`),
    );
    this.itemsSignal.set(items);
  }

  async addItem(productId: string, quantity: number): Promise<void> {
    await firstValueFrom(
      this.http.post<CartItem>(`${environment.apiUrl}/cart/items`, { productId, quantity }),
    );
    await this.load();
  }

  async updateItem(itemId: string, quantity: number): Promise<void> {
    await firstValueFrom(
      this.http.patch<CartItem>(`${environment.apiUrl}/cart/items/${itemId}`, { quantity }),
    );
    await this.load();
  }

  async removeItem(itemId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${environment.apiUrl}/cart/items/${itemId}`));
    await this.load();
  }
}
