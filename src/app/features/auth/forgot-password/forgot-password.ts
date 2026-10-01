import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

/** Public route — requests a reset email via `POST /auth/forgot-password` (Infra F / mail module). */
@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly authService = inject(AuthService);

  email = '';
  readonly loading = signal(false);
  readonly sent = signal(false);
  readonly error = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.authService.forgotPassword(this.email);
      // Always show the "sent" state regardless of whether the email
      // actually exists — never reveal account existence via this form.
      this.sent.set(true);
    } catch {
      this.error.set('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      this.loading.set(false);
    }
  }
}
