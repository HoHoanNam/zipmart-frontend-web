import { DatePipe } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import type { Review } from '../../../core/models/review.model';

@Component({
  selector: 'app-review-list',
  imports: [DatePipe],
  templateUrl: './review-list.html',
})
export class ReviewList {
  private readonly authService = inject(AuthService);

  readonly reviews = input.required<Review[]>();

  readonly edit = output<Review>();
  readonly delete = output<string>();

  readonly stars = [1, 2, 3, 4, 5];

  isOwn(review: Review): boolean {
    return review.userId === this.authService.currentUser()?.sub;
  }

  initialFor(review: Review): string {
    return review.authorName.charAt(0).toUpperCase();
  }
}
