import type { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell-simple/shell-simple').then((m) => m.ShellSimple),
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
        path: 'wishlist',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/wishlist/wishlist-page').then((m) => m.WishlistPage),
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/orders/checkout/checkout').then((m) => m.Checkout),
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
    ],
  },
  { path: '**', redirectTo: '' },
];
