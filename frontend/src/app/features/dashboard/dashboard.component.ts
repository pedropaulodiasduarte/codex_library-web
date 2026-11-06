import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LibraryApiService } from '../../core/services/library-api.service';
import { A11yAnnouncerService } from '../../core/services/a11y-announcer.service';
import { DashboardStats } from '../../core/models/library.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section aria-labelledby="dashboard-heading" class="space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 id="dashboard-heading" class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Painel Inicial — Controle de Biblioteca
          </h1>
          <p class="mt-1 text-base text-slate-700">
            Visão geral em tempo real do acervo, leitores e movimentações de empréstimos.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            (click)="carregarIndicadores()"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-slate-700 bg-white text-slate-900 font-semibold hover:bg-slate-100 transition"
            aria-label="Atualizar indicadores do painel inicial">
            <span aria-hidden="true">↻</span>
            <span>Atualizar Dados</span>
          </button>
          <a
            routerLink="/loans"
            [queryParams]="{ novo: 'true' }"
            class="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-800 text-white font-bold hover:bg-blue-900 transition shadow-sm">
            <span aria-hidden="true">+</span>
            <span>Novo Empréstimo</span>
          </a>
        </div>
      </div>

      <!-- Estado de Carregamento Acessível -->
      @if (loading()) {
        <div role="status" aria-live="polite" class="a11y-card p-8 rounded-xl bg-white border border-slate-300 text-center">
          <p class="text-lg font-semibold text-slate-800">Carregando indicadores da biblioteca, aguarde...</p>
        </div>
      }

      @if (!loading() && stats(); as s) {
        <!-- Grade de Cartões de Indicadores (KPIs do Menu Inicial legado + novos módulos) -->
        <section aria-label="Resumo quantitativo do sistema" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <article class="a11y-card p-6 rounded-xl bg-white border-2 border-slate-300 shadow-sm flex flex-col justify-between">
            <div>
              <h2 class="text-sm font-bold uppercase tracking-wider text-slate-700">Total de Exemplares</h2>
              <p class="mt-2 text-3xl font-extrabold text-slate-900">{{ s.totalExemplares }}</p>
            </div>
            <p class="mt-3 text-sm text-slate-700">
              Distribuídos em <strong>{{ s.totalTitulos }}</strong> títulos e <strong>{{ s.totalAutores }}</strong> autores.
            </p>
          </article>

          <article class="a11y-card p-6 rounded-xl bg-white border-2 border-emerald-700 shadow-sm flex flex-col justify-between">
            <div>
              <h2 class="text-sm font-bold uppercase tracking-wider text-emerald-900">Exemplares Disponíveis</h2>
              <p class="mt-2 text-3xl font-extrabold text-emerald-900">{{ s.exemplaresDisponiveis }}</p>
            </div>
            <p class="mt-3 text-sm text-slate-700">
              Prontos para retirada imediata no acervo.
            </p>
          </article>

          <article class="a11y-card p-6 rounded-xl bg-white border-2 border-blue-700 shadow-sm flex flex-col justify-between">
            <div>
              <h2 class="text-sm font-bold uppercase tracking-wider text-blue-900">Empréstimos Ativos</h2>
              <p class="mt-2 text-3xl font-extrabold text-blue-900">{{ s.emprestimosAtivos }}</p>
            </div>
            <p class="mt-3 text-sm text-slate-700">
              <strong>{{ s.emprestimosDevolvidos }}</strong> devoluções concluídas no histórico.
            </p>
          </article>

          <article class="a11y-card p-6 rounded-xl bg-white border-2 border-red-700 shadow-sm flex flex-col justify-between">
            <div>
              <h2 class="text-sm font-bold uppercase tracking-wider text-red-900">Empréstimos Atrasados</h2>
              <p class="mt-2 text-3xl font-extrabold text-red-900">{{ s.emprestimosAtrasados }}</p>
            </div>
            <p class="mt-3 text-sm text-slate-700">
              Leitores cadastrados: <strong>{{ s.totalLeitores }}</strong>
            </p>
          </article>
        </section>

        <!-- Acesso Rápido por Módulos do Monolito Modular -->
        <section aria-labelledby="quick-nav-heading" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <h2 id="quick-nav-heading" class="sr-only">Atalhos para os módulos do sistema</h2>

          <a routerLink="/books" class="a11y-card group p-5 rounded-xl bg-white border-2 border-slate-300 hover:border-blue-800 transition flex flex-col justify-between">
            <div>
              <span class="inline-block px-2.5 py-1 text-xs font-bold uppercase bg-blue-100 text-blue-900 rounded">Módulo Books</span>
              <h3 class="mt-3 text-lg font-bold text-slate-900 group-hover:text-blue-800">Gerenciar Acervo</h3>
              <p class="mt-1 text-sm text-slate-700">Consulte, cadastre e atualize livros, ISBN e localizações físicas.</p>
            </div>
            <span class="mt-4 text-sm font-bold text-blue-800 underline">Acessar Acervo →</span>
          </a>

          <a routerLink="/loans" class="a11y-card group p-5 rounded-xl bg-white border-2 border-slate-300 hover:border-blue-800 transition flex flex-col justify-between">
            <div>
              <span class="inline-block px-2.5 py-1 text-xs font-bold uppercase bg-amber-100 text-amber-900 rounded">Módulo Loans</span>
              <h3 class="mt-3 text-lg font-bold text-slate-900 group-hover:text-blue-800">Empréstimos e Devoluções</h3>
              <p class="mt-1 text-sm text-slate-700">Registre saídas, aprove entregas e prorrogue prazos (+5 dias).</p>
            </div>
            <span class="mt-4 text-sm font-bold text-blue-800 underline">Gerenciar Empréstimos →</span>
          </a>

          <a routerLink="/members" class="a11y-card group p-5 rounded-xl bg-white border-2 border-slate-300 hover:border-blue-800 transition flex flex-col justify-between">
            <div>
              <span class="inline-block px-2.5 py-1 text-xs font-bold uppercase bg-emerald-100 text-emerald-900 rounded">Módulo Members</span>
              <h3 class="mt-3 text-lg font-bold text-slate-900 group-hover:text-blue-800">Leitores / Clientes</h3>
              <p class="mt-1 text-sm text-slate-700">Cadastre leitores com validação de CPF e consulte histórico individual.</p>
            </div>
            <span class="mt-4 text-sm font-bold text-blue-800 underline">Gerenciar Leitores →</span>
          </a>

          <a routerLink="/authors" class="a11y-card group p-5 rounded-xl bg-white border-2 border-slate-300 hover:border-blue-800 transition flex flex-col justify-between">
            <div>
              <span class="inline-block px-2.5 py-1 text-xs font-bold uppercase bg-purple-100 text-purple-900 rounded">Módulo Authors</span>
              <h3 class="mt-3 text-lg font-bold text-slate-900 group-hover:text-blue-800">Autores Literários</h3>
              <p class="mt-1 text-sm text-slate-700">Explore os autores catalogados e a contagem de obras no acervo.</p>
            </div>
            <span class="mt-4 text-sm font-bold text-blue-800 underline">Gerenciar Autores →</span>
          </a>
        </section>

        <!-- Tabela Semântica de Movimentações Recentes -->
        <section aria-labelledby="recent-loans-heading" class="a11y-card rounded-xl bg-white border-2 border-slate-300 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 id="recent-loans-heading" class="text-xl font-bold text-slate-900">
                Movimentações Recentes de Empréstimos
              </h2>
              <p class="text-sm text-slate-700">Últimos registros de empréstimo e devolução no sistema</p>
            </div>
            <a routerLink="/loans" class="text-sm font-bold text-blue-800 hover:underline">
              Ver todos os empréstimos
            </a>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-300 text-left">
              <caption class="sr-only">
                Lista dos empréstimos mais recentes contendo código, livro, leitor, datas e status.
              </caption>
              <thead class="bg-slate-100">
                <tr>
                  <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">ID</th>
                  <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Livro</th>
                  <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Leitor</th>
                  <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Data Empréstimo</th>
                  <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Devolução Prevista</th>
                  <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white">
                @for (loan of s.emprestimosRecentes; track loan.id) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-4 py-3.5 text-sm font-mono font-bold text-slate-900">#{{ loan.id }}</td>
                    <td class="px-4 py-3.5 text-sm font-semibold text-slate-900">{{ loan.tituloLivro }}</td>
                    <td class="px-4 py-3.5 text-sm text-slate-800">{{ loan.nomeLeitor }}</td>
                    <td class="px-4 py-3.5 text-sm text-slate-800">{{ loan.dataEmprestimo | date:'dd/MM/yyyy' }}</td>
                    <td class="px-4 py-3.5 text-sm text-slate-800">{{ loan.dataDevolucao | date:'dd/MM/yyyy' }}</td>
                    <td class="px-4 py-3.5 text-sm">
                      <span
                        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
                        [ngClass]="{
                          'bg-blue-100 text-blue-900 border-blue-800': loan.status === 'Ativo',
                          'bg-red-100 text-red-900 border-red-800': loan.status === 'Atrasado',
                          'bg-emerald-100 text-emerald-900 border-emerald-800': loan.status === 'Devolvido'
                        }">
                        {{ loan.status }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-base text-slate-700">
                      Nenhum empréstimo registrado até o momento.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </section>
  `
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(LibraryApiService);
  private readonly a11y = inject(A11yAnnouncerService);

  readonly stats = signal<DashboardStats | null>(null);
  readonly loading = signal<boolean>(true);

  ngOnInit(): void {
    this.carregarIndicadores();
  }

  carregarIndicadores(): void {
    this.loading.set(true);
    this.api.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
        this.a11y.announcePolite(
          `Painel inicial carregado: ${data.totalExemplares} exemplares, ${data.exemplaresDisponiveis} disponíveis, ${data.emprestimosAtivos} empréstimos ativos e ${data.emprestimosAtrasados} atrasados.`
        );
      },
      error: () => {
        this.loading.set(false);
        this.a11y.notifyError(
          'Falha de comunicação',
          'Não foi possível carregar os indicadores do servidor Spring Boot (verifique se a API está ativa na porta 8080).'
        );
      }
    });
  }
}

