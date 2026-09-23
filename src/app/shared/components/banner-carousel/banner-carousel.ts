import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Banner } from '../../../core/models/banner.model';

const AUTO_ROTATE_MS = 6000;

@Component({
  selector: 'app-banner-carousel',
  imports: [RouterLink],
  templateUrl: './banner-carousel.html',
})
export class BannerCarousel {
  private readonly destroyRef = inject(DestroyRef);

  readonly slides = input.required<Banner[]>();
  readonly activeIndex = signal(0);

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // `effect()`, not `ngOnChanges` — signal inputs don't reliably drive the
    // legacy lifecycle hook, so re-arm the auto-rotate timer reactively
    // whenever the slide count changes instead.
    effect(() => {
      this.slides(); // đọc để effect chạy lại khi mảng slide đổi
      this.activeIndex.set(0);
      this.restartAutoRotate();
    });
    this.destroyRef.onDestroy(() => this.stopAutoRotate());
  }

  private stopAutoRotate(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Gọi lại sau MỌI lần đổi slide — dù tự động hay do người dùng bấm — để
   * lần auto-advance kế tiếp luôn cách đúng AUTO_ROTATE_MS kể từ lần đổi
   * gần nhất. Không gọi lại thì bấm tay không "reset" được đồng hồ đếm
   * ngầm, dễ bị tự động nhảy slide ngay sau khi vừa bấm tay.
   */
  private restartAutoRotate(): void {
    this.stopAutoRotate();
    if (this.slides().length > 1) {
      this.timer = setInterval(() => this.next(), AUTO_ROTATE_MS);
    }
  }

  next(): void {
    const count = this.slides().length;
    this.activeIndex.set((this.activeIndex() + 1) % count);
    this.restartAutoRotate();
  }

  previous(): void {
    const count = this.slides().length;
    this.activeIndex.set((this.activeIndex() - 1 + count) % count);
    this.restartAutoRotate();
  }

  goTo(index: number): void {
    this.activeIndex.set(index);
    this.restartAutoRotate();
  }
}
