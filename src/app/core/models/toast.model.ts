export type ToastVariant = 'cart' | 'wishlist' | 'profile' | 'compare';

export interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
}
