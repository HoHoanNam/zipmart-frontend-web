import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CreateReviewInput,
  Review,
  ReviewSummary,
  UpdateReviewInput,
} from '../../core/models/review.model';

/** Thin HTTP service, same shape as `WishlistService` — no caching, callers reload after mutating. */
@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly http = inject(HttpClient);

  async findForProduct(productId: string): Promise<Review[]> {
    return firstValueFrom(
      this.http.get<Review[]>(`${environment.apiUrl}/reviews`, {
        params: new HttpParams().set('productId', productId),
      }),
    );
  }

  async getSummary(productId: string): Promise<ReviewSummary> {
    return firstValueFrom(
      this.http.get<ReviewSummary>(`${environment.apiUrl}/reviews/summary`, {
        params: new HttpParams().set('productId', productId),
      }),
    );
  }

  async create(input: CreateReviewInput): Promise<Review> {
    return firstValueFrom(this.http.post<Review>(`${environment.apiUrl}/reviews`, input));
  }

  async update(id: string, input: UpdateReviewInput): Promise<Review> {
    return firstValueFrom(this.http.patch<Review>(`${environment.apiUrl}/reviews/${id}`, input));
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/reviews/${id}`));
  }
}
