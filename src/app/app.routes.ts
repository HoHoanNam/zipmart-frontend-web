import type { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell-simple/shell-simple').then((m) => m.ShellSimple),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/list/products-list').then((m) => m.ProductsList),
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./features/products/detail/product-detail').then((m) => m.ProductDetail),
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () => import('./features/cart/cart-page').then((m) => m.CartPage),
      },
      {
        path: 'compare',
        loadComponent: () => import('./features/compare/compare-page').then((m) => m.ComparePage),
      },
      {
        path: 'wishlist',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/wishlist/wishlist-page').then((m) => m.WishlistPage),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./features/profile/profile-page').then((m) => m.ProfilePage),
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () => import('./features/orders/checkout/checkout').then((m) => m.Checkout),
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/orders/history/order-history').then((m) => m.OrderHistory),
      },
      {
        path: 'orders/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/orders/detail/order-detail').then((m) => m.OrderDetail),
      },
      {
        path: 'faq',
        loadComponent: () => import('./features/static-pages/faq-page').then((m) => m.FaqPage),
      },
      {
        path: 'terms',
        data: { page: 'terms' },
        loadComponent: () => import('./features/static-pages/static-page').then((m) => m.StaticPage),
      },
      {
        path: 'privacy',
        data: { page: 'privacy' },
        loadComponent: () => import('./features/static-pages/static-page').then((m) => m.StaticPage),
      },
      {
        path: 'return-policy',
        data: { page: 'return-policy' },
        loadComponent: () => import('./features/static-pages/static-page').then((m) => m.StaticPage),
      },
      {
        path: 'shipping-guide',
        data: { page: 'shipping-guide' },
        loadComponent: () => import('./features/static-pages/static-page').then((m) => m.StaticPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
