import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Banner } from '../../core/models/banner.model';

@Injectable({ providedIn: 'root' })
export class BannersService {
  private readonly http = inject(HttpClient);

  findActive(): Promise<Banner[]> {
    return firstValueFrom(this.http.get<Banner[]>(`${environment.apiUrl}/banners`));
  }
}
