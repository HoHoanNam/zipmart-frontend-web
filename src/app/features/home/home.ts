import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { RecWidget } from '../recommendations/rec-widget/rec-widget';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RecWidget],
  templateUrl: './home.html',
})
export class Home {
  readonly authService = inject(AuthService);
}
