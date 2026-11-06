package br.com.codex.books.service;

import br.com.codex.authors.service.AuthorService;
import br.com.codex.books.domain.Book;
import br.com.codex.books.domain.Location;
import br.com.codex.books.dto.BookRequestDTO;
import br.com.codex.books.dto.BookResponseDTO;
import br.com.codex.books.dto.LocationDTO;
import br.com.codex.books.mapper.BookMapper;
import br.com.codex.books.repository.BookRepository;
import br.com.codex.books.repository.LocationRepository;
import br.com.codex.loans.repository.LoanRepository;
import br.com.codex.shared.exception.BusinessRuleException;
import br.com.codex.shared.exception.ResourceNotFoundException;
import br.com.codex.shared.validation.DocumentValidatorUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final LocationRepository locationRepository;
    private final LoanRepository loanRepository;
    private final AuthorService authorService;
    private final BookMapper bookMapper;

    public BookService(
            BookRepository bookRepository,
            LocationRepository locationRepository,
            LoanRepository loanRepository,
            AuthorService authorService,
            BookMapper bookMapper
    ) {
        this.bookRepository = bookRepository;
        this.locationRepository = locationRepository;
        this.loanRepository = loanRepository;
        this.authorService = authorService;
        this.bookMapper = bookMapper;
    }

    @Transactional(readOnly = true)
    public List<BookResponseDTO> listarAcervo(String pesquisa) {
        List<Book> books = (pesquisa == null || pesquisa.isBlank())
                ? bookRepository.findAllByOrderByTituloAsc()
                : bookRepository.pesquisarAcervo(pesquisa.trim());

        Map<Integer, Location> locMap = locationRepository.findAll()
                .stream()
                .collect(Collectors.toMap(Location::getId, Function.identity(), (a, b) -> a));

        return books.stream()
                .map(b -> bookMapper.toResponse(
                        b,
                        locMap.get(b.getIdLocalizacao()),
                        loanRepository.countActiveLoansByIsbn(b.getIsbnCodigo())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public BookResponseDTO buscarPorId(Integer id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado com ID: " + id));
        Location loc = locationRepository.findById(book.getIdLocalizacao()).orElse(null);
        return bookMapper.toResponse(book, loc, loanRepository.countActiveLoansByIsbn(book.getIsbnCodigo()));
    }

    @Transactional(readOnly = true)
    public BookResponseDTO buscarPorIsbn(String isbn) {
        String cleanIsbn = DocumentValidatorUtil.normalizeIsbn(isbn);
        Book book = bookRepository.findByIsbnCodigo(cleanIsbn)
                .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado com ISBN: " + cleanIsbn));
        Location loc = locationRepository.findById(book.getIdLocalizacao()).orElse(null);
        return bookMapper.toResponse(book, loc, loanRepository.countActiveLoansByIsbn(book.getIsbnCodigo()));
    }

    @Transactional
    public BookResponseDTO cadastrarLivro(BookRequestDTO dto) {
        String cleanIsbn = DocumentValidatorUtil.normalizeIsbn(dto.isbnCodigo());
        if (bookRepository.existsByIsbnCodigo(cleanIsbn)) {
            throw new BusinessRuleException("Já existe um livro cadastrado no acervo com o ISBN: " + cleanIsbn);
        }

        Location location = ensureLocationExists(dto.idLocalizacao());
        authorService.sincronizarAutorPeloNome(dto.autor());

        Book saved = bookRepository.save(bookMapper.toEntity(dto));
        return bookMapper.toResponse(saved, location, 0);
    }

    @Transactional
    public BookResponseDTO atualizarLivro(Integer id, BookRequestDTO dto) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado com ID: " + id));

        String cleanIsbn = DocumentValidatorUtil.normalizeIsbn(dto.isbnCodigo());
        bookRepository.findByIsbnCodigo(cleanIsbn)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessRuleException("Já existe outro livro cadastrado com o ISBN: " + cleanIsbn);
                });

        Location location = ensureLocationExists(dto.idLocalizacao());
        authorService.sincronizarAutorPeloNome(dto.autor());

        book.setTitulo(dto.titulo().trim());
        book.setAutor(dto.autor().trim());
        book.setIsbnCodigo(cleanIsbn);
        book.setIdioma(dto.idioma().trim());
        book.setEditora(dto.editora().trim());
        book.setDataPublicacao(dto.dataPublicacao());
        book.setCopia(dto.copia());
        book.setGenero(dto.genero().trim());
        book.setIdLocalizacao(dto.idLocalizacao());

        Book updated = bookRepository.save(book);
        return bookMapper.toResponse(updated, location, loanRepository.countActiveLoansByIsbn(updated.getIsbnCodigo()));
    }

    @Transactional
    public void excluirLivro(Integer id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado com ID: " + id));

        int emprestimosAtivos = loanRepository.countActiveLoansByIsbn(book.getIsbnCodigo());
        if (emprestimosAtivos > 0) {
            throw new BusinessRuleException("Não é possível excluir o livro '" + book.getTitulo() + "' pois possui " + emprestimosAtivos + " empréstimo(s) pendente(s)/ativo(s).");
        }

        bookRepository.delete(book);
    }

    @Transactional(readOnly = true)
    public List<LocationDTO> listarLocalizacoes() {
        return locationRepository.findAll()
                .stream()
                .map(bookMapper::toLocationDTO)
                .toList();
    }

    @Transactional
    public LocationDTO criarLocalizacao(LocationDTO dto) {
        Location loc = new Location(null, dto.corredor(), dto.prateleira(), dto.estante(), dto.sala(), dto.andar());
        Location saved = locationRepository.save(loc);
        return bookMapper.toLocationDTO(saved);
    }

    private Location ensureLocationExists(Integer idLocalizacao) {
        return locationRepository.findById(idLocalizacao)
                .orElseGet(() -> {
                    int corredor = ((idLocalizacao - 1) % 10) + 1;
                    int prateleira = ((idLocalizacao - 1) % 5) + 1;
                    int estante = ((idLocalizacao - 1) / 5) + 1;
                    int sala = ((idLocalizacao - 1) / 20) + 1;
                    int andar = 1;
                    return locationRepository.save(new Location(null, corredor, prateleira, estante, sala, andar));
                });
    }
}

