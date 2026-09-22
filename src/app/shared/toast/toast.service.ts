import { Injectable, signal } from '@angular/core';
import type { Toast, ToastVariant } from '../../core/models/toast.model';

const AUTO_DISMISS_MS = 3000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();
  private nextId = 0;

  showCartAdded(productName: string): void {
    this.push('cart', `Đã thêm "${productName}" vào giỏ hàng`);
  }

  showWishlistAdded(productName: string): void {
    this.push('wishlist', `Đã thêm "${productName}" vào yêu thích`);
  }

  showWishlistRemoved(productName: string): void {
    this.push('wishlist', `Đã xoá "${productName}" khỏi yêu thích`);
  }

  showProfileUpdated(): void {
    this.push('profile', 'Đã cập nhật thông tin cá nhân');
  }

  showPasswordChanged(): void {
    this.push('profile', 'Đã đổi mật khẩu thành công');
  }

  dismiss(id: number): void {
    this.toastsSignal.update((list) => list.filter((t) => t.id !== id));
  }

  private push(variant: ToastVariant, message: string): void {
    const id = this.nextId++;
    this.toastsSignal.update((list) => [...list, { id, variant, message }]);
    setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
  }
}
