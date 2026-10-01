import { Component, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const LANGUAGE_STORAGE_KEY = 'zipmart_lang';

interface LanguageOption {
  code: 'vi' | 'en';
  label: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'vi', label: 'VI' },
  { code: 'en', label: 'EN' },
];

/** Small VI/EN toggle mounted in the navbar. Persists choice across sessions. */
@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.html',
})
export class LanguageSwitcher {
  private readonly translate = inject(TranslateService);

  readonly languages = LANGUAGES;
  readonly currentLang = signal(this.translate.getCurrentLang() ?? 'vi');

  select(code: string): void {
    if (code === this.currentLang()) return;
    this.translate.use(code);
    this.currentLang.set(code);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  }
}
