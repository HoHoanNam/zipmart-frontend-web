import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { BehaviorTrackingService } from '../../../core/tracking/behavior-tracking.service';
import type { Category } from '../../../core/models/category.model';
import type { Product } from '../../../core/models/product.model';
import type { Review, ReviewSummary } from '../../../core/models/review.model';
import { CartService } from '../../cart/cart.service';
import { VndCurrencyPipe } from '../../../shared/pipes/vnd-currency.pipe';
import { RecWidget } from '../../recommendations/rec-widget/rec-widget';
import { ReviewsService } from '../../reviews/reviews.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { CategoriesService } from '../../categories/categories.service';
import { ProductsService } from '../products.service';
import { RatingSummary } from './rating-summary';
import { ReviewForm } from './review-form';
import { ReviewList } from './review-list';

interface AttributeRow {
  label: string;
  value: string;
}

/**
 * Narrow view over `Product.attributes` for the `apparel` category only —
 * not a shared model, just what this page needs to read
 * `sizes`/`colors`/`colorImages` (see
 * docs/PROJECT-CATALOG-UI-REVIEW-EXPANSION.md Phần 2.4).
 */
interface ApparelAttributes {
  sizes?: string[];
  colors?: string[];
  colorImages?: Record<string, string>;
}

/**
 * Fixed size set — kept in sync by hand with
 * `apparel-attributes.dto.ts` (zipmart-backend-nest) and
 * `products-admin.ts` (zipmart-admin-web); see
 * docs/PROJECT-CATALOG-UI-REVIEW-EXPANSION.md Phần 2.4 for why there's no
 * shared package/endpoint for this one 6-element constant.
 */
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

/** Attribute keys shown via the dedicated color-tile / size-chip pickers instead of the generic attribute table. */
const APPAREL_INLINE_KEYS = new Set(['sizes', 'colors', 'colorImages']);

/** Static v1 shipping rule — no backend field for this yet, see plan doc Phần 2.4. */
const FREE_SHIPPING_THRESHOLD_VND = 500_000;

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

function formatAttributes(
  attributes: Record<string, unknown>,
  excludeKeys: ReadonlySet<string>,
): AttributeRow[] {
  return Object.entries(attributes)
    .filter(([key, value]) => !excludeKeys.has(key) && value !== null && value !== undefined && value !== '')
    .map(([key, value]) => ({ label: labelFor(key), value: formatValue(key, value) }));
}

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, RecWidget, VndCurrencyPipe, RatingSummary, ReviewList, ReviewForm],
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly cartService = inject(CartService);
  private readonly tracking = inject(BehaviorTrackingService);
  private readonly toastService = inject(ToastService);
  private readonly reviewsService = inject(ReviewsService);
  readonly authService = inject(AuthService);

  readonly product = signal<Product | null>(null);
  readonly category = signal<Category | null>(null);
  readonly loading = signal(true);
  readonly quantity = signal(1);
  readonly activeImageIndex = signal(0);

  readonly reviews = signal<Review[]>([]);
  readonly reviewSummary = signal<ReviewSummary>({ average: 0, count: 0 });
  readonly editingReview = signal<Review | null>(null);
  readonly reviewError = signal<string | null>(null);
  readonly reviewFormResetToken = signal(0);

  readonly sizeOptions = SIZE_OPTIONS;
  readonly freeShippingThreshold = FREE_SHIPPING_THRESHOLD_VND;

  readonly attributeRows = computed<AttributeRow[]>(() => {
    const product = this.product();
    if (!product) return [];
    const excludeKeys = this.category()?.slug === 'apparel' ? APPAREL_INLINE_KEYS : new Set<string>();
    return formatAttributes(product.attributes, excludeKeys);
  });

  private readonly apparelAttributes = computed<ApparelAttributes>(
    () => (this.product()?.attributes ?? {}) as ApparelAttributes,
  );

  readonly colorTiles = computed(() => {
    const attrs = this.apparelAttributes();
    const images = attrs.colorImages ?? {};
    return (attrs.colors ?? []).map((name) => ({ name, imageUrl: images[name] ?? null }));
  });

  readonly sizeChips = computed(() => {
    const available = new Set(this.apparelAttributes().sizes ?? []);
    return SIZE_OPTIONS.map((size) => ({ size, available: available.has(size) }));
  });

  readonly isFreeShipping = computed(() => {
    const product = this.product();
    return product ? Number(product.price) >= FREE_SHIPPING_THRESHOLD_VND : false;
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
    this.editingReview.set(null);
    this.reviewError.set(null);
    try {
      const [product, reviews, summary] = await Promise.all([
        this.productsService.findOne(id),
        this.reviewsService.findForProduct(id),
        this.reviewsService.getSummary(id),
      ]);
      this.product.set(product);
      this.reviews.set(reviews);
      this.reviewSummary.set(summary);
      this.activeImageIndex.set(0);
      this.tracking.track(id, 'view');

      if (product.categoryId) {
        const categories = await this.categoriesService.getAll();
        this.category.set(categories.find((c) => c.id === product.categoryId) ?? null);
      } else {
        this.category.set(null);
      }
    } finally {
      this.loading.set(false);
    }
  }

  private async reloadReviews(): Promise<void> {
    const product = this.product();
    if (!product) return;
    const [reviews, summary] = await Promise.all([
      this.reviewsService.findForProduct(product.id),
      this.reviewsService.getSummary(product.id),
    ]);
    this.reviews.set(reviews);
    this.reviewSummary.set(summary);
  }

  selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  selectColor(colorName: string): void {
    const product = this.product();
    const url = this.apparelAttributes().colorImages?.[colorName];
    if (!product || !url) return;
    const index = product.images.indexOf(url);
    if (index >= 0) this.selectImage(index);
  }

  async onAddToCart(): Promise<void> {
    const product = this.product();
    if (!product) return;

    await this.cartService.addItem(product.id, this.quantity());
    this.tracking.track(product.id, 'add_to_cart');
    this.toastService.showCartAdded(product.name);
  }

  onEditReview(review: Review): void {
    this.reviewError.set(null);
    this.editingReview.set(review);
  }

  onCancelEditReview(): void {
    this.reviewError.set(null);
    this.editingReview.set(null);
  }

  async onSubmitReview(data: { rating: number; comment: string }): Promise<void> {
    const product = this.product();
    if (!product) return;

    this.reviewError.set(null);
    try {
      const editing = this.editingReview();
      if (editing) {
        await this.reviewsService.update(editing.id, data);
      } else {
        await this.reviewsService.create({ productId: product.id, ...data });
      }
      this.editingReview.set(null);
      this.reviewFormResetToken.update((n) => n + 1);
      await this.reloadReviews();
    } catch (err) {
      this.reviewError.set(this.extractReviewErrorMessage(err));
    }
  }

  async onDeleteReview(reviewId: string): Promise<void> {
    await this.reviewsService.remove(reviewId);
    if (this.editingReview()?.id === reviewId) {
      this.editingReview.set(null);
    }
    await this.reloadReviews();
  }

  private extractReviewErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse && err.status === 409) {
      return 'Bạn đã đánh giá sản phẩm này rồi. Vui lòng sửa đánh giá hiện có thay vì gửi thêm.';
    }
    return 'Không thể gửi đánh giá. Vui lòng thử lại.';
  }
}
