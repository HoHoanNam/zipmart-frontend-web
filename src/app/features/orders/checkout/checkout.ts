import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BehaviorTrackingService } from '../../../core/tracking/behavior-tracking.service';
import { CartService } from '../../cart/cart.service';
import { OrdersService } from '../orders.service';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink],
  templateUrl: './checkout.html',
})
export class Checkout {
  private readonly cartService = inject(CartService);
  private readonly ordersService = inject(OrdersService);
  private readonly tracking = inject(BehaviorTrackingService);
  private readonly router = inject(Router);

  readonly placing = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.cartService.load();
  }

  async confirmOrder(): Promise<void> {
    this.placing.set(true);
    this.error.set(null);
    try {
      const cartItems = this.cartService.items();
      const order = await this.ordersService.checkout();
      for (const item of cartItems) {
        this.tracking.track(item.productId, 'purchase');
      }
      await this.cartService.load();
      this.router.navigate(['/orders'], { state: { justPlacedOrderId: order.id } });
    } catch {
      this.error.set('Giỏ hàng trống hoặc đã xảy ra lỗi khi đặt hàng.');
    } finally {
      this.placing.set(false);
    }
  }
}
