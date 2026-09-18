import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Product, ProductPage } from '../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);

  findAll(params: { search?: string; page?: number; limit?: number } = {}): Promise<ProductPage> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));

    return firstValueFrom(
      this.http.get<ProductPage>(`${environment.apiUrl}/products?${query.toString()}`),
    );
  }

  findOne(id: string): Promise<Product> {
    return firstValueFrom(this.http.get<Product>(`${environment.apiUrl}/products/${id}`));
  }
}
