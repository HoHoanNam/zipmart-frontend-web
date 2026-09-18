import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { RecommendationResult } from '../../core/models/recommendation.model';

@Injectable({ providedIn: 'root' })
export class RecService {
  private readonly http = inject(HttpClient);

  getRecommendations(limit = 10): Promise<RecommendationResult> {
    return firstValueFrom(
      this.http.get<RecommendationResult>(
        `${environment.apiUrl}/recommendations?limit=${limit}`,
      ),
    );
  }
}
