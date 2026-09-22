export interface Review {
  id: string;
  userId: string;
  productId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
}

export interface CreateReviewInput {
  productId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}
