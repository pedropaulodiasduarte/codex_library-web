import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LibraryApiService } from '../../core/services/library-api.service';
import { A11yAnnouncerService } from '../../core/services/a11y-announcer.service';
import { Book, Loan, LoanRequest, Member } from '../../core/models/library.models';
import { cpfValidator, formatCpf, isbnValidator } from '../../core/validators/document.validators';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section aria-labelledby="loans-heading" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 id="loans-heading" class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Gerenciamento de Empréstimos e Devoluções
          </h1>
          <p class="mt-1 text-base text-slate-700">
            Registre novos empréstimos, aprove entregas de livros e prorrogue prazos de devolução.
          </p>
        </div>
        <button
          type="button"
          (click)="abrirModalNovoEmprestimo()"
          class="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-800 text-white font-bold hover:bg-blue-900 transition shadow-sm"
          aria-haspopup="dialog">
          <span aria-hidden="true">+</span>
          <span>Novo Empréstimo</span>
        </button>
      </div>

      <!-- Filtros de Status e Pesquisa (equivalente aos botões Ativos, Atrasados, Devolvidos e busca do legado) -->
      <div class="a11y-card p-5 rounded-xl bg-white border-2 border-slate-300 shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div role="group" aria-label="Filtrar empréstimos por status" class="flex flex-wrap gap-2">
            @for (filtro of statusOptions; track filtro) {
              <button
                type="button"
                (click)="selecionarFiltroStatus(filtro)"
                [attr.aria-pressed]="activeStatusFilter() === filtro"
                class="px-4 py-2 rounded-lg text-sm font-bold border-2 transition"
                [ngClass]="activeStatusFilter() === filtro
                  ? 'bg-blue-800 text-white border-blue-900 shadow-sm'
                  : 'bg-slate-100 text-slate-900 border-slate-400 hover:bg-slate-200'">
                {{ filtro }}
              </button>
            }
          </div>

          <form role="search" aria-label="Buscar empréstimos" (ngSubmit)="pesquisar()" class="flex flex-1 min-w-[260px] gap-2">
            <label for="search-loans-input" class="sr-only">Buscar por nome do leitor, título do livro ou ISBN</label>
            <input
              id="search-loans-input"
              type="search"
              [formControl]="searchControl"
              placeholder="Buscar por leitor, livro, CPF ou ISBN..."
              class="flex-1 px-4 py-2 rounded-lg border-2 border-slate-400 text-slate-900" />
            <button
              type="submit"
              class="btn-primary px-4 py-2 rounded-lg bg-blue-800 text-white font-bold hover:bg-blue-900">
              Buscar
            </button>
          </form>
        </div>
      </div>

      <!-- Modal Cadastrar Novo Empréstimo (equivalente a cadastraremprestimo-view.fxml) -->
      @if (showNewLoanModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="loan-modal-title"
          aria-describedby="loan-modal-desc">
          <div class="modal-box a11y-card w-full max-w-2xl rounded-2xl bg-white border-2 border-slate-800 shadow-2xl p-6 sm:p-8 my-8">
            <div class="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 id="loan-modal-title" class="text-2xl font-extrabold text-slate-900">
                  Cadastrar Novo Empréstimo
                </h2>
                <p id="loan-modal-desc" class="text-sm text-slate-700 mt-1">
                  A data prevista de devolução é calculada automaticamente para +10 dias a partir da data do empréstimo.
                </p>
              </div>
              <button
                type="button"
                (click)="fecharModal()"
                aria-label="Fechar janela de novo empréstimo"
                class="px-3 py-1.5 rounded-lg border-2 border-slate-600 text-slate-900 font-bold hover:bg-slate-100">
                ✕ Fechar
              </button>
            </div>

            <form [formGroup]="loanForm" (ngSubmit)="registrarEmprestimo()" class="mt-6 space-y-5" novalidate>
              <!-- Seleção rápida ou digitação do ISBN -->
              <div>
                <label for="loan-isbn" class="block text-sm font-bold text-slate-900 mb-1">
                  Código ISBN do Livro <span aria-hidden="true" class="text-red-700">*</span>
                </label>
                <input
                  id="loan-isbn"
                  type="text"
                  list="datalist-books-isbn"
                  formControlName="isbnCodigo"
                  required
                  aria-required="true"
                  [attr.aria-invalid]="isFieldInvalid('isbnCodigo')"
                  aria-describedby="hint-loan-isbn err-loan-isbn"
                  placeholder="Digite o ISBN ou selecione um livro disponível da lista"
                  class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900 font-mono" />
                <datalist id="datalist-books-isbn">
                  @for (b of availableBooks(); track b.id) {
                    <option [value]="b.isbnCodigo">{{ b.titulo }} ({{ b.copiasDisponiveis }} disp.)</option>
                  }
                </datalist>
                <p id="hint-loan-isbn" class="mt-1 text-xs text-slate-600">
                  Você pode digitar o ISBN diretamente ou escolher pelo título no autocompletar.
                </p>
                @if (isFieldInvalid('isbnCodigo')) {
                  <p id="err-loan-isbn" role="alert" class="mt-1 text-sm font-semibold text-red-700">
                    {{ loanForm.get('isbnCodigo')?.errors?.['invalidIsbn'] || 'O campo do código ISBN é obrigatório.' }}
                  </p>
                }
              </div>

              <!-- Seleção rápida ou digitação do CPF do Leitor -->
              <div>
                <label for="loan-cpf" class="block text-sm font-bold text-slate-900 mb-1">
                  CPF do Leitor / Cliente <span aria-hidden="true" class="text-red-700">*</span>
                </label>
                <input
                  id="loan-cpf"
                  type="text"
                  list="datalist-members-cpf"
                  formControlName="cpfLeitor"
                  required
                  aria-required="true"
                  [attr.aria-invalid]="isFieldInvalid('cpfLeitor')"
                  aria-describedby="hint-loan-cpf err-loan-cpf"
                  placeholder="Ex: 52998224725"
                  class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900 font-mono" />
                <datalist id="datalist-members-cpf">
                  @for (m of availableMembers(); track m.id) {
                    <option [value]="m.cpf">{{ m.nome }} (CPF: {{ formatarCpf(m.cpf) }})</option>
                  }
                </datalist>
                <p id="hint-loan-cpf" class="mt-1 text-xs text-slate-600">
                  Informe os 11 dígitos do CPF do leitor cadastrado.
                </p>
                @if (isFieldInvalid('cpfLeitor')) {
                  <p id="err-loan-cpf" role="alert" class="mt-1 text-sm font-semibold text-red-700">
                    {{ loanForm.get('cpfLeitor')?.errors?.['invalidCpf'] || 'O campo CPF do Leitor é obrigatório.' }}
                  </p>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label for="loan-data-emp" class="block text-sm font-bold text-slate-900 mb-1">
                    Data do Empréstimo <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <input
                    id="loan-data-emp"
                    type="date"
                    formControlName="dataEmprestimo"
                    (change)="recalcularDevolucaoPadrao()"
                    required
                    aria-required="true"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
                </div>

                <div>
                  <label for="loan-data-dev" class="block text-sm font-bold text-slate-900 mb-1">
                    Data Prevista de Devolução <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <input
                    id="loan-data-dev"
                    type="date"
                    formControlName="dataDevolucao"
                    required
                    aria-required="true"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
                </div>
              </div>

              <div class="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  (click)="fecharModal()"
                  class="px-5 py-2.5 rounded-lg border-2 border-slate-600 bg-white text-slate-900 font-bold hover:bg-slate-100">
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="submitting()"
                  class="btn-primary px-6 py-2.5 rounded-lg bg-blue-800 text-white font-bold hover:bg-blue-900 disabled:opacity-50">
                  {{ submitting() ? 'Registrando...' : '+ Adicionar Empréstimo' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Tabela de Empréstimos (equivalente a tbEmprestimo em gerenciaremprestimo-view.fxml) -->
      <div class="a11y-card rounded-xl bg-white border-2 border-slate-300 overflow-hidden shadow-sm">
        <div class="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900">
            Registros de Empréstimos ({{ loans().length }}) — Filtro atual: {{ activeStatusFilter() }}
          </h2>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-300 text-left">
            <caption class="sr-only">
              Tabela de empréstimos contendo ID, título do livro, nome do leitor, data de empréstimo, data de devolução, status e botões de devolução ou renovação.
            </caption>
            <thead class="bg-slate-100">
              <tr>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">ID</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Título do Livro</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Nome do Leitor</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Data Empréstimo</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Data Devolução</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Status</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              @for (loan of loans(); track loan.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-4 text-sm font-mono font-bold text-slate-900">#{{ loan.id }}</td>
                  <th scope="row" class="px-4 py-4 text-sm font-bold text-slate-900">
                    <div>{{ loan.tituloLivro }}</div>
                    <div class="text-xs font-mono font-normal text-slate-600">ISBN: {{ loan.isbnCodigo }}</div>
                  </th>
                  <td class="px-4 py-4 text-sm text-slate-800">
                    <div class="font-semibold">{{ loan.nomeLeitor }}</div>
                    <div class="text-xs font-mono text-slate-600">CPF: {{ formatarCpf(loan.cpfLeitor) }}</div>
                  </td>
                  <td class="px-4 py-4 text-sm text-slate-800">{{ loan.dataEmprestimo | date:'dd/MM/yyyy' }}</td>
                  <td class="px-4 py-4 text-sm text-slate-800 font-semibold">{{ loan.dataDevolucao | date:'dd/MM/yyyy' }}</td>
                  <td class="px-4 py-4 text-sm">
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
                  <td class="px-4 py-4 text-sm">
                    @if (loan.status !== 'Devolvido') {
                      <div class="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          (click)="aprovarEntrega(loan)"
                          [attr.aria-label]="'Aprovar entrega do livro ' + loan.tituloLivro + ' emprestado para ' + loan.nomeLeitor"
                          class="px-3 py-1.5 rounded-lg border-2 border-emerald-800 bg-emerald-50 text-emerald-950 font-bold hover:bg-emerald-100 transition text-xs">
                          ✓ Aprovar Entrega
                        </button>
                        <button
                          type="button"
                          (click)="adicionarTempoExtra(loan)"
                          [attr.aria-label]="'Adicionar 5 dias de prazo no empréstimo do livro ' + loan.tituloLivro + ' para ' + loan.nomeLeitor"
                          class="px-3 py-1.5 rounded-lg border-2 border-amber-800 bg-amber-50 text-amber-950 font-bold hover:bg-amber-100 transition text-xs">
                          +5 Dias
                        </button>
                      </div>
                    } @else {
                      <span class="text-xs font-semibold text-slate-600">Devolução concluída</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-6 py-10 text-center text-base text-slate-700">
                    Nenhum empréstimo encontrado para o filtro selecionado.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `
})
export class LoansComponent implements OnInit {
  private readonly api = inject(LibraryApiService);
  private readonly a11y = inject(A11yAnnouncerService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly loans = signal<Loan[]>([]);
  readonly availableBooks = signal<Book[]>([]);
  readonly availableMembers = signal<Member[]>([]);
  readonly activeStatusFilter = signal<string>('Todos');
  readonly showNewLoanModal = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);

  readonly statusOptions = ['Todos', 'Ativo', 'Atrasado', 'Devolvido'];
  readonly searchControl = this.fb.nonNullable.control('');

  readonly loanForm = this.fb.nonNullable.group({
    isbnCodigo: ['', [Validators.required, isbnValidator()]],
    cpfLeitor: ['', [Validators.required, cpfValidator()]],
    dataEmprestimo: [this.hojeIso(), [Validators.required]],
    dataDevolucao: [this.adicionarDiasIso(this.hojeIso(), 10), [Validators.required]]
  });

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showNewLoanModal()) {
      this.fecharModal();
    }
  }

  ngOnInit(): void {
    this.carregarEmprestimos();
    this.route.queryParams.subscribe((params) => {
      if (params['novo'] === 'true') {
        this.abrirModalNovoEmprestimo();
      }
    });
  }

  formatarCpf(cpf: string): string {
    return formatCpf(cpf);
  }

  carregarEmprestimos(): void {
    this.api.getLoans(this.activeStatusFilter(), this.searchControl.value).subscribe({
      next: (lista) => {
        this.loans.set(lista);
        this.a11y.announcePolite(`Lista de empréstimos atualizada: ${lista.length} registros.`);
      },
      error: (err) => {
        this.a11y.notifyError('Erro ao carregar empréstimos', err?.error?.message || 'Falha na comunicação com o servidor.');
      }
    });
  }

  selecionarFiltroStatus(status: string): void {
    this.activeStatusFilter.set(status);
    this.carregarEmprestimos();
  }

  pesquisar(): void {
    this.carregarEmprestimos();
  }

  abrirModalNovoEmprestimo(): void {
    const hoje = this.hojeIso();
    this.loanForm.reset({
      isbnCodigo: '',
      cpfLeitor: '',
      dataEmprestimo: hoje,
      dataDevolucao: this.adicionarDiasIso(hoje, 10)
    });
    this.api.getBooks().subscribe((b) => this.availableBooks.set(b.filter((x) => x.copiasDisponiveis > 0)));
    this.api.getMembers().subscribe((m) => this.availableMembers.set(m));
    this.showNewLoanModal.set(true);
    this.a11y.announcePolite('Janela para cadastrar novo empréstimo aberta.');
  }

  fecharModal(): void {
    this.showNewLoanModal.set(false);
  }

  recalcularDevolucaoPadrao(): void {
    const dataEmp = this.loanForm.controls.dataEmprestimo.value;
    if (dataEmp) {
      this.loanForm.controls.dataDevolucao.setValue(this.adicionarDiasIso(dataEmp, 10));
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.loanForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  registrarEmprestimo(): void {
    if (this.loanForm.invalid) {
      this.loanForm.markAllAsTouched();
      this.a11y.notifyError('Dados inválidos', 'Verifique o ISBN, o CPF do leitor e as datas informadas.');
      return;
    }

    const raw = this.loanForm.getRawValue();
    if (raw.dataDevolucao < raw.dataEmprestimo) {
      this.a11y.notifyError('Dado Inválido', 'A Data de Devolução não pode ser anterior à Data de Empréstimo.');
      return;
    }

    this.submitting.set(true);
    const payload: LoanRequest = raw;

    this.api.createLoan(payload).subscribe({
      next: (criado) => {
        this.submitting.set(false);
        this.fecharModal();
        this.a11y.notifySuccess(
          'Sucesso',
          `Empréstimo #${criado.id} do livro "${criado.tituloLivro}" registrado com sucesso para ${criado.nomeLeitor}.`
        );
        this.carregarEmprestimos();
      },
      error: (err) => {
        this.submitting.set(false);
        this.a11y.notifyError(
          'Não foi possível registrar o empréstimo',
          err?.error?.message || 'Verifique se o ISBN e o CPF estão cadastrados no sistema.'
        );
      }
    });
  }

  aprovarEntrega(loan: Loan): void {
    this.api.returnLoan(loan.id).subscribe({
      next: () => {
        this.a11y.notifySuccess(
          'Devolução aprovada',
          `A entrega do livro "${loan.tituloLivro}" por ${loan.nomeLeitor} foi registrada com sucesso.`
        );
        this.carregarEmprestimos();
      },
      error: (err) => {
        this.a11y.notifyError('Erro ao aprovar entrega', err?.error?.message || 'Não foi possível concluir a devolução.');
      }
    });
  }

  adicionarTempoExtra(loan: Loan): void {
    this.api.extendLoan(loan.id, 5).subscribe({
      next: (atualizado) => {
        this.a11y.notifySuccess(
          'Prazo prorrogado',
          `Empréstimo #${atualizado.id} renovado por +5 dias (nova devolução: ${atualizado.dataDevolucao}).`
        );
        this.carregarEmprestimos();
      },
      error: (err) => {
        this.a11y.notifyError('Erro ao prorrogar prazo', err?.error?.message || 'Não foi possível adicionar tempo ao empréstimo.');
      }
    });
  }

  private hojeIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private adicionarDiasIso(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
}

