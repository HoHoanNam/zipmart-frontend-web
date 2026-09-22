/**
 * Decorative imagery for the Home category grid (see
 * docs/PROJECT-CATALOG-UI-REVIEW-EXPANSION.md Phần 2.2). `Category` has no
 * image field on the backend and it's not worth adding one just for this
 * grid, so the slug -> image mapping lives here instead. Keyed by
 * `Category.slug` (see `CategorySlug` in zipmart-backend-nest's
 * `category.entity.ts`: electronics/apparel/household/food).
 */
export const CATEGORY_IMAGE_MAP: Record<string, string> = {
  electronics:
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  apparel:
    'https://plus.unsplash.com/premium_photo-1664202526559-e21e9c0fb46a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  household:
    'https://images.unsplash.com/photo-1604762433261-a046add6fc11?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  food: 'https://plus.unsplash.com/premium_photo-1733317290607-6479869d275c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
};

/** Fallback for any category slug not in the map above (e.g. a new one added later). */
export const DEFAULT_CATEGORY_IMAGE =
  'https://plus.unsplash.com/premium_photo-1681488262364-8aeb1b6aac56?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
