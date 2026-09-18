import type { Product } from './product.model';

export interface RecommendationItem {
  productId: string;
  score: number;
  reason: string;
  product: Product;
}

export interface RecommendationResult {
  items: RecommendationItem[];
  coldStart: boolean;
}
