import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * Landing page the backend redirects to after a successful Google/Facebook
 * login, carrying a short-lived one-time `?code=` (see A.4 in the expansion
 * plan — code is stored server-side in Redis, TTL 60s). Exchanges it for
 * real JWTs via `POST /auth/oauth/exchange`, then continues into the app.
 * Public route — the user isn't authenticated yet when this loads.
 */
@Component({
  selector: 'app-oauth-callback',
  imports: [RouterLink],
  templateUrl: './oauth-callback.html',
})
export class OauthCallback {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly error = signal<string | null>(null);

  constructor() {
    void this.exchange();
  }

  private async exchange(): Promise<void> {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (!code) {
      this.error.set('Thiếu mã xác thực từ nhà cung cấp đăng nhập.');
      return;
    }

    try {
      await this.authService.exchangeOAuthCode(code);
      await this.router.navigateByUrl('/');
    } catch {
      this.error.set('Đăng nhập bằng mạng xã hội thất bại. Vui lòng thử lại.');
    }
  }
}
