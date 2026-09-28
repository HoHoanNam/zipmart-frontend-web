import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { StaticPageContent } from './static-page-content';
import { STATIC_PAGE_CONTENT } from './static-page-content';

/** One component for every plain prose policy page (terms/privacy/return-policy/shipping-guide) — content differs, shape doesn't. See `app.routes.ts` for the `data['page']` key each route supplies. A fresh instance is created per navigation since these are distinct routes, so reading the route snapshot once here (not reactively) is enough. */
@Component({
  selector: 'app-static-page',
  templateUrl: './static-page.html',
})
export class StaticPage {
  private readonly route = inject(ActivatedRoute);

  readonly content: StaticPageContent | null =
    STATIC_PAGE_CONTENT[this.route.snapshot.data['page'] as string] ?? null;
}
