import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
} from '../../core/models/address.model';

@Injectable({ providedIn: 'root' })
export class AddressesService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<Address[]> {
    return firstValueFrom(this.http.get<Address[]>(`${environment.apiUrl}/addresses`));
  }

  create(payload: CreateAddressPayload): Promise<Address> {
    return firstValueFrom(this.http.post<Address>(`${environment.apiUrl}/addresses`, payload));
  }

  update(id: string, payload: UpdateAddressPayload): Promise<Address> {
    return firstValueFrom(this.http.patch<Address>(`${environment.apiUrl}/addresses/${id}`, payload));
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/addresses/${id}`));
  }

  setDefault(id: string): Promise<Address> {
    return firstValueFrom(this.http.patch<Address>(`${environment.apiUrl}/addresses/${id}/default`, {}));
  }
}
