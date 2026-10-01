import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PushService } from './features/notifications/push.service';
import { LANGUAGE_STORAGE_KEY } from './shared/components/language-switcher/language-switcher';
import { ToastContainer } from './shared/toast/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly translate = inject(TranslateService);
  // Injected only to activate its constructor (auth-state effect that
  // subscribes/unsubscribes push registration) as early as possible —
  // PushService itself has no template footprint.
  private readonly pushService = inject(PushService);

  constructor() {
    // Restore the user's chosen language (set by LanguageSwitcher) as early
    // as possible — root component, runs once at bootstrap. `vi` is already
    // the provideTranslateService default, so only switch away from it.
    const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLang && storedLang !== 'vi') {
      this.translate.use(storedLang);
    }
  }
}
