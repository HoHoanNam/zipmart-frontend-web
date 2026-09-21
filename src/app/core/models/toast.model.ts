export type ToastVariant = 'cart' | 'wishlist';

export interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
}
