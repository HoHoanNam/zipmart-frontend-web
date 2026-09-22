import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Review } from '../../../core/models/review.model';

/**
 * Create-or-edit review form. Gating on `authService.isAuthenticated()`
 * happens in `ProductDetail`'s template (same pattern already used there
 * for `<app-rec-widget>`), not inside this component.
 */
@Component({
  selector: 'app-review-form',
  imports: [FormsModule],
  templateUrl: './review-form.html',
})
export class ReviewForm {
  /** When set, the form pre-fills and acts as an edit; when null, it's a new review. */
  readonly editingReview = input<Review | null>(null);
  /** Set by the parent after a failed submit (e.g. 409 "already reviewed"). */
  readonly error = input<string | null>(null);
  /**
   * Bumped by the parent after every successful submit. Needed because a
   * fresh "new review" submit leaves `editingReview` at `null` both before
   * and after (no signal change), so the effect below wouldn't otherwise
   * re-run to clear the form.
   */
  readonly resetToken = input<number>(0);

  readonly submitReview = output<{ rating: number; comment: string }>();
  readonly cancel = output<void>();

  readonly stars = [1, 2, 3, 4, 5];
  readonly rating = signal(5);
  comment = '';

  constructor() {
    effect(() => {
      const review = this.editingReview();
      this.resetToken();
      this.rating.set(review?.rating ?? 5);
      this.comment = review?.comment ?? '';
    });
  }

  setRating(value: number): void {
    this.rating.set(value);
  }

  onSubmit(): void {
    const comment = this.comment.trim();
    if (!comment) return;
    this.submitReview.emit({ rating: this.rating(), comment });
  }
}
