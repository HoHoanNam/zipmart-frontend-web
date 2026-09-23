import { Component, input } from '@angular/core';
import type { ReviewSummary } from '../../../core/models/review.model';
import { StarRating } from '../../../shared/components/star-rating/star-rating';

/** Placed between the product `<h1>` and price on Product Detail. */
@Component({
  selector: 'app-rating-summary',
  imports: [StarRating],
  templateUrl: './rating-summary.html',
})
export class RatingSummary {
  readonly summary = input.required<ReviewSummary>();
}
