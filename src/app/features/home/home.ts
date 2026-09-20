import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import type { Category } from '../../core/models/category.model';
import { CategoriesService } from '../categories/categories.service';
import { RecWidget } from '../recommendations/rec-widget/rec-widget';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, RecWidget],
  templateUrl: './home.html',
})
export class Home {
  private readonly router = inject(Router);
  private readonly categoriesService = inject(CategoriesService);
  readonly authService = inject(AuthService);

  searchQuery = '';
  readonly categories = signal<Category[]>([]);

  constructor() {
    void this.loadCategories();
  }

  private async loadCategories(): Promise<void> {
    this.categories.set(await this.categoriesService.getAll());
  }

  onSearch(): void {
    void this.router.navigate(['/products'], { queryParams: { q: this.searchQuery || null } });
  }
}
