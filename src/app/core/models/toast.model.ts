export type ToastVariant = 'cart' | 'wishlist' | 'profile';

export interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
}
