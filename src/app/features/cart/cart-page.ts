import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VAT_RATE } from '../../core/constants/order.constants';
import type { Product } from '../../core/models/product.model';
import { VndCurrencyPipe } from '../../shared/pipes/vnd-currency.pipe';
import { ProductsService } from '../products/products.service';
import { CartService } from './cart.service';
import { CouponsService } from './coupons.service';

interface CartRow {
  itemId: string;
  product: Product;
  variantId: string | null;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, FormsModule, VndCurrencyPipe],
  templateUrl: './cart-page.html',
})
export class CartPage {
  readonly cartService = inject(CartService);
  private readonly productsService = inject(ProductsService);
  private readonly couponsService = inject(CouponsService);

  readonly rows = signal<CartRow[]>([]);
  readonly loading = signal(true);
  readonly subtotal = computed(() => this.rows().reduce((sum, row) => sum + row.lineTotal, 0));
  readonly taxAmount = computed(
    () => Math.max(0, this.subtotal() - this.cartService.discountAmount()) * VAT_RATE,
  );
  readonly grandTotal = computed(
    () => this.subtotal() - this.cartService.discountAmount() + this.taxAmount(),
  );

  readonly couponInput = signal('');
  readonly couponError = signal<string | null>(null);
  readonly applyingCoupon = signal(false);

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
          const variant = product.variants?.find((v) => v.id === item.variantId);
          const unitPrice = Number(variant?.price ?? product.price);
          const variantLabel = variant ? [variant.size, variant.color].filter(Boolean).join(' / ') : null;
          return {
            itemId: item.id,
            product,
            variantId: item.variantId,
            variantLabel,
            unitPrice,
            quantity: item.quantity,
            lineTotal: unitPrice * item.quantity,
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

    // Cập nhật lạc quan tại chỗ — KHÔNG gọi lại this.load(), vì load() gọi
    // productsService.findOne() cho TỪNG dòng trong giỏ (N+1), rất lag khi
    // giỏ có nhiều sản phẩm dù chỉ đổi số lượng của 1 dòng (giá không đổi
    // theo số lượng nên không cần fetch lại product/variant).
    const previousRows = this.rows();
    this.rows.update((rows) =>
      rows.map((row) =>
        row.itemId === itemId ? { ...row, quantity, lineTotal: row.unitPrice * quantity } : row,
      ),
    );
    try {
      await this.cartService.updateItem(itemId, quantity);
    } catch {
      this.rows.set(previousRows); // rollback nếu server từ chối (vd vượt tồn kho)
    }
  }

  async removeItem(itemId: string): Promise<void> {
    await this.cartService.removeItem(itemId);
    await this.load();
  }

  async applyCoupon(): Promise<void> {
    const code = this.couponInput().trim();
    if (!code) return;

    this.couponError.set(null);
    this.applyingCoupon.set(true);
    try {
      const result = await this.couponsService.apply(code, this.subtotal());
      this.cartService.setCoupon(code, result);
    } catch (err) {
      this.couponError.set(this.extractErrorMessage(err));
    } finally {
      this.applyingCoupon.set(false);
    }
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const flattened = this.flattenMessage((err.error as { message?: unknown } | undefined)?.message);
      if (flattened) return flattened;
    }
    return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }

  /**
   * Nest's global HttpExceptionFilter re-wraps `exception.getResponse()`
   * under its own `message` key, so a plain string exception ends up as
   * `{ message: { message: "..." } }`. Handle string / array / nested-object.
   */
  private flattenMessage(message: unknown): string | null {
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join('; ');
    if (message && typeof message === 'object' && 'message' in message) {
      return this.flattenMessage((message as { message?: unknown }).message);
    }
    return null;
  }
}
