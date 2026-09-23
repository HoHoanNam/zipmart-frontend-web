import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { Order, OrderStatus } from '../../core/models/order.model';
import type { UserProfile } from '../../core/models/user.model';
import { AddressList } from '../addresses/address-list';
import { VndCurrencyPipe } from '../../shared/pipes/vnd-currency.pipe';
import { ToastService } from '../../shared/toast/toast.service';
import { OrdersService } from '../orders/orders.service';
import { ProfileService } from './profile.service';
import { UploadsService } from './uploads.service';

const ROLE_LABELS: Record<'customer' | 'admin', string> = {
  customer: 'Khách hàng',
  admin: 'Quản trị viên',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Đang xử lý',
  paid: 'Đã thanh toán',
  shipped: 'Đã giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};

const RECENT_ORDERS_LIMIT = 5;

@Component({
  selector: 'app-profile-page',
  imports: [FormsModule, RouterLink, DatePipe, VndCurrencyPipe, AddressList],
  templateUrl: './profile-page.html',
})
export class ProfilePage {
  private readonly profileService = inject(ProfileService);
  private readonly uploadsService = inject(UploadsService);
  private readonly ordersService = inject(OrdersService);
  private readonly toastService = inject(ToastService);

  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(true);
  readonly uploading = signal(false);

  phoneNumber = '';
  readonly savingPhone = signal(false);
  readonly phoneError = signal<string | null>(null);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  readonly savingPassword = signal(false);
  readonly passwordError = signal<string | null>(null);

  readonly recentOrders = signal<Order[]>([]);
  readonly ordersLoading = signal(true);

  constructor() {
    void this.load();
    void this.loadRecentOrders();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const profile = await this.profileService.getMe();
      this.profile.set(profile);
      this.phoneNumber = profile.phoneNumber ?? '';
    } finally {
      this.loading.set(false);
    }
  }

  private async loadRecentOrders(): Promise<void> {
    this.ordersLoading.set(true);
    try {
      const orders = await this.ordersService.findAll();
      this.recentOrders.set(orders.slice(0, RECENT_ORDERS_LIMIT));
    } finally {
      this.ordersLoading.set(false);
    }
  }

  roleLabel(role: 'customer' | 'admin'): string {
    return ROLE_LABELS[role];
  }

  statusLabel(status: OrderStatus): string {
    return STATUS_LABELS[status];
  }

  async onAvatarSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploading.set(true);
    try {
      const { url } = await this.uploadsService.uploadAvatar(file);
      const updated = await this.profileService.updateMe({ avatarUrl: url });
      this.profile.set(updated);
      this.toastService.showProfileUpdated();
    } catch {
      this.phoneError.set('Không thể tải ảnh đại diện lên. Vui lòng thử lại.');
    } finally {
      this.uploading.set(false);
    }
  }

  async onSubmitPhone(): Promise<void> {
    this.savingPhone.set(true);
    this.phoneError.set(null);
    try {
      const updated = await this.profileService.updateMe({ phoneNumber: this.phoneNumber });
      this.profile.set(updated);
      this.toastService.showProfileUpdated();
    } catch {
      this.phoneError.set('Không thể cập nhật số điện thoại. Vui lòng thử lại.');
    } finally {
      this.savingPhone.set(false);
    }
  }

  async onSubmitPassword(): Promise<void> {
    this.passwordError.set(null);

    if (this.newPassword.length < 8) {
      this.passwordError.set('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    this.savingPassword.set(true);
    try {
      await this.profileService.changePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      });
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.toastService.showPasswordChanged();
    } catch {
      this.passwordError.set('Mật khẩu hiện tại không đúng.');
    } finally {
      this.savingPassword.set(false);
    }
  }
}
