import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

/** Public route, landed on from the reset-link email — `?token=`. `POST /auth/reset-password`. */
@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly token = this.route.snapshot.queryParamMap.get('token');

  newPassword = '';
  confirmPassword = '';
  readonly loading = signal(false);
  readonly done = signal(false);
  readonly error = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    this.error.set(null);

    if (!this.token) {
      this.error.set('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return;
    }
    if (this.newPassword.length < 8) {
      this.error.set('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Xác nhận mật khẩu không khớp.');
      return;
    }

    this.loading.set(true);
    try {
      await this.authService.resetPassword(this.token, this.newPassword);
      this.done.set(true);
      setTimeout(() => void this.router.navigateByUrl('/login'), 2000);
    } catch {
      this.error.set('Liên kết đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu lại.');
    } finally {
      this.loading.set(false);
    }
  }
}
