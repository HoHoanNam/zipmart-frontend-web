import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CreateReturnPayload, ReturnRequest } from '../../core/models/return.model';

/** A.5 — return/refund requests, backed by Infra E (+ Infra D for the actual refund). */
@Injectable({ providedIn: 'root' })
export class ReturnsService {
  private readonly http = inject(HttpClient);

  findMine(): Promise<ReturnRequest[]> {
    return firstValueFrom(this.http.get<ReturnRequest[]>(`${environment.apiUrl}/returns/mine`));
  }

  create(payload: CreateReturnPayload): Promise<ReturnRequest> {
    return firstValueFrom(this.http.post<ReturnRequest>(`${environment.apiUrl}/returns`, payload));
  }
}
