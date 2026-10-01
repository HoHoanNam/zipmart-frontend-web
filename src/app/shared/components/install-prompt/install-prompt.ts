import { Component, signal } from '@angular/core';

/**
 * Minimal shape of the non-standard `BeforeInstallPromptEvent` — not in
 * lib.dom.d.ts, so we declare just the members this component uses.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_STORAGE_KEY = 'zipmart_install_prompt_dismissed';

/**
 * Floating "Cài đặt zipmart" banner driven by the browser's
 * `beforeinstallprompt` event (Chromium-based browsers only — Safari/Firefox
 * never fire it, so the banner simply never appears there, which is fine).
 * Dismissal is remembered in localStorage so it doesn't nag on every visit.
 */
@Component({
  selector: 'app-install-prompt',
  templateUrl: './install-prompt.html',
})
export class InstallPrompt {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  readonly visible = signal(false);

  constructor() {
    if (localStorage.getItem(DISMISSED_STORAGE_KEY) === '1') return;

    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.visible.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.visible.set(false);
      this.deferredPrompt = null;
    });
  }

  async install(): Promise<void> {
    const prompt = this.deferredPrompt;
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    this.deferredPrompt = null;
    this.visible.set(false);
  }

  dismiss(): void {
    this.visible.set(false);
    localStorage.setItem(DISMISSED_STORAGE_KEY, '1');
  }
}
