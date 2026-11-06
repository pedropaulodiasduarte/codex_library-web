import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { BooksComponent } from './features/books/books.component';
import { LoansComponent } from './features/loans/loans.component';
import { MembersComponent } from './features/members/members.component';
import { AuthorsComponent } from './features/authors/authors.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Painel Inicial — Codex Biblioteca'
  },
  {
    path: 'books',
    component: BooksComponent,
    title: 'Acervo de Livros — Codex Biblioteca'
  },
  {
    path: 'loans',
    component: LoansComponent,
    title: 'Empréstimos e Devoluções — Codex Biblioteca'
  },
  {
    path: 'members',
    component: MembersComponent,
    title: 'Leitores e Clientes — Codex Biblioteca'
  },
  {
    path: 'authors',
    component: AuthorsComponent,
    title: 'Autores Literários — Codex Biblioteca'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

