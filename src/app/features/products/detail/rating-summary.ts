import { Component, input } from '@angular/core';
import type { ReviewSummary } from '../../../core/models/review.model';

/** Placed between the product `<h1>` and price on Product Detail. */
@Component({
  selector: 'app-rating-summary',
  templateUrl: './rating-summary.html',
})
export class RatingSummary {
  readonly summary = input.required<ReviewSummary>();

  readonly stars = [1, 2, 3, 4, 5];

  isFilled(star: number): boolean {
    return star <= Math.round(this.summary().average);
  }
}
