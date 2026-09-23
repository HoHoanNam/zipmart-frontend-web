import { Component, input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.html',
})
export class StarRating {
  readonly average = input(0);
  readonly size = input<'sm' | 'md'>('md');

  readonly stars = [1, 2, 3, 4, 5];

  isFilled(star: number): boolean {
    return star <= Math.round(this.average());
  }
}
