import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CartItem } from '../../core/models/cart.model';
import type { CouponApplyResult } from '../../core/models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);

  private readonly itemsSignal = signal<CartItem[]>([]);
  readonly items = this.itemsSignal.asReadonly();
  readonly itemCount = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0),
  );

  // Shared between CartPage (where a coupon is applied) and Checkout (which
  // needs to send the same code along at order-creation time) — a signal
  // here avoids plumbing it through query params or router state.
  private readonly couponCodeSignal = signal<string | null>(null);
  private readonly discountPercentSignal = signal(0);
  private readonly discountAmountSignal = signal(0);
  readonly couponCode = this.couponCodeSignal.asReadonly();
  readonly discountPercent = this.discountPercentSignal.asReadonly();
  readonly discountAmount = this.discountAmountSignal.asReadonly();

  setCoupon(code: string, result: CouponApplyResult): void {
    this.couponCodeSignal.set(code);
    this.discountPercentSignal.set(result.discountPercent);
    this.discountAmountSignal.set(result.discountAmount);
  }

  clearCoupon(): void {
    this.couponCodeSignal.set(null);
    this.discountPercentSignal.set(0);
    this.discountAmountSignal.set(0);
  }

  async load(): Promise<void> {
    const items = await firstValueFrom(
      this.http.get<CartItem[]>(`${environment.apiUrl}/cart`),
    );
    this.itemsSignal.set(items);
  }

  async addItem(productId: string, quantity: number, variantId?: string | null): Promise<void> {
    await firstValueFrom(
      this.http.post<CartItem>(`${environment.apiUrl}/cart/items`, {
        productId,
        quantity,
        variantId: variantId ?? undefined,
      }),
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
