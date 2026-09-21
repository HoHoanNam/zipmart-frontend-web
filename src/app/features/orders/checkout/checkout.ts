import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VAT_RATE } from '../../../core/constants/order.constants';
import type { PaymentMethod } from '../../../core/models/order.model';
import type { Product } from '../../../core/models/product.model';
import { BehaviorTrackingService } from '../../../core/tracking/behavior-tracking.service';
import { VndCurrencyPipe } from '../../../shared/pipes/vnd-currency.pipe';
import { CartService } from '../../cart/cart.service';
import { ProductsService } from '../../products/products.service';
import { OrdersService } from '../orders.service';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, FormsModule, VndCurrencyPipe],
  templateUrl: './checkout.html',
})
export class Checkout {
  readonly cartService = inject(CartService);
  private readonly productsService = inject(ProductsService);
  private readonly ordersService = inject(OrdersService);
  private readonly tracking = inject(BehaviorTrackingService);
  private readonly router = inject(Router);

  recipientName = '';
  phoneNumber = '';
  city = '';
  district = '';
  ward = '';
  streetAddress = '';
  paymentMethod: PaymentMethod = 'cod';

  readonly placing = signal(false);
  readonly error = signal<string | null>(null);
  readonly loadingSummary = signal(true);
  private readonly products = signal<{ product: Product; quantity: number }[]>([]);

  readonly subtotal = computed(() =>
    this.products().reduce((sum, row) => sum + Number(row.product.price) * row.quantity, 0),
  );
  readonly taxAmount = computed(
    () => Math.max(0, this.subtotal() - this.cartService.discountAmount()) * VAT_RATE,
  );
  readonly grandTotal = computed(
    () => this.subtotal() - this.cartService.discountAmount() + this.taxAmount(),
  );

  constructor() {
    void this.loadSummary();
  }

  private async loadSummary(): Promise<void> {
    this.loadingSummary.set(true);
    try {
      await this.cartService.load();
      const items = this.cartService.items();
      const rows = await Promise.all(
        items.map(async (item) => ({
          product: await this.productsService.findOne(item.productId),
          quantity: item.quantity,
        })),
      );
      this.products.set(rows);
    } finally {
      this.loadingSummary.set(false);
    }
  }

  async confirmOrder(): Promise<void> {
    this.placing.set(true);
    this.error.set(null);
    try {
      const cartItems = this.cartService.items();
      const order = await this.ordersService.checkout({
        recipientName: this.recipientName,
        phoneNumber: this.phoneNumber,
        city: this.city,
        district: this.district,
        ward: this.ward,
        streetAddress: this.streetAddress,
        paymentMethod: this.paymentMethod,
        couponCode: this.cartService.couponCode() ?? undefined,
      });
      for (const item of cartItems) {
        this.tracking.track(item.productId, 'purchase');
      }
      await this.cartService.load();
      this.cartService.clearCoupon();
      this.router.navigate(['/orders'], { state: { justPlacedOrderId: order.id } });
    } catch {
      this.error.set('Giỏ hàng trống hoặc đã xảy ra lỗi khi đặt hàng.');
    } finally {
      this.placing.set(false);
    }
  }
}
