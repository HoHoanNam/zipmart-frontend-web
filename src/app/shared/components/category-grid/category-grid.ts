import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Category } from '../../../core/models/category.model';
import { CategoriesService } from '../../../features/categories/categories.service';
import { CATEGORY_IMAGE_MAP, DEFAULT_CATEGORY_IMAGE } from './category-grid-images';

/**
 * Home-only category browsing grid — replaces the old sidebar category list
 * (see docs/PROJECT-CATALOG-UI-REVIEW-EXPANSION.md Phần 2.2). Standalone,
 * loads its own categories in the constructor the same way the old
 * `Sidebar` did, since it isn't passed data from a parent.
 */
@Component({
  selector: 'app-category-grid',
  imports: [RouterLink],
  templateUrl: './category-grid.html',
})
export class CategoryGrid {
  private readonly categoriesService = inject(CategoriesService);

  readonly categories = signal<Category[]>([]);

  constructor() {
    void this.loadCategories();
  }

  private async loadCategories(): Promise<void> {
    this.categories.set(await this.categoriesService.getAll());
  }

  imageFor(category: Category): string {
    return CATEGORY_IMAGE_MAP[category.slug] ?? DEFAULT_CATEGORY_IMAGE;
  }
}
