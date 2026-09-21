import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import type { WishlistItem } from '../../core/models/wishlist.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly itemsSignal = signal<WishlistItem[]>([]);
  readonly items = this.itemsSignal.asReadonly();
  private readonly productIds = computed(
    () => new Set(this.itemsSignal().map((item) => item.productId)),
  );

  constructor() {
    // Wishlisted state must be known as soon as ANY product card renders
    // (list/home/detail), including for guests who haven't opened /wishlist
    // yet — so load reactively off auth state rather than waiting for the
    // wishlist page itself. Also clears on logout so a new session on the
    // same tab never shows a previous user's hearts.
    effect(() => {
      if (this.authService.isAuthenticated()) {
        void this.load();
      } else {
        this.itemsSignal.set([]);
      }
    });
  }

  isWishlisted(productId: string): boolean {
    return this.productIds().has(productId);
  }

  async load(): Promise<void> {
    const items = await firstValueFrom(
      this.http.get<WishlistItem[]>(`${environment.apiUrl}/wishlist`),
    );
    this.itemsSignal.set(items);
  }

  /** Returns true if the product is now wishlisted, false if it was just removed. */
  async toggle(productId: string): Promise<boolean> {
    const existing = this.itemsSignal().find((item) => item.productId === productId);
    if (existing) {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/wishlist/items/${existing.id}`));
      await this.load();
      return false;
    }

    await firstValueFrom(
      this.http.post<WishlistItem>(`${environment.apiUrl}/wishlist/items`, { productId }),
    );
    await this.load();
    return true;
  }
}
