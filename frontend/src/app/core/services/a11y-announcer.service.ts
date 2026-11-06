import { Injectable, signal } from '@angular/core';

export interface NotificationBanner {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class A11yAnnouncerService {
  readonly politeMessage = signal<string>('');
  readonly assertiveMessage = signal<string>('');
  readonly activeBanner = signal<NotificationBanner | null>(null);
  readonly highContrast = signal<boolean>(false);
  readonly largeFont = signal<boolean>(false);

  announcePolite(message: string): void {
    this.politeMessage.set('');
    setTimeout(() => this.politeMessage.set(message), 50);
  }

  announceAssertive(message: string): void {
    this.assertiveMessage.set('');
    setTimeout(() => this.assertiveMessage.set(message), 50);
  }

  notifySuccess(title: string, message: string): void {
    this.activeBanner.set({ type: 'success', title, message });
    this.announcePolite(`${title}: ${message}`);
  }

  notifyError(title: string, message: string): void {
    this.activeBanner.set({ type: 'error', title, message });
    this.announceAssertive(`Atenção - ${title}: ${message}`);
  }

  clearBanner(): void {
    this.activeBanner.set(null);
  }

  toggleHighContrast(): void {
    const next = !this.highContrast();
    this.highContrast.set(next);
    if (next) {
      document.body.classList.add('high-contrast');
      this.announcePolite('Modo de alto contraste ativado.');
    } else {
      document.body.classList.remove('high-contrast');
      this.announcePolite('Modo de alto contraste desativado.');
    }
  }

  toggleLargeFont(): void {
    const next = !this.largeFont();
    this.largeFont.set(next);
    document.documentElement.style.fontSize = next ? '115%' : '100%';
    this.announcePolite(next ? 'Fonte ampliada ativada.' : 'Fonte padrão restaurada.');
  }
}

