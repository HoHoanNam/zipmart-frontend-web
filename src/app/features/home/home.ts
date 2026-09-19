import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { RecWidget } from '../recommendations/rec-widget/rec-widget';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, RecWidget],
  templateUrl: './home.html',
})
export class Home {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  searchQuery = '';

  // Placeholder tabs — no categories API yet in zipmart-backend-nest, kept
  // static/disabled rather than wired to fake filtering. See DESIGN.md notes.
  readonly staticFilterTabs = ['Điện tử & Công nghệ', 'Phụ kiện', 'Ưu đãi đặc quyền'];

  onSearch(): void {
    void this.router.navigate(['/products'], { queryParams: { q: this.searchQuery || null } });
  }
}
