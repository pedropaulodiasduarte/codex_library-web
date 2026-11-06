import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LibraryApiService } from '../../core/services/library-api.service';
import { A11yAnnouncerService } from '../../core/services/a11y-announcer.service';
import { Book, BookRequest } from '../../core/models/library.models';
import { isbnValidator } from '../../core/validators/document.validators';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section aria-labelledby="books-heading" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 id="books-heading" class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Biblioteca — Acervo de Livros
          </h1>
          <p class="mt-1 text-base text-slate-700">
            Gerencie o acervo completo da biblioteca, códigos ISBN, quantidades e localizações físicas.
          </p>
        </div>
        <button
          type="button"
          (click)="abrirFormularioNovo()"
          class="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-800 text-white font-bold hover:bg-blue-900 transition shadow-sm"
          aria-haspopup="dialog">
          <span aria-hidden="true">+</span>
          <span>Adicionar Livro</span>
        </button>
      </div>

      <!-- Barra de Pesquisa Acessível (role="search") -->
      <form
        role="search"
        aria-label="Pesquisa de livros no acervo"
        (ngSubmit)="pesquisar()"
        class="a11y-card p-5 rounded-xl bg-white border-2 border-slate-300 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div class="flex-1">
          <label for="search-books-input" class="block text-sm font-bold text-slate-900 mb-1">
            Buscar no acervo (título, autor, código ISBN, editora ou gênero)
          </label>
          <input
            id="search-books-input"
            type="search"
            [formControl]="searchControl"
            placeholder="Ex: Dom Quixote, J.R.R. Tolkien, 9788574480219, Fantasia..."
            class="w-full px-4 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900 focus:border-blue-800"
            aria-describedby="search-books-hint" />
          <span id="search-books-hint" class="sr-only">
            Digite o termo desejado e pressione Enter ou clique no botão Pesquisar.
          </span>
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

      <!-- Modal / Painel de Cadastro e Edição de Livro -->
      @if (showModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-modal-title"
          aria-describedby="book-modal-desc">
          <div class="modal-box a11y-card w-full max-w-3xl rounded-2xl bg-white border-2 border-slate-800 shadow-2xl p-6 sm:p-8 my-8">
            <div class="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 id="book-modal-title" class="text-2xl font-extrabold text-slate-900">
                  {{ editingBookId() ? 'Editar Informações do Livro' : 'Cadastrar Novo Livro' }}
                </h2>
                <p id="book-modal-desc" class="text-sm text-slate-700 mt-1">
                  Campos marcados com asterisco (*) são de preenchimento obrigatório. Pressione Escape para cancelar.
                </p>
              </div>
              <button
                type="button"
                (click)="fecharModal()"
                aria-label="Fechar janela de cadastro de livro"
                class="px-3 py-1.5 rounded-lg border-2 border-slate-600 text-slate-900 font-bold hover:bg-slate-100">
                ✕ Fechar
              </button>
            </div>

            <form [formGroup]="bookForm" (ngSubmit)="salvarLivro()" class="mt-6 space-y-5" novalidate>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <!-- Título -->
                <div>
                  <label for="book-titulo" class="block text-sm font-bold text-slate-900 mb-1">
                    Título do Livro <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <input
                    id="book-titulo"
                    type="text"
                    formControlName="titulo"
                    required
                    aria-required="true"
                    [attr.aria-invalid]="isFieldInvalid('titulo')"
                    aria-describedby="err-book-titulo"
                    placeholder="Ex: O Senhor dos Anéis"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
                  @if (isFieldInvalid('titulo')) {
                    <p id="err-book-titulo" role="alert" class="mt-1 text-sm font-semibold text-red-700">
                      O título do livro é obrigatório (máximo 80 caracteres).
                    </p>
                  }
                </div>

                <!-- Autor -->
                <div>
                  <label for="book-autor" class="block text-sm font-bold text-slate-900 mb-1">
                    Autor(a) <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <input
                    id="book-autor"
                    type="text"
                    formControlName="autor"
                    required
                    aria-required="true"
                    [attr.aria-invalid]="isFieldInvalid('autor')"
                    aria-describedby="err-book-autor"
                    placeholder="Ex: J.R.R. Tolkien"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
                  @if (isFieldInvalid('autor')) {
                    <p id="err-book-autor" role="alert" class="mt-1 text-sm font-semibold text-red-700">
                      O nome do(a) autor(a) é obrigatório.
                    </p>
                  }
                </div>

                <!-- ISBN -->
                <div>
                  <label for="book-isbn" class="block text-sm font-bold text-slate-900 mb-1">
                    Código ISBN (10 ou 13 dígitos) <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <input
                    id="book-isbn"
                    type="text"
                    formControlName="isbnCodigo"
                    required
                    aria-required="true"
                    [attr.aria-invalid]="isFieldInvalid('isbnCodigo')"
                    aria-describedby="hint-book-isbn err-book-isbn"
                    placeholder="Ex: 9788574480011"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900 font-mono" />
                  <p id="hint-book-isbn" class="mt-1 text-xs text-slate-600">
                    Aceita ISBN-10 ou ISBN-13 com validação automática do dígito verificador.
                  </p>
                  @if (isFieldInvalid('isbnCodigo')) {
                    <p id="err-book-isbn" role="alert" class="mt-1 text-sm font-semibold text-red-700">
                      {{ bookForm.get('isbnCodigo')?.errors?.['invalidIsbn'] || 'O código ISBN é obrigatório.' }}
                    </p>
                  }
                </div>

                <!-- Editora -->
                <div>
                  <label for="book-editora" class="block text-sm font-bold text-slate-900 mb-1">
                    Editora <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <input
                    id="book-editora"
                    type="text"
                    formControlName="editora"
                    required
                    aria-required="true"
                    [attr.aria-invalid]="isFieldInvalid('editora')"
                    aria-describedby="err-book-editora"
                    placeholder="Ex: Martins Fontes"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
                  @if (isFieldInvalid('editora')) {
                    <p id="err-book-editora" role="alert" class="mt-1 text-sm font-semibold text-red-700">
                      O nome da editora é obrigatório.
                    </p>
                  }
                </div>

                <!-- Idioma -->
                <div>
                  <label for="book-idioma" class="block text-sm font-bold text-slate-900 mb-1">
                    Idioma <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <select
                    id="book-idioma"
                    formControlName="idioma"
                    required
                    aria-required="true"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900 bg-white">
                    @for (lang of idiomas; track lang) {
                      <option [value]="lang">{{ lang }}</option>
                    }
                  </select>
                </div>

                <!-- Gênero -->
                <div>
                  <label for="book-genero" class="block text-sm font-bold text-slate-900 mb-1">
                    Gênero Literário <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <select
                    id="book-genero"
                    formControlName="genero"
                    required
                    aria-required="true"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900 bg-white">
                    @for (gen of generos; track gen) {
                      <option [value]="gen">{{ gen }}</option>
                    }
                  </select>
                </div>

                <!-- Data de Publicação -->
                <div>
                  <label for="book-data" class="block text-sm font-bold text-slate-900 mb-1">
                    Data de Publicação <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <input
                    id="book-data"
                    type="date"
                    formControlName="dataPublicacao"
                    required
                    aria-required="true"
                    [attr.aria-invalid]="isFieldInvalid('dataPublicacao')"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
                </div>

                <!-- Quantidade Total de Cópias -->
                <div>
                  <label for="book-copia" class="block text-sm font-bold text-slate-900 mb-1">
                    Quantidade de Exemplares <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <input
                    id="book-copia"
                    type="number"
                    min="0"
                    formControlName="copia"
                    required
                    aria-required="true"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
                </div>

                <!-- Localização Física (ID Localização) -->
                <div class="sm:col-span-2">
                  <label for="book-localizacao" class="block text-sm font-bold text-slate-900 mb-1">
                    Código da Localização Física (Estante / Prateleira) <span aria-hidden="true" class="text-red-700">*</span>
                  </label>
                  <input
                    id="book-localizacao"
                    type="number"
                    min="1"
                    formControlName="idLocalizacao"
                    required
                    aria-required="true"
                    aria-describedby="hint-book-loc"
                    class="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-400 text-slate-900" />
                  <p id="hint-book-loc" class="mt-1 text-xs text-slate-600">
                    Informe o número identificador da localização física (Ex: 1 a 60). Caso ainda não exista, será gerado automaticamente.
                  </p>
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
                  {{ submitting() ? 'Salvando...' : (editingBookId() ? 'Salvar Alterações' : '+ Adicionar Livro') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Tabela Semântica do Acervo -->
      <div class="a11y-card rounded-xl bg-white border-2 border-slate-300 overflow-hidden shadow-sm">
        <div class="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900">
            Livros Catalogados ({{ books().length }} {{ books().length === 1 ? 'registro encontrado' : 'registros encontrados' }})
          </h2>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-300 text-left">
            <caption class="sr-only">
              Tabela do acervo de livros contendo título, autor, código ISBN, editora, gênero, disponibilidade, localização e botões de ação.
            </caption>
            <thead class="bg-slate-100">
              <tr>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Livro / Título</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Autor(a)</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Código ISBN</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Editora / Idioma</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Gênero</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Disponíveis</th>
                <th scope="col" class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              @for (book of books(); track book.id) {
                <tr class="hover:bg-slate-50">
                  <th scope="row" class="px-4 py-4 text-sm font-bold text-slate-900">
                    <div>{{ book.titulo }}</div>
                    <div class="text-xs font-normal text-slate-600 mt-0.5">{{ book.descricaoLocalizacao }}</div>
                  </th>
                  <td class="px-4 py-4 text-sm text-slate-800">{{ book.autor }}</td>
                  <td class="px-4 py-4 text-sm font-mono text-slate-900">{{ book.isbnCodigo }}</td>
                  <td class="px-4 py-4 text-sm text-slate-800">
                    <div>{{ book.editora }}</div>
                    <div class="text-xs text-slate-600">{{ book.idioma }}</div>
                  </td>
                  <td class="px-4 py-4 text-sm">
                    <span class="inline-block px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-800">
                      {{ book.genero }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-sm">
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border"
                      [ngClass]="book.copiasDisponiveis > 0 ? 'bg-emerald-100 text-emerald-900 border-emerald-800' : 'bg-red-100 text-red-900 border-red-800'">
                      {{ book.copiasDisponiveis }} / {{ book.copia }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-sm">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="abrirFormularioEdicao(book)"
                        [attr.aria-label]="'Editar informações do livro ' + book.titulo"
                        class="px-3 py-1.5 rounded-lg border-2 border-blue-800 bg-blue-50 text-blue-900 font-bold hover:bg-blue-100 transition text-xs">
                        Editar
                      </button>
                      <button
                        type="button"
                        (click)="confirmarExclusao(book)"
                        [attr.aria-label]="'Excluir o livro ' + book.titulo + ' do acervo'"
                        class="px-3 py-1.5 rounded-lg border-2 border-red-800 bg-red-50 text-red-900 font-bold hover:bg-red-100 transition text-xs">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-6 py-10 text-center text-base text-slate-700">
                    Nenhum livro encontrado no acervo para os critérios informados.
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
export class BooksComponent implements OnInit {
  private readonly api = inject(LibraryApiService);
  private readonly a11y = inject(A11yAnnouncerService);
  private readonly fb = inject(FormBuilder);

  readonly books = signal<Book[]>([]);
  readonly showModal = signal<boolean>(false);
  readonly editingBookId = signal<number | null>(null);
  readonly submitting = signal<boolean>(false);

  readonly searchControl = this.fb.nonNullable.control('');

  readonly idiomas = [
    'Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão',
    'Italiano', 'Russo', 'Japonês', 'Chinês', 'Hebraico', 'Grego Antigo', 'Latim', 'Outro'
  ];

  readonly generos = [
    'Ação e Aventura', 'Autoajuda', 'Ciência', 'Clássico Brasileiro', 'Comédia Dramática',
    'Cyberpunk', 'Diário/Guerra', 'Distopia', 'Economia', 'Estratégia', 'Fantasia',
    'Fantasia Épica', 'Fantasia Sombria', 'Fantasia Urbana', 'Ficção Científica',
    'Ficção Contemporânea', 'Ficção Existencial', 'Ficção Filosófica', 'Ficção Gótica',
    'Ficção Histórica', 'Ficção Moderna', 'Ficção Pós-Apocalíptica', 'Ficção Psicológica',
    'Ficção Religiosa', 'Ficção Social', 'Filosofia', 'Finanças', 'Gótico', 'História',
    'Infantil', 'Memórias/Guerra', 'Mistério', 'Mistério / Policial', 'Mitologia',
    'Modernismo', 'Não Ficção', 'Poesia Épica', 'Política', 'Psicologia', 'Realismo Mágico',
    'Romance', 'Romance Clássico', 'Romance Gótico', 'Romance Histórico', 'Romance Jovem',
    'Romance Psicológico', 'Romantismo', 'Suspense / Thriller', 'Tecnologia', 'Terror',
    'Terror Gótico', 'Thriller', 'Thriller Policial', 'Young Adult', 'Outro'
  ];

  readonly bookForm = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(80)]],
    autor: ['', [Validators.required, Validators.maxLength(80)]],
    isbnCodigo: ['', [Validators.required, isbnValidator()]],
    idioma: ['Português', [Validators.required]],
    editora: ['', [Validators.required, Validators.maxLength(100)]],
    dataPublicacao: [new Date().toISOString().slice(0, 10), [Validators.required]],
    copia: [10, [Validators.required, Validators.min(0)]],
    genero: ['Romance', [Validators.required]],
    idLocalizacao: [1, [Validators.required, Validators.min(1)]]
  });

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showModal()) {
      this.fecharModal();
    }
  }

  ngOnInit(): void {
    this.carregarLivros();
  }

  carregarLivros(query?: string): void {
    this.api.getBooks(query).subscribe({
      next: (lista) => {
        this.books.set(lista);
        this.a11y.announcePolite(`Acervo atualizado: ${lista.length} livros exibidos.`);
      },
      error: (err) => {
        this.a11y.notifyError('Erro ao carregar acervo', err?.error?.message || 'Não foi possível consultar a lista de livros.');
      }
    });
  }

  pesquisar(): void {
    this.carregarLivros(this.searchControl.value);
  }

  limparPesquisa(): void {
    this.searchControl.setValue('');
    this.carregarLivros();
  }

  abrirFormularioNovo(): void {
    this.editingBookId.set(null);
    this.bookForm.reset({
      titulo: '',
      autor: '',
      isbnCodigo: '',
      idioma: 'Português',
      editora: '',
      dataPublicacao: new Date().toISOString().slice(0, 10),
      copia: 10,
      genero: 'Romance',
      idLocalizacao: 1
    });
    this.showModal.set(true);
    this.a11y.announcePolite('Janela de cadastro de novo livro aberta.');
  }

  abrirFormularioEdicao(book: Book): void {
    this.editingBookId.set(book.id);
    this.bookForm.reset({
      titulo: book.titulo,
      autor: book.autor,
      isbnCodigo: book.isbnCodigo,
      idioma: book.idioma,
      editora: book.editora,
      dataPublicacao: book.dataPublicacao,
      copia: book.copia,
      genero: book.genero,
      idLocalizacao: book.idLocalizacao
    });
    this.showModal.set(true);
    this.a11y.announcePolite(`Editando informações do livro ${book.titulo}.`);
  }

  fecharModal(): void {
    this.showModal.set(false);
    this.editingBookId.set(null);
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.bookForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  salvarLivro(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      this.a11y.notifyError('Dados inválidos', 'Verifique os campos destacados em vermelho antes de salvar o livro.');
      return;
    }

    this.submitting.set(true);
    const payload: BookRequest = this.bookForm.getRawValue();
    const idEdicao = this.editingBookId();

    const request$ = idEdicao
      ? this.api.updateBook(idEdicao, payload)
      : this.api.createBook(payload);

    request$.subscribe({
      next: (salvo) => {
        this.submitting.set(false);
        this.fecharModal();
        this.a11y.notifySuccess(
          'Sucesso!',
          idEdicao
            ? `Livro "${salvo.titulo}" atualizado com sucesso.`
            : `Livro "${salvo.titulo}" cadastrado com sucesso no acervo.`
        );
        this.carregarLivros(this.searchControl.value);
      },
      error: (err) => {
        this.submitting.set(false);
        this.a11y.notifyError(
          'Não foi possível salvar o livro',
          err?.error?.message || 'Verifique se o ISBN já está cadastrado ou se todos os campos são válidos.'
        );
      }
    });
  }

  confirmarExclusao(book: Book): void {
    if (!window.confirm(`Confirma a exclusão do livro "${book.titulo}" (ISBN: ${book.isbnCodigo}) do acervo?`)) {
      return;
    }
    this.api.deleteBook(book.id).subscribe({
      next: () => {
        this.a11y.notifySuccess('Livro removido', `O livro "${book.titulo}" foi excluído do acervo.`);
        this.carregarLivros(this.searchControl.value);
      },
      error: (err) => {
        this.a11y.notifyError('Operação bloqueada', err?.error?.message || 'Não foi possível excluir o livro.');
      }
    });
  }
}

