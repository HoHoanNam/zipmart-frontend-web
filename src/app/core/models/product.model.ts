export interface Product {
  id: string;
  name: string;
  categoryId: string | null;
  brand: string | null;
  description: string | null;
  images: string[];
  weightGrams: number | null;
  attributes: Record<string, unknown>;
  price: string;
  /** Pre-discount reference price — when present and greater than `price`, show a strikethrough + "-X%" badge. */
  originalPrice: string | null;
  stock: number;
  createdAt: string;
  /** Only present on `GET /products` list responses, not on `GET /products/:id`. */
  averageRating?: number;
  reviewCount?: number;
  soldCount?: number;
  effectiveStock?: number;
  /** Only present on `GET /products/:id` — real per-size/color price+stock, when this product opted into variants. */
  variants?: ProductVariant[];
}

export type ProductSort = 'price_asc' | 'price_desc' | 'newest' | 'bestselling';

export interface ProductVariant {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  sku: string;
  price: string | null;
  stock: number;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}
