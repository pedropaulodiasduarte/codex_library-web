import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LibraryApiService } from '../../core/services/library-api.service';
import { A11yAnnouncerService } from '../../core/services/a11y-announcer.service';
import { Author, AuthorRequest } from '../../core/models/library.models';

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section aria-labelledby="authors-heading" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 id="authors-heading" class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Catálogo de Autores Literários
          </h1>
          <p class="mt-1 text-base text-slate-700">
            Gerencie o domínio de autores do acervo, biografias e quantidade de obras catalogadas.
          </p>
        </div>
        <button
          type="button"
          (click)="abrirModalNovo()"
          class="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-800 text-white font-bold hover:bg-blue-900 transition shadow-sm"
          aria-haspopup="dialog">
          <span aria-hidden="true">+</span>
          <span>Novo Autor</span>
        </button>
      </div>

      <!-- Barra de Pesquisa -->
      <form
        role="search"
        aria-label="Pesquisar autores"
        (ngSubmit)="pesquisar()"
        class="a11y-card p-5 rounded-xl bg-white border-2 border-slate-300 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div class="flex-1">
          <label for="search-authors-input" class="block text-sm font-bold text-slate-900 mb-1">
            Buscar autor por nome
          </label>
          <input
            id="search-authors-input"
            type="search"
            [formControl]="searchControl"
            placeholder="Ex: Machado de Assis, Franz Kafka, Clarice Lispector..."
            class="w-full px-4 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
        </div>
        <div class="flex gap-2">
          <button
            type="submit"
            class="btn-primary px-5 py-2.5 rounded-lg bg-blue-800 text-white font-bold hover:bg-blue-900">
            Pesquisar
          </button>
          <button
            type="button"
            (click)="limpar()"
            class="px-4 py-2.5 rounded-lg border-2 border-slate-600 bg-white text-slate-900 font-semibold hover:bg-slate-100">
            Limpar
          </button>
        </div>
      </form>

      <!-- Modal de Cadastro / Edição de Autor -->
      @if (showModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="author-modal-title">
          <div class="modal-box a11y-card w-full max-w-xl rounded-2xl bg-white border-2 border-slate-800 shadow-2xl p-6 sm:p-8 my-8">
            <div class="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <h2 id="author-modal-title" class="text-2xl font-extrabold text-slate-900">
                {{ editingAuthorId() ? 'Editar Autor' : 'Cadastrar Novo Autor' }}
              </h2>
              <button
                type="button"
                (click)="fecharModal()"
                aria-label="Fechar janela de autor"
                class="px-3 py-1.5 rounded-lg border-2 border-slate-600 text-slate-900 font-bold hover:bg-slate-100">
                ✕ Fechar
              </button>
            </div>

            <form [formGroup]="authorForm" (ngSubmit)="salvarAutor()" class="mt-6 space-y-5" novalidate>
              <div>
                <label for="author-nome" class="block text-sm font-bold text-slate-900 mb-1">
                  Nome do(a) Autor(a) <span aria-hidden="true" class="text-red-700">*</span>
                </label>
                <input
                  id="author-nome"
                  type="text"
                  formControlName="nome"
                  required
                  aria-required="true"
                  placeholder="Ex: Clarice Lispector"
                  class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
              </div>

              <div>
                <label for="author-nac" class="block text-sm font-bold text-slate-900 mb-1">
                  Nacionalidade / Origem
                </label>
                <input
                  id="author-nac"
                  type="text"
                  formControlName="nacionalidade"
                  placeholder="Ex: Brasileira"
                  class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
              </div>

              <div>
                <label for="author-bio" class="block text-sm font-bold text-slate-900 mb-1">
                  Resumo Biográfico / Notas Literárias
                </label>
                <textarea
                  id="author-bio"
                  rows="3"
                  formControlName="biografia"
                  placeholder="Principais obras, estilo literário ou observações de catalogação..."
                  class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900"></textarea>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  (click)="fecharModal()"
                  class="px-5 py-2.5 rounded-lg border-2 border-slate-600 bg-white text-slate-900 font-bold hover:bg-slate-100">
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn-primary px-6 py-2.5 rounded-lg bg-blue-800 text-white font-bold hover:bg-blue-900">
                  Salvar Autor
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Tabela de Autores -->
      <div class="a11y-card rounded-xl bg-white border-2 border-slate-300 overflow-hidden shadow-sm">
        <div class="p-4 bg-slate-100 border-b border-slate-300">
          <h2 class="text-base font-bold text-slate-900">
            Autores Registrados ({{ authors().length }})
          </h2>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-300 text-left">
            <caption class="sr-only">
              Lista de autores cadastrados com nome, nacionalidade, biografia, total de livros vinculados e ações.
            </caption>
            <thead class="bg-slate-100">
              <tr>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Nome do Autor</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Nacionalidade</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Biografia / Notas</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Obras no Acervo</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              @for (a of authors(); track a.id) {
                <tr class="hover:bg-slate-50">
                  <th scope="row" class="px-4 py-4 text-sm font-bold text-slate-900">{{ a.nome }}</th>
                  <td class="px-4 py-4 text-sm text-slate-800">{{ a.nacionalidade || 'Não informada' }}</td>
                  <td class="px-4 py-4 text-sm text-slate-700 max-w-md">{{ a.biografia || '—' }}</td>
                  <td class="px-4 py-4 text-sm">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-800">
                      {{ a.totalLivrosNoAcervo }} {{ a.totalLivrosNoAcervo === 1 ? 'livro' : 'livros' }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-sm">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="abrirModalEdicao(a)"
                        [attr.aria-label]="'Editar autor ' + a.nome"
                        class="px-3 py-1.5 rounded-lg border-2 border-blue-800 bg-blue-50 text-blue-900 font-bold hover:bg-blue-100 text-xs">
                        Editar
                      </button>
                      <button
                        type="button"
                        (click)="excluirAutor(a)"
                        [attr.aria-label]="'Excluir autor ' + a.nome"
                        class="px-3 py-1.5 rounded-lg border-2 border-red-800 bg-red-50 text-red-900 font-bold hover:bg-red-100 text-xs">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-6 py-10 text-center text-base text-slate-700">
                    Nenhum autor encontrado.
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
export class AuthorsComponent implements OnInit {
  private readonly api = inject(LibraryApiService);
  private readonly a11y = inject(A11yAnnouncerService);
  private readonly fb = inject(FormBuilder);

  readonly authors = signal<Author[]>([]);
  readonly showModal = signal<boolean>(false);
  readonly editingAuthorId = signal<number | null>(null);

  readonly searchControl = this.fb.nonNullable.control('');

  readonly authorForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(80)]],
    nacionalidade: ['Brasil / Internacional', [Validators.maxLength(50)]],
    biografia: ['', [Validators.maxLength(1000)]]
  });

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showModal()) {
      this.fecharModal();
    }
  }

  ngOnInit(): void {
    this.carregarAutores();
  }

  carregarAutores(query?: string): void {
    this.api.getAuthors(query).subscribe({
      next: (lista) => {
        this.authors.set(lista);
        this.a11y.announcePolite(`Catálogo de autores carregado: ${lista.length} autores.`);
      },
      error: (err) => {
        this.a11y.notifyError('Erro ao carregar autores', err?.error?.message || 'Não foi possível consultar os autores.');
      }
    });
  }

  pesquisar(): void {
    this.carregarAutores(this.searchControl.value);
  }

  limpar(): void {
    this.searchControl.setValue('');
    this.carregarAutores();
  }

  abrirModalNovo(): void {
    this.editingAuthorId.set(null);
    this.authorForm.reset({
      nome: '',
      nacionalidade: 'Brasileira',
      biografia: ''
    });
    this.showModal.set(true);
  }

  abrirModalEdicao(author: Author): void {
    this.editingAuthorId.set(author.id);
    this.authorForm.reset({
      nome: author.nome,
      nacionalidade: author.nacionalidade,
      biografia: author.biografia
    });
    this.showModal.set(true);
  }

  fecharModal(): void {
    this.showModal.set(false);
    this.editingAuthorId.set(null);
  }

  salvarAutor(): void {
    if (this.authorForm.invalid) {
      this.authorForm.markAllAsTouched();
      this.a11y.notifyError('Dados inválidos', 'O nome do autor é obrigatório.');
      return;
    }

    const payload: AuthorRequest = this.authorForm.getRawValue();
    const id = this.editingAuthorId();

    const req$ = id ? this.api.updateAuthor(id, payload) : this.api.createAuthor(payload);
    req$.subscribe({
      next: (salvo) => {
        this.fecharModal();
        this.a11y.notifySuccess('Sucesso', `Autor "${salvo.nome}" salvo com sucesso.`);
        this.carregarAutores(this.searchControl.value);
      },
      error: (err) => {
        this.a11y.notifyError('Erro ao salvar autor', err?.error?.message || 'Operação não concluída.');
      }
    });
  }

  excluirAutor(author: Author): void {
    if (!window.confirm(`Deseja realmente excluir o autor "${author.nome}"?`)) {
      return;
    }
    this.api.deleteAuthor(author.id).subscribe({
      next: () => {
        this.a11y.notifySuccess('Autor removido', `O autor "${author.nome}" foi excluído.`);
        this.carregarAutores(this.searchControl.value);
      },
      error: (err) => {
        this.a11y.notifyError('Exclusão bloqueada', err?.error?.message || 'Não é possível excluir autor com livros vinculados.');
      }
    });
  }
}

