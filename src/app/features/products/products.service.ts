import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Product, ProductPage, ProductSort } from '../../core/models/product.model';

export interface FindProductsParams {
  search?: string;
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);

  findAll(params: FindProductsParams = {}): Promise<ProductPage> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.brand) query.set('brand', params.brand);
    if (params.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
    if (params.sort) query.set('sort', params.sort);
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));

    return firstValueFrom(
      this.http.get<ProductPage>(`${environment.apiUrl}/products?${query.toString()}`),
    );
  }

  findBrands(categoryId?: string): Promise<string[]> {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return firstValueFrom(this.http.get<string[]>(`${environment.apiUrl}/products/brands${query}`));
  }

  findOne(id: string): Promise<Product> {
    return firstValueFrom(this.http.get<Product>(`${environment.apiUrl}/products/${id}`));
  }
}
