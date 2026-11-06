import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LibraryApiService } from '../../core/services/library-api.service';
import { A11yAnnouncerService } from '../../core/services/a11y-announcer.service';
import { Loan, Member, MemberRequest } from '../../core/models/library.models';
import { cpfValidator, formatCpf } from '../../core/validators/document.validators';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section aria-labelledby="members-heading" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 id="members-heading" class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Gerenciamento de Clientes e Leitores
          </h1>
          <p class="mt-1 text-base text-slate-700">
            Cadastre e gerencie os leitores da biblioteca, consulte o último status de empréstimo e histórico completo.
          </p>
        </div>
        <button
          type="button"
          (click)="abrirFormularioNovo()"
          class="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-800 text-white font-bold hover:bg-blue-900 transition shadow-sm"
          aria-haspopup="dialog">
          <span aria-hidden="true">+</span>
          <span>Novo Leitor</span>
        </button>
      </div>

      <!-- Barra de Pesquisa -->
      <form
        role="search"
        aria-label="Pesquisar leitores cadastrados"
        (ngSubmit)="pesquisar()"
        class="a11y-card p-5 rounded-xl bg-white border-2 border-slate-300 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div class="flex-1">
          <label for="search-members-input" class="block text-sm font-bold text-slate-900 mb-1">
            Buscar por nome, CPF ou e-mail do leitor
          </label>
          <input
            id="search-members-input"
            type="search"
            [formControl]="searchControl"
            placeholder="Ex: Ana Beatriz, 52998224725..."
            class="w-full px-4 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
        </div>
        <div class="flex gap-2">
          <button
            type="submit"
            class="btn-primary px-5 py-2.5 rounded-lg bg-blue-800 text-white font-bold hover:bg-blue-900 transition">
            Pesquisar
          </button>
          <button
            type="button"
            (click)="limparPesquisa()"
            class="px-4 py-2.5 rounded-lg border-2 border-slate-600 bg-white text-slate-900 font-semibold hover:bg-slate-100 transition">
            Limpar
          </button>
        </div>
      </form>

      <!-- Modal de Cadastro / Edição de Leitor -->
      @if (showFormModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-modal-title"
          aria-describedby="member-modal-desc">
          <div class="modal-box a11y-card w-full max-w-2xl rounded-2xl bg-white border-2 border-slate-800 shadow-2xl p-6 sm:p-8 my-8">
            <div class="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 id="member-modal-title" class="text-2xl font-extrabold text-slate-900">
                  {{ editingMemberId() ? 'Editar Dados do Leitor' : 'Cadastrar Novo Cliente / Leitor' }}
                </h2>
                <p id="member-modal-desc" class="text-sm text-slate-700 mt-1">
                  Adicione ou atualize os dados do leitor no sistema da biblioteca. Campos com * são obrigatórios.
                </p>
              </div>
              <button
                type="button"
                (click)="fecharModais()"
                aria-label="Fechar janela de cadastro de leitor"
                class="px-3 py-1.5 rounded-lg border-2 border-slate-600 text-slate-900 font-bold hover:bg-slate-100">
                ✕ Fechar
              </button>
            </div>

            <form [formGroup]="memberForm" (ngSubmit)="salvarLeitor()" class="mt-6 space-y-5" novalidate>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div class="sm:col-span-2">
                  <label for="member-nome" class="block text-sm font-bold text-slate-900 mb-1">
                    Nome Completo do Cliente <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <input
                    id="member-nome"
                    type="text"
                    formControlName="nome"
                    required
                    aria-required="true"
                    [attr.aria-invalid]="isFieldInvalid('nome')"
                    aria-describedby="err-member-nome"
                    placeholder="Ex: João da Silva"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
                  @if (isFieldInvalid('nome')) {
                    <p id="err-member-nome" role="alert" class="mt-1 text-sm font-semibold text-red-700">
                      O campo NOME é obrigatório e deve ser preenchido.
                    </p>
                  }
                </div>

                <div>
                  <label for="member-cpf" class="block text-sm font-bold text-slate-900 mb-1">
                    CPF (11 dígitos) <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <input
                    id="member-cpf"
                    type="text"
                    formControlName="cpf"
                    required
                    aria-required="true"
                    [attr.aria-invalid]="isFieldInvalid('cpf')"
                    aria-describedby="hint-member-cpf err-member-cpf"
                    placeholder="Ex: 52998224725"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900 font-mono" />
                  <p id="hint-member-cpf" class="mt-1 text-xs text-slate-600">
                    Apenas números ou formato 000.000.000-00.
                  </p>
                  @if (isFieldInvalid('cpf')) {
                    <p id="err-member-cpf" role="alert" class="mt-1 text-sm font-semibold text-red-700">
                      {{ memberForm.get('cpf')?.errors?.['invalidCpf'] || 'O campo CPF é obrigatório.' }}
                    </p>
                  }
                </div>

                <div>
                  <label for="member-telefone" class="block text-sm font-bold text-slate-900 mb-1">
                    Telefone <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <input
                    id="member-telefone"
                    type="tel"
                    formControlName="telefone"
                    required
                    aria-required="true"
                    [attr.aria-invalid]="isFieldInvalid('telefone')"
                    aria-describedby="err-member-tel"
                    placeholder="Ex: (11) 98765-4321"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
                  @if (isFieldInvalid('telefone')) {
                    <p id="err-member-tel" role="alert" class="mt-1 text-sm font-semibold text-red-700">
                      O campo TELEFONE é obrigatório.
                    </p>
                  }
                </div>

                <div class="sm:col-span-2">
                  <label for="member-email" class="block text-sm font-bold text-slate-900 mb-1">
                    Endereço de E-mail <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <input
                    id="member-email"
                    type="email"
                    formControlName="email"
                    required
                    aria-required="true"
                    [attr.aria-invalid]="isFieldInvalid('email')"
                    aria-describedby="err-member-email"
                    placeholder="Ex: leitor@email.com"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
                  @if (isFieldInvalid('email')) {
                    <p id="err-member-email" role="alert" class="mt-1 text-sm font-semibold text-red-700">
                      Informe um endereço de e-mail válido.
                    </p>
                  }
                </div>

                <div class="sm:col-span-2">
                  <label for="member-endereco" class="block text-sm font-bold text-slate-900 mb-1">
                    Endereço Completo <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <input
                    id="member-endereco"
                    type="text"
                    formControlName="endereco"
                    required
                    aria-required="true"
                    [attr.aria-invalid]="isFieldInvalid('endereco')"
                    aria-describedby="err-member-end"
                    placeholder="Ex: Rua das Rosas, 452 - Centro"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
                  @if (isFieldInvalid('endereco')) {
                    <p id="err-member-end" role="alert" class="mt-1 text-sm font-semibold text-red-700">
                      O campo ENDEREÇO é obrigatório.
                    </p>
                  }
                </div>
              </div>

              <div class="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  (click)="fecharModais()"
                  class="px-5 py-2.5 rounded-lg border-2 border-slate-600 bg-white text-slate-900 font-bold hover:bg-slate-100">
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="submitting()"
                  class="btn-primary px-6 py-2.5 rounded-lg bg-blue-800 text-white font-bold hover:bg-blue-900 disabled:opacity-50">
                  {{ submitting() ? 'Salvando...' : (editingMemberId() ? 'Salvar Alterações' : '+ Adicionar Leitor') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Modal Detalhes do Cliente e Histórico de Empréstimos (equivalente a detalheleitor-view.fxml) -->
      @if (selectedMemberForDetails(); as m) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-detail-title">
          <div class="modal-box a11y-card w-full max-w-3xl rounded-2xl bg-white border-2 border-slate-800 shadow-2xl p-6 sm:p-8 my-8 space-y-6">
            <div class="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 id="member-detail-title" class="text-2xl font-extrabold text-slate-900">
                  Detalhes do Cliente: {{ m.nome }}
                </h2>
                <p class="text-sm text-slate-700 mt-1">
                  Código ID #{{ m.id }} — CPF: {{ formatarCpf(m.cpf) }}
                </p>
              </div>
              <button
                type="button"
                (click)="fecharModais()"
                aria-label="Fechar detalhes do cliente"
                class="px-3 py-1.5 rounded-lg border-2 border-slate-600 text-slate-900 font-bold hover:bg-slate-100">
                ✕ Voltar
              </button>
            </div>

            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-300 text-sm">
              <div>
                <dt class="font-bold text-slate-700">E-mail</dt>
                <dd class="text-slate-900 mt-0.5">{{ m.email }}</dd>
              </div>
              <div>
                <dt class="font-bold text-slate-700">Telefone</dt>
                <dd class="text-slate-900 mt-0.5">{{ m.telefone }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="font-bold text-slate-700">Endereço Cadastrado</dt>
                <dd class="text-slate-900 mt-0.5">{{ m.endereco }}</dd>
              </div>
            </dl>

            <div>
              <h3 class="text-lg font-bold text-slate-900 mb-3">Histórico de Empréstimos do Leitor</h3>
              <div class="overflow-x-auto border border-slate-300 rounded-xl">
                <table class="min-w-full divide-y divide-slate-300 text-left">
                  <caption class="sr-only">Histórico de livros emprestados para {{ m.nome }}</caption>
                  <thead class="bg-slate-100">
                    <tr>
                      <th scope="col" class="px-4 py-2.5 text-xs font-bold uppercase text-slate-800">Nome do Livro</th>
                      <th scope="col" class="px-4 py-2.5 text-xs font-bold uppercase text-slate-800">Data Empréstimo</th>
                      <th scope="col" class="px-4 py-2.5 text-xs font-bold uppercase text-slate-800">Data Devolução</th>
                      <th scope="col" class="px-4 py-2.5 text-xs font-bold uppercase text-slate-800">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 bg-white">
                    @for (h of memberLoansHistory(); track h.id) {
                      <tr>
                        <td class="px-4 py-3 text-sm font-semibold text-slate-900">{{ h.tituloLivro }}</td>
                        <td class="px-4 py-3 text-sm text-slate-800">{{ h.dataEmprestimo | date:'dd/MM/yyyy' }}</td>
                        <td class="px-4 py-3 text-sm text-slate-800">{{ h.dataDevolucao | date:'dd/MM/yyyy' }}</td>
                        <td class="px-4 py-3 text-sm font-bold">{{ h.status }}</td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="4" class="px-4 py-6 text-center text-sm text-slate-700">
                          Não há registros de empréstimos para este leitor.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Tabela de Leitores (equivalente a tbLeitor em gerenciarclientes-view.fxml) -->
      <div class="a11y-card rounded-xl bg-white border-2 border-slate-300 overflow-hidden shadow-sm">
        <div class="p-4 bg-slate-100 border-b border-slate-300">
          <h2 class="text-base font-bold text-slate-900">
            Leitores Cadastrados ({{ members().length }})
          </h2>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-300 text-left">
            <caption class="sr-only">
              Lista de leitores da biblioteca com nome, telefone, CPF, ID do leitor, status do último empréstimo e ações.
            </caption>
            <thead class="bg-slate-100">
              <tr>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">ID Leitor</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Nome</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">CPF</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Telefone / E-mail</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Último Empréstimo</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              @for (m of members(); track m.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-4 text-sm font-mono font-bold text-slate-900">#{{ m.id }}</td>
                  <th scope="row" class="px-4 py-4 text-sm font-bold text-slate-900">
                    <div>{{ m.nome }}</div>
                    <div class="text-xs font-normal text-slate-600">{{ m.endereco }}</div>
                  </th>
                  <td class="px-4 py-4 text-sm font-mono text-slate-900">{{ formatarCpf(m.cpf) }}</td>
                  <td class="px-4 py-4 text-sm text-slate-800">
                    <div>{{ m.telefone }}</div>
                    <div class="text-xs text-slate-600">{{ m.email }}</div>
                  </td>
                  <td class="px-4 py-4 text-sm">
                    <span
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
                      [ngClass]="{
                        'bg-blue-100 text-blue-900 border-blue-800': m.statusUltimoEmprestimo === 'Ativo',
                        'bg-red-100 text-red-900 border-red-800': m.statusUltimoEmprestimo === 'Atrasado',
                        'bg-emerald-100 text-emerald-900 border-emerald-800': m.statusUltimoEmprestimo === 'Devolvido',
                        'bg-slate-100 text-slate-800 border-slate-500': m.statusUltimoEmprestimo === 'Não há registro'
                      }">
                      {{ m.statusUltimoEmprestimo }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-sm">
                    <div class="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        (click)="verHistoricoLeitor(m)"
                        [attr.aria-label]="'Ver detalhes e histórico de empréstimos de ' + m.nome"
                        class="px-3 py-1.5 rounded-lg border-2 border-slate-700 bg-white text-slate-900 font-bold hover:bg-slate-100 text-xs">
                        Histórico
                      </button>
                      <button
                        type="button"
                        (click)="abrirFormularioEdicao(m)"
                        [attr.aria-label]="'Editar cadastro de ' + m.nome"
                        class="px-3 py-1.5 rounded-lg border-2 border-blue-800 bg-blue-50 text-blue-900 font-bold hover:bg-blue-100 text-xs">
                        Editar
                      </button>
                      <button
                        type="button"
                        (click)="confirmarExclusao(m)"
                        [attr.aria-label]="'Excluir leitor ' + m.nome"
                        class="px-3 py-1.5 rounded-lg border-2 border-red-800 bg-red-50 text-red-900 font-bold hover:bg-red-100 text-xs">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-10 text-center text-base text-slate-700">
                    Nenhum leitor encontrado.
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
export class MembersComponent implements OnInit {
  private readonly api = inject(LibraryApiService);
  private readonly a11y = inject(A11yAnnouncerService);
  private readonly fb = inject(FormBuilder);

  readonly members = signal<Member[]>([]);
  readonly showFormModal = signal<boolean>(false);
  readonly editingMemberId = signal<number | null>(null);
  readonly submitting = signal<boolean>(false);

  readonly selectedMemberForDetails = signal<Member | null>(null);
  readonly memberLoansHistory = signal<Loan[]>([]);

  readonly searchControl = this.fb.nonNullable.control('');

  readonly memberForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(50)]],
    cpf: ['', [Validators.required, cpfValidator()]],
    telefone: ['', [Validators.required, Validators.maxLength(18)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(70)]],
    endereco: ['', [Validators.required]]
  });

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showFormModal() || this.selectedMemberForDetails()) {
      this.fecharModais();
    }
  }

  ngOnInit(): void {
    this.carregarLeitores();
  }

  formatarCpf(cpf: string): string {
    return formatCpf(cpf);
  }

  carregarLeitores(query?: string): void {
    this.api.getMembers(query).subscribe({
      next: (lista) => {
        this.members.set(lista);
        this.a11y.announcePolite(`Lista de leitores carregada: ${lista.length} registros.`);
      },
      error: (err) => {
        this.a11y.notifyError('Erro ao carregar leitores', err?.error?.message || 'Não foi possível consultar os leitores.');
      }
    });
  }

  pesquisar(): void {
    this.carregarLeitores(this.searchControl.value);
  }

  limparPesquisa(): void {
    this.searchControl.setValue('');
    this.carregarLeitores();
  }

  abrirFormularioNovo(): void {
    this.editingMemberId.set(null);
    this.memberForm.reset({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      endereco: ''
    });
    this.showFormModal.set(true);
    this.a11y.announcePolite('Formulário de cadastro de novo leitor aberto.');
  }

  abrirFormularioEdicao(member: Member): void {
    this.editingMemberId.set(member.id);
    this.memberForm.reset({
      nome: member.nome,
      cpf: member.cpf,
      telefone: member.telefone,
      email: member.email,
      endereco: member.endereco
    });
    this.showFormModal.set(true);
    this.a11y.announcePolite(`Editando cadastro do leitor ${member.nome}.`);
  }

  verHistoricoLeitor(member: Member): void {
    this.selectedMemberForDetails.set(member);
    this.memberLoansHistory.set([]);
    this.api.getLoansByMemberCpf(member.cpf).subscribe({
      next: (loans) => {
        this.memberLoansHistory.set(loans);
        this.a11y.announcePolite(`Exibindo histórico de ${member.nome} com ${loans.length} empréstimos.`);
      }
    });
  }

  fecharModais(): void {
    this.showFormModal.set(false);
    this.editingMemberId.set(null);
    this.selectedMemberForDetails.set(null);
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.memberForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  salvarLeitor(): void {
    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      this.a11y.notifyError('Dados inválidos', 'Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    this.submitting.set(true);
    const payload: MemberRequest = this.memberForm.getRawValue();
    const idEdicao = this.editingMemberId();

    const request$ = idEdicao
      ? this.api.updateMember(idEdicao, payload)
      : this.api.createMember(payload);

    request$.subscribe({
      next: (salvo) => {
        this.submitting.set(false);
        this.fecharModais();
        this.a11y.notifySuccess(
          'Sucesso!',
          idEdicao
            ? `Cadastro do leitor "${salvo.nome}" atualizado com sucesso.`
            : `Leitor "${salvo.nome}" cadastrado com sucesso.`
        );
        this.carregarLeitores(this.searchControl.value);
      },
      error: (err) => {
        this.submitting.set(false);
        this.a11y.notifyError('Erro ao salvar leitor', err?.error?.message || 'Verifique se o CPF já está cadastrado.');
      }
    });
  }

  confirmarExclusao(member: Member): void {
    if (!window.confirm(`Confirma a exclusão do leitor "${member.nome}" (CPF: ${formatCpf(member.cpf)})?`)) {
      return;
    }
    this.api.deleteMember(member.id).subscribe({
      next: () => {
        this.a11y.notifySuccess('Leitor excluído', `O cadastro de "${member.nome}" foi removido.`);
        this.carregarLeitores(this.searchControl.value);
      },
      error: (err) => {
        this.a11y.notifyError('Não foi possível excluir', err?.error?.message || 'Verifique se o leitor possui empréstimos ativos.');
      }
    });
  }
}

