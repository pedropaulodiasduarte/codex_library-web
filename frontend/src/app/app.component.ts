import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { A11yAnnouncerService } from './core/services/a11y-announcer.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Skip Link para Navegação por Teclado (WCAG 2.4.1 Bypass Blocks) -->
    <a href="#main-content" class="sr-only sr-only-focusable">
      Pular para o conteúdo principal
    </a>

    <!-- Regiões Live Ocultas para Leitores de Tela (NVDA, VoiceOver, JAWS) -->
    <div class="sr-only" aria-live="polite" aria-atomic="true">
      {{ a11y.politeMessage() }}
    </div>
    <div class="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
      {{ a11y.assertiveMessage() }}
    </div>

    <div class="min-h-screen flex flex-col">
      <!-- Cabeçalho Semântico e Barra de Ferramentas de Acessibilidade -->
      <header role="banner" class="bg-white border-b-2 border-slate-300 sticky top-0 z-40 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-wrap items-center justify-between py-3.5 gap-4">
            <!-- Identidade da Marca -->
            <a
              routerLink="/dashboard"
              class="flex items-center gap-3 text-slate-900 hover:opacity-90"
              aria-label="Codex — Ir para o Painel Inicial de Controle de Biblioteca">
              <div
                aria-hidden="true"
                class="w-11 h-11 rounded-xl bg-blue-800 text-white flex items-center justify-center font-extrabold text-xl shadow-sm">
                CX
              </div>
              <div>
                <span class="block text-xl font-extrabold tracking-tight leading-none">CODEX WEB</span>
                <span class="block text-xs font-semibold text-slate-700 mt-0.5">
                  Controle de Estoque e Empréstimos de Biblioteca
                </span>
              </div>
            </a>

            <!-- Controles de Acessibilidade (Alto Contraste e Tamanho da Fonte) -->
            <div role="region" aria-label="Preferências de Acessibilidade Visual" class="flex items-center gap-2">
              <button
                type="button"
                (click)="a11y.toggleHighContrast()"
                [attr.aria-pressed]="a11y.highContrast()"
                class="px-3 py-1.5 rounded-lg border-2 border-slate-700 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 transition">
                <span aria-hidden="true">◐</span>
                {{ a11y.highContrast() ? 'Alto Contraste: Ativo' : 'Alto Contraste' }}
              </button>

              <button
                type="button"
                (click)="a11y.toggleLargeFont()"
                [attr.aria-pressed]="a11y.largeFont()"
                class="px-3 py-1.5 rounded-lg border-2 border-slate-700 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 transition">
                <span aria-hidden="true">A+</span>
                {{ a11y.largeFont() ? 'Fonte Ampliada: Ativa' : 'Ampliar Fonte' }}
              </button>
            </div>
          </div>

          <!-- Navegação Principal Semântica (substituindo a barra lateral de ícones do FXML por links acessíveis com texto visível) -->
          <nav aria-label="Menu Principal do Sistema" class="border-t border-slate-200 py-2">
            <ul class="flex flex-wrap items-center gap-1 sm:gap-2">
              <li>
                <a
                  routerLink="/dashboard"
                  routerLinkActive="bg-blue-800 text-white border-blue-900"
                  #rlaDash="routerLinkActive"
                  [attr.aria-current]="rlaDash.isActive ? 'page' : null"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border-2 border-transparent text-slate-800 hover:bg-slate-100 transition">
                  <span aria-hidden="true">🏠</span>
                  <span>Menu Inicial</span>
                </a>
              </li>
              <li>
                <a
                  routerLink="/books"
                  routerLinkActive="bg-blue-800 text-white border-blue-900"
                  #rlaBooks="routerLinkActive"
                  [attr.aria-current]="rlaBooks.isActive ? 'page' : null"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border-2 border-transparent text-slate-800 hover:bg-slate-100 transition">
                  <span aria-hidden="true">📚</span>
                  <span>Acervo de Livros</span>
                </a>
              </li>
              <li>
                <a
                  routerLink="/loans"
                  routerLinkActive="bg-blue-800 text-white border-blue-900"
                  #rlaLoans="routerLinkActive"
                  [attr.aria-current]="rlaLoans.isActive ? 'page' : null"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border-2 border-transparent text-slate-800 hover:bg-slate-100 transition">
                  <span aria-hidden="true">📋</span>
                  <span>Empréstimos</span>
                </a>
              </li>
              <li>
                <a
                  routerLink="/members"
                  routerLinkActive="bg-blue-800 text-white border-blue-900"
                  #rlaMembers="routerLinkActive"
                  [attr.aria-current]="rlaMembers.isActive ? 'page' : null"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border-2 border-transparent text-slate-800 hover:bg-slate-100 transition">
                  <span aria-hidden="true">👥</span>
                  <span>Leitores / Clientes</span>
                </a>
              </li>
              <li>
                <a
                  routerLink="/authors"
                  routerLinkActive="bg-blue-800 text-white border-blue-900"
                  #rlaAuthors="routerLinkActive"
                  [attr.aria-current]="rlaAuthors.isActive ? 'page' : null"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border-2 border-transparent text-slate-800 hover:bg-slate-100 transition">
                  <span aria-hidden="true">✒️</span>
                  <span>Autores</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <!-- Região de Notificações e Alertas Globais (Substituindo os Alert JavaFX do legado por banners acessíveis) -->
      @if (a11y.activeBanner(); as banner) {
        <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            [attr.role]="banner.type === 'error' ? 'alert' : 'status'"
            class="a11y-card p-4 rounded-xl border-2 flex items-start justify-between gap-4 shadow-sm"
            [ngClass]="{
              'bg-emerald-50 border-emerald-800 text-emerald-950': banner.type === 'success',
              'bg-red-50 border-red-800 text-red-950': banner.type === 'error',
              'bg-blue-50 border-blue-800 text-blue-950': banner.type === 'info'
            }">
            <div>
              <p class="font-extrabold text-base">{{ banner.title }}</p>
              <p class="text-sm mt-0.5">{{ banner.message }}</p>
            </div>
            <button
              type="button"
              (click)="a11y.clearBanner()"
              aria-label="Fechar mensagem de notificação"
              class="px-3 py-1 rounded-lg border border-current font-bold text-xs hover:opacity-80">
              Fechar ✕
            </button>
          </div>
        </div>
      }

      <!-- Conteúdo Principal Semântico -->
      <main id="main-content" role="main" tabindex="-1" class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-outlet></router-outlet>
      </main>

      <!-- Rodapé Semântico -->
      <footer role="contentinfo" class="bg-white border-t-2 border-slate-300 mt-auto py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-700">
          <p>
            <strong>Codex Web</strong> — Monolito Modular (Spring Boot 3 + Java 21 &amp; Angular Standalone).
          </p>
          <p>
            Desenvolvido em conformidade com <strong>WCAG 2.1 AA / AAA</strong> (Suporte a NVDA, VoiceOver, JAWS e navegação por teclado).
          </p>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {
  readonly a11y = inject(A11yAnnouncerService);
}

