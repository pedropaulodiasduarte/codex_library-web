package br.com.codex.books.controller;

import br.com.codex.books.dto.BookRequestDTO;
import br.com.codex.books.dto.BookResponseDTO;
import br.com.codex.books.dto.LocationDTO;
import br.com.codex.books.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@Tag(name = "Acervo de Livros", description = "Gerenciamento completo de livros e localizações físicas da biblioteca")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    @Operation(summary = "Listar ou pesquisar livros no acervo")
    public ResponseEntity<List<BookResponseDTO>> listar(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(bookService.listarAcervo(q));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar livro por ID")
    public ResponseEntity<BookResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(bookService.buscarPorId(id));
    }

    @GetMapping("/isbn/{isbn}")
    @Operation(summary = "Buscar livro pelo código ISBN")
    public ResponseEntity<BookResponseDTO> buscarPorIsbn(@PathVariable String isbn) {
        return ResponseEntity.ok(bookService.buscarPorIsbn(isbn));
    }

    @PostMapping
    @Operation(summary = "Cadastrar um novo livro no acervo")
    public ResponseEntity<BookResponseDTO> cadastrar(@Valid @RequestBody BookRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.cadastrarLivro(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar informações de um livro")
    public ResponseEntity<BookResponseDTO> atualizar(@PathVariable Integer id, @Valid @RequestBody BookRequestDTO dto) {
        return ResponseEntity.ok(bookService.atualizarLivro(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir livro do acervo")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        bookService.excluirLivro(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/locations")
    @Operation(summary = "Listar todas as localizações físicas")
    public ResponseEntity<List<LocationDTO>> listarLocalizacoes() {
        return ResponseEntity.ok(bookService.listarLocalizacoes());
    }

    @PostMapping("/locations")
    @Operation(summary = "Cadastrar uma nova localização física")
    public ResponseEntity<LocationDTO> criarLocalizacao(@Valid @RequestBody LocationDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.criarLocalizacao(dto));
    }
}

