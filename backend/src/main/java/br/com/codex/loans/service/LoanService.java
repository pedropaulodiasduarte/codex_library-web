package br.com.codex.loans.service;

import br.com.codex.authors.repository.AuthorRepository;
import br.com.codex.books.domain.Book;
import br.com.codex.books.repository.BookRepository;
import br.com.codex.loans.domain.Loan;
import br.com.codex.loans.dto.DashboardStatsDTO;
import br.com.codex.loans.dto.LoanRequestDTO;
import br.com.codex.loans.dto.LoanResponseDTO;
import br.com.codex.loans.repository.LoanRepository;
import br.com.codex.members.domain.Member;
import br.com.codex.members.repository.MemberRepository;
import br.com.codex.shared.exception.BusinessRuleException;
import br.com.codex.shared.exception.ResourceNotFoundException;
import br.com.codex.shared.validation.DocumentValidatorUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final AuthorRepository authorRepository;

    public LoanService(
            LoanRepository loanRepository,
            BookRepository bookRepository,
            MemberRepository memberRepository,
            AuthorRepository authorRepository
    ) {
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
        this.authorRepository = authorRepository;
    }

    @Transactional
    public List<LoanResponseDTO> listarEmprestimos(String statusFiltro, String pesquisa) {
        sincronizarStatusAtrasados();

        List<Loan> loans = loanRepository.findAllByOrderByDataEmprestimoDescIdDesc();
        Map<String, Book> booksByIsbn = bookRepository.findAll()
                .stream()
                .collect(Collectors.toMap(Book::getIsbnCodigo, Function.identity(), (a, b) -> a));

        Map<String, Member> membersByCpf = memberRepository.findAll()
                .stream()
                .collect(Collectors.toMap(Member::getCpf, Function.identity(), (a, b) -> a));

        return loans.stream()
                .map(l -> toResponse(l, booksByIsbn.get(l.getIsbnCodigo()), membersByCpf.get(l.getCpfLeitor())))
                .filter(dto -> matchesStatus(dto, statusFiltro))
                .filter(dto -> matchesQuery(dto, pesquisa))
                .toList();
    }

    @Transactional
    public List<LoanResponseDTO> listarPorCpfLeitor(String cpf) {
        sincronizarStatusAtrasados();
        String cleanCpf = DocumentValidatorUtil.normalizeDigits(cpf);
        List<Loan> loans = loanRepository.findByCpfLeitorOrderByDataEmprestimoDescIdDesc(cleanCpf);

        Map<String, Book> booksByIsbn = bookRepository.findAll()
                .stream()
                .collect(Collectors.toMap(Book::getIsbnCodigo, Function.identity(), (a, b) -> a));
        Member member = memberRepository.findByCpf(cleanCpf).orElse(null);

        return loans.stream()
                .map(l -> toResponse(l, booksByIsbn.get(l.getIsbnCodigo()), member))
                .toList();
    }

    @Transactional
    public LoanResponseDTO registrarEmprestimo(LoanRequestDTO dto) {
        String cleanIsbn = DocumentValidatorUtil.normalizeIsbn(dto.isbnCodigo());
        String cleanCpf = DocumentValidatorUtil.normalizeDigits(dto.cpfLeitor());

        Book book = bookRepository.findByIsbnCodigo(cleanIsbn)
                .orElseThrow(() -> new ResourceNotFoundException("Nenhum livro encontrado no acervo com o ISBN: " + cleanIsbn));

        Member member = memberRepository.findByCpf(cleanCpf)
                .orElseThrow(() -> new ResourceNotFoundException("Nenhum leitor encontrado com o CPF: " + cleanCpf));

        int emprestimosAtivos = loanRepository.countActiveLoansByIsbn(cleanIsbn);
        if (emprestimosAtivos >= book.getCopia()) {
            throw new BusinessRuleException("Não há exemplares disponíveis para empréstimo do livro '" + book.getTitulo() + "'.");
        }

        LocalDate dataEmp = dto.dataEmprestimo() != null ? dto.dataEmprestimo() : LocalDate.now();
        LocalDate dataDev = dto.dataDevolucao() != null ? dto.dataDevolucao() : dataEmp.plusDays(10);

        if (dataDev.isBefore(dataEmp)) {
            throw new BusinessRuleException("A Data de Devolução não pode ser anterior à Data de Empréstimo.");
        }

        String statusInicial = dataDev.isBefore(LocalDate.now()) ? "Atrasado" : "Ativo";
        Loan novo = new Loan(null, cleanIsbn, cleanCpf, dataEmp, dataDev, statusInicial);
        Loan salvo = loanRepository.save(novo);

        return toResponse(salvo, book, member);
    }

    @Transactional
    public LoanResponseDTO aprovarDevolucao(Integer id) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empréstimo não encontrado com ID: " + id));

        if ("Devolvido".equalsIgnoreCase(loan.getStatus())) {
            throw new BusinessRuleException("Este empréstimo já consta como devolvido.");
        }

        loan.setStatus("Devolvido");
        loan.setDataDevolucao(LocalDate.now());
        Loan atualizado = loanRepository.save(loan);

        Book book = bookRepository.findByIsbnCodigo(atualizado.getIsbnCodigo()).orElse(null);
        Member member = memberRepository.findByCpf(atualizado.getCpfLeitor()).orElse(null);
        return toResponse(atualizado, book, member);
    }

    @Transactional
    public LoanResponseDTO prorrogarEmprestimo(Integer id, int diasExtras) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empréstimo não encontrado com ID: " + id));

        if ("Devolvido".equalsIgnoreCase(loan.getStatus())) {
            throw new BusinessRuleException("Não é possível prorrogar um empréstimo que já foi devolvido.");
        }

        int dias = diasExtras > 0 ? diasExtras : 5;
        LocalDate baseDate = loan.getDataDevolucao().isAfter(LocalDate.now()) ? loan.getDataDevolucao() : LocalDate.now();
        loan.setDataDevolucao(baseDate.plusDays(dias));
        loan.setStatus("Ativo");

        Loan atualizado = loanRepository.save(loan);
        Book book = bookRepository.findByIsbnCodigo(atualizado.getIsbnCodigo()).orElse(null);
        Member member = memberRepository.findByCpf(atualizado.getCpfLeitor()).orElse(null);
        return toResponse(atualizado, book, member);
    }

    @Transactional
    public DashboardStatsDTO obterEstatisticasDashboard() {
        sincronizarStatusAtrasados();

        List<Book> books = bookRepository.findAll();
        long totalTitulos = books.size();
        long totalExemplares = books.stream().mapToLong(Book::getCopia).sum();

        List<LoanResponseDTO> todosEmprestimos = listarEmprestimos(null, null);
        long ativos = todosEmprestimos.stream().filter(e -> "Ativo".equalsIgnoreCase(e.status())).count();
        long atrasados = todosEmprestimos.stream().filter(e -> "Atrasado".equalsIgnoreCase(e.status())).count();
        long devolvidos = todosEmprestimos.stream().filter(e -> "Devolvido".equalsIgnoreCase(e.status())).count();

        long exemplaresEmprestados = ativos + atrasados;
        long exemplaresDisponiveis = Math.max(0, totalExemplares - exemplaresEmprestados);

        long totalLeitores = memberRepository.count();
        long totalAutores = authorRepository.count();

        List<LoanResponseDTO> recentes = todosEmprestimos.stream().limit(8).toList();

        return new DashboardStatsDTO(
                totalTitulos,
                totalExemplares,
                exemplaresDisponiveis,
                totalLeitores,
                totalAutores,
                ativos,
                atrasados,
                devolvidos,
                recentes
        );
    }

    private void sincronizarStatusAtrasados() {
        LocalDate hoje = LocalDate.now();
        List<Loan> todos = loanRepository.findAll();
        for (Loan loan : todos) {
            if (!"Devolvido".equalsIgnoreCase(loan.getStatus()) && loan.getDataDevolucao().isBefore(hoje)) {
                if (!"Atrasado".equalsIgnoreCase(loan.getStatus())) {
                    loan.setStatus("Atrasado");
                    loanRepository.save(loan);
                }
            }
        }
    }

    private LoanResponseDTO toResponse(Loan loan, Book book, Member member) {
        String titulo = book != null ? book.getTitulo() : "Livro (" + loan.getIsbnCodigo() + ")";
        String autor = book != null ? book.getAutor() : "Desconhecido";
        String nomeLeitor = member != null ? member.getNome() : "Leitor (" + loan.getCpfLeitor() + ")";
        boolean isAtrasado = !"Devolvido".equalsIgnoreCase(loan.getStatus()) && loan.getDataDevolucao().isBefore(LocalDate.now());
        String statusEfetivo = isAtrasado ? "Atrasado" : loan.getStatus();

        return new LoanResponseDTO(
                loan.getId(),
                loan.getIsbnCodigo(),
                titulo,
                autor,
                loan.getCpfLeitor(),
                nomeLeitor,
                loan.getDataEmprestimo(),
                loan.getDataDevolucao(),
                statusEfetivo,
                isAtrasado
        );
    }

    private boolean matchesStatus(LoanResponseDTO dto, String statusFiltro) {
        if (statusFiltro == null || statusFiltro.isBlank() || "Todos".equalsIgnoreCase(statusFiltro)) {
            return true;
        }
        return dto.status().equalsIgnoreCase(statusFiltro.trim());
    }

    private boolean matchesQuery(LoanResponseDTO dto, String pesquisa) {
        if (pesquisa == null || pesquisa.isBlank()) {
            return true;
        }
        String q = pesquisa.trim().toLowerCase();
        return dto.nomeLeitor().toLowerCase().contains(q)
                || dto.tituloLivro().toLowerCase().contains(q)
                || dto.isbnCodigo().toLowerCase().contains(q)
                || dto.cpfLeitor().contains(q)
                || String.valueOf(dto.id()).equals(q);
    }
}

