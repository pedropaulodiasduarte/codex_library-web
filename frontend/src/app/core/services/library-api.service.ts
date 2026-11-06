import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Author,
  AuthorRequest,
  Book,
  BookRequest,
  DashboardStats,
  Loan,
  LoanRequest,
  Location,
  Member,
  MemberRequest
} from '../models/library.models';

@Injectable({
  providedIn: 'root'
})
export class LibraryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api';

  // Dashboard
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/loans/dashboard`);
  }

  // Books (Acervo)
  getBooks(query?: string): Observable<Book[]> {
    let params = new HttpParams();
    if (query && query.trim()) {
      params = params.set('q', query.trim());
    }
    return this.http.get<Book[]>(`${this.baseUrl}/books`, { params });
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.baseUrl}/books/${id}`);
  }

  createBook(payload: BookRequest): Observable<Book> {
    return this.http.post<Book>(`${this.baseUrl}/books`, payload);
  }

  updateBook(id: number, payload: BookRequest): Observable<Book> {
    return this.http.put<Book>(`${this.baseUrl}/books/${id}`, payload);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/books/${id}`);
  }

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.baseUrl}/books/locations`);
  }

  // Authors (Autores)
  getAuthors(query?: string): Observable<Author[]> {
    let params = new HttpParams();
    if (query && query.trim()) {
      params = params.set('q', query.trim());
    }
    return this.http.get<Author[]>(`${this.baseUrl}/authors`, { params });
  }

  createAuthor(payload: AuthorRequest): Observable<Author> {
    return this.http.post<Author>(`${this.baseUrl}/authors`, payload);
  }

  updateAuthor(id: number, payload: AuthorRequest): Observable<Author> {
    return this.http.put<Author>(`${this.baseUrl}/authors/${id}`, payload);
  }

  deleteAuthor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/authors/${id}`);
  }

  // Members (Leitores / Clientes)
  getMembers(query?: string): Observable<Member[]> {
    let params = new HttpParams();
    if (query && query.trim()) {
      params = params.set('q', query.trim());
    }
    return this.http.get<Member[]>(`${this.baseUrl}/members`, { params });
  }

  getMemberById(id: number): Observable<Member> {
    return this.http.get<Member>(`${this.baseUrl}/members/${id}`);
  }

  createMember(payload: MemberRequest): Observable<Member> {
    return this.http.post<Member>(`${this.baseUrl}/members`, payload);
  }

  updateMember(id: number, payload: MemberRequest): Observable<Member> {
    return this.http.put<Member>(`${this.baseUrl}/members/${id}`, payload);
  }

  deleteMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/members/${id}`);
  }

  // Loans (Empréstimos)
  getLoans(status?: string, query?: string): Observable<Loan[]> {
    let params = new HttpParams();
    if (status && status !== 'Todos') {
      params = params.set('status', status);
    }
    if (query && query.trim()) {
      params = params.set('q', query.trim());
    }
    return this.http.get<Loan[]>(`${this.baseUrl}/loans`, { params });
  }

  getLoansByMemberCpf(cpf: string): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.baseUrl}/loans/member/${cpf}`);
  }

  createLoan(payload: LoanRequest): Observable<Loan> {
    return this.http.post<Loan>(`${this.baseUrl}/loans`, payload);
  }

  returnLoan(id: number): Observable<Loan> {
    return this.http.patch<Loan>(`${this.baseUrl}/loans/${id}/return`, {});
  }

  extendLoan(id: number, days: number = 5): Observable<Loan> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.patch<Loan>(`${this.baseUrl}/loans/${id}/extend`, {}, { params });
  }
}

