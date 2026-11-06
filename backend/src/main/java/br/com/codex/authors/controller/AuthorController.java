package br.com.codex.authors.controller;

import br.com.codex.authors.dto.AuthorRequestDTO;
import br.com.codex.authors.dto.AuthorResponseDTO;
import br.com.codex.authors.service.AuthorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
@Tag(name = "Autores", description = "Gerenciamento de autores literários do acervo")
public class AuthorController {

    private final AuthorService authorService;

    public AuthorController(AuthorService authorService) {
        this.authorService = authorService;
    }

    @GetMapping
    @Operation(summary = "Listar ou pesquisar autores")
    public ResponseEntity<List<AuthorResponseDTO>> listar(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(authorService.listarAutores(q));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar autor por ID")
    public ResponseEntity<AuthorResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(authorService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Cadastrar novo autor")
    public ResponseEntity<AuthorResponseDTO> cadastrar(@Valid @RequestBody AuthorRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authorService.cadastrarAutor(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar dados de um autor")
    public ResponseEntity<AuthorResponseDTO> atualizar(@PathVariable Integer id, @Valid @RequestBody AuthorRequestDTO dto) {
        return ResponseEntity.ok(authorService.atualizarAutor(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir um autor sem livros vinculados")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        authorService.excluirAutor(id);
        return ResponseEntity.noContent().build();
    }
}

