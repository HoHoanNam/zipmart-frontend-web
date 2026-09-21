import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CouponApplyResult } from '../../core/models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponsService {
  private readonly http = inject(HttpClient);

  apply(code: string, subtotal: number): Promise<CouponApplyResult> {
    return firstValueFrom(
      this.http.post<CouponApplyResult>(`${environment.apiUrl}/coupons/apply`, { code, subtotal }),
    );
  }
}
