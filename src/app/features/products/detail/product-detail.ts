import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { BehaviorTrackingService } from '../../../core/tracking/behavior-tracking.service';
import type { Category } from '../../../core/models/category.model';
import type { Product } from '../../../core/models/product.model';
import { CartService } from '../../cart/cart.service';
import { VndCurrencyPipe } from '../../../shared/pipes/vnd-currency.pipe';
import { RecWidget } from '../../recommendations/rec-widget/rec-widget';
import { CategoriesService } from '../../categories/categories.service';
import { ProductsService } from '../products.service';

interface AttributeRow {
  label: string;
  value: string;
}

const ATTRIBUTE_LABELS: Record<string, string> = {
  model: 'Model',
  color: 'Màu sắc',
  warrantyMonths: 'Bảo hành',
  specs: 'Thông số',
  size: 'Kích cỡ',
  material: 'Chất liệu',
  gender: 'Đối tượng',
  capacity: 'Dung tích',
  dimensionsCm: 'Kích thước (cm)',
  netWeight: 'Khối lượng tịnh',
  ingredients: 'Thành phần',
  origin: 'Xuất xứ',
  storageInstructions: 'Bảo quản',
  unit: 'Đơn vị',
  allergens: 'Dị nguyên',
  length: 'Dài',
  width: 'Rộng',
  height: 'Cao',
};

const GENDER_LABELS: Record<string, string> = {
  nam: 'Nam',
  nu: 'Nữ',
  unisex: 'Unisex',
};

function labelFor(key: string): string {
  return ATTRIBUTE_LABELS[key] ?? key;
}

function formatValue(key: string, value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${labelFor(k)}: ${v}`)
      .join(' · ');
  }
  if (key === 'warrantyMonths') {
    return `${value} tháng`;
  }
  if (key === 'gender') {
    return GENDER_LABELS[value as string] ?? String(value);
  }
  return String(value);
}

function formatAttributes(attributes: Record<string, unknown>): AttributeRow[] {
  return Object.entries(attributes)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => ({ label: labelFor(key), value: formatValue(key, value) }));
}

@Component({
  selector: 'app-product-detail',
  imports: [RecWidget, VndCurrencyPipe],
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly cartService = inject(CartService);
  private readonly tracking = inject(BehaviorTrackingService);
  readonly authService = inject(AuthService);

  readonly product = signal<Product | null>(null);
  readonly category = signal<Category | null>(null);
  readonly loading = signal(true);
  readonly quantity = signal(1);
  readonly justAdded = signal(false);

  readonly attributeRows = computed<AttributeRow[]>(() => {
    const product = this.product();
    return product ? formatAttributes(product.attributes) : [];
  });

  constructor() {
    // Subscribe, not `route.snapshot` — ShellSimple keeps this component
    // instance alive across `/products/:id1` -> `/products/:id2` navigations
    // (e.g. clicking a recommended product on this same page), so a
    // one-time snapshot read in the constructor would go stale.
    this.route.paramMap.subscribe((params) => {
      void this.load(params.get('id'));
    });
  }

  private async load(id: string | null): Promise<void> {
    if (!id) return;

    this.loading.set(true);
    try {
      const product = await this.productsService.findOne(id);
      this.product.set(product);
      this.tracking.track(id, 'view');

      if (product.categoryId) {
        const categories = await this.categoriesService.getAll();
        this.category.set(categories.find((c) => c.id === product.categoryId) ?? null);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async onAddToCart(): Promise<void> {
    const product = this.product();
    if (!product) return;

    await this.cartService.addItem(product.id, this.quantity());
    this.tracking.track(product.id, 'add_to_cart');
    this.justAdded.set(true);
    setTimeout(() => this.justAdded.set(false), 2000);
  }
}
