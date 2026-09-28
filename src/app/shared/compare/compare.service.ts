import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'zipmart:compare-ids';
/** Side-by-side comparison only reads well up to a handful of columns. */
const MAX_ITEMS = 4;

/**
 * Client-only (localStorage), no backend/auth — unlike wishlist/cart, a
 * compare list is a lightweight session convenience, not account state, so
 * guests can use it too and there's nothing to sync across devices.
 */
@Injectable({ providedIn: 'root' })
export class CompareService {
  private readonly idsSignal = signal<string[]>(this.readFromStorage());
  readonly ids = this.idsSignal.asReadonly();
  readonly count = computed(() => this.idsSignal().length);

  isComparing(productId: string): boolean {
    return this.idsSignal().includes(productId);
  }

  canAddMore(): boolean {
    return this.idsSignal().length < MAX_ITEMS;
  }

  /** Returns true if the product ended up in the list, false if it was just removed or the list was already full. */
  toggle(productId: string): boolean {
    const current = this.idsSignal();
    if (current.includes(productId)) {
      this.set(current.filter((id) => id !== productId));
      return false;
    }
    if (current.length >= MAX_ITEMS) {
      return false;
    }
    this.set([...current, productId]);
    return true;
  }

  remove(productId: string): void {
    this.set(this.idsSignal().filter((id) => id !== productId));
  }

  clear(): void {
    this.set([]);
  }

  private set(ids: string[]): void {
    this.idsSignal.set(ids);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  private readFromStorage(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
    } catch {
      return [];
    }
  }
}
