import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigateByUrl('/');
    } catch {
      this.error.set('Email hoặc mật khẩu không đúng.');
    } finally {
      this.loading.set(false);
    }
  }
}
