export interface Book {
  id: number;
  titulo: string;
  autor: string;
  isbnCodigo: string;
  idioma: string;
  editora: string;
  dataPublicacao: string;
  copia: number;
  copiasDisponiveis: number;
  genero: string;
  idLocalizacao: number;
  descricaoLocalizacao: string;
}

export interface BookRequest {
  titulo: string;
  autor: string;
  isbnCodigo: string;
  idioma: string;
  editora: string;
  dataPublicacao: string;
  copia: number;
  genero: string;
  idLocalizacao: number;
}

export interface Location {
  id?: number;
  corredor: number;
  prateleira: number;
  estante: number;
  sala: number;
  andar: number;
  descricaoFormatada?: string;
}

export interface Author {
  id: number;
  nome: string;
  nacionalidade: string;
  biografia: string;
  totalLivrosNoAcervo: number;
}

export interface AuthorRequest {
  nome: string;
  nacionalidade: string;
  biografia: string;
}

export interface Member {
  id: number;
  nome: string;
  cpf: string;
  endereco: string;
  telefone: string;
  email: string;
  statusUltimoEmprestimo: string;
  emprestimosAtivosCount: number;
}

export interface MemberRequest {
  nome: string;
  cpf: string;
  endereco: string;
  telefone: string;
  email: string;
}

export interface Loan {
  id: number;
  isbnCodigo: string;
  tituloLivro: string;
  autorLivro: string;
  cpfLeitor: string;
  nomeLeitor: string;
  dataEmprestimo: string;
  dataDevolucao: string;
  status: 'Ativo' | 'Atrasado' | 'Devolvido' | string;
  atrasado: boolean;
}

export interface LoanRequest {
  isbnCodigo: string;
  cpfLeitor: string;
  dataEmprestimo: string;
  dataDevolucao: string;
}

export interface DashboardStats {
  totalTitulos: number;
  totalExemplares: number;
  exemplaresDisponiveis: number;
  totalLeitores: number;
  totalAutores: number;
  emprestimosAtivos: number;
  emprestimosAtrasados: number;
  emprestimosDevolvidos: number;
  emprestimosRecentes: Loan[];
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: { field: string; message: string }[];
}

