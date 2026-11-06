package br.com.codex.authors.service;

import br.com.codex.authors.domain.Author;
import br.com.codex.authors.dto.AuthorRequestDTO;
import br.com.codex.authors.dto.AuthorResponseDTO;
import br.com.codex.authors.mapper.AuthorMapper;
import br.com.codex.authors.repository.AuthorRepository;
import br.com.codex.books.repository.BookRepository;
import br.com.codex.shared.exception.BusinessRuleException;
import br.com.codex.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final BookRepository bookRepository;
    private final AuthorMapper authorMapper;

    public AuthorService(AuthorRepository authorRepository, BookRepository bookRepository, AuthorMapper authorMapper) {
        this.authorRepository = authorRepository;
        this.bookRepository = bookRepository;
        this.authorMapper = authorMapper;
    }

    @Transactional(readOnly = true)
    public List<AuthorResponseDTO> listarAutores(String pesquisa) {
        List<Author> authors = (pesquisa == null || pesquisa.isBlank())
                ? authorRepository.findAllByOrderByNomeAsc()
                : authorRepository.findByNomeContainingIgnoreCaseOrderByNomeAsc(pesquisa.trim());

        return authors.stream()
                .map(a -> authorMapper.toResponse(a, bookRepository.countByAutorIgnoreCase(a.getNome())))
                .toList();
    }

    @Transactional(readOnly = true)
    public AuthorResponseDTO buscarPorId(Integer id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Autor não encontrado com ID: " + id));
        return authorMapper.toResponse(author, bookRepository.countByAutorIgnoreCase(author.getNome()));
    }

    @Transactional
    public AuthorResponseDTO cadastrarAutor(AuthorRequestDTO dto) {
        authorRepository.findByNomeIgnoreCase(dto.nome().trim())
                .ifPresent(existing -> {
                    throw new BusinessRuleException("Já existe um autor cadastrado com o nome: " + existing.getNome());
                });

        Author saved = authorRepository.save(authorMapper.toEntity(dto));
        return authorMapper.toResponse(saved, bookRepository.countByAutorIgnoreCase(saved.getNome()));
    }

    @Transactional
    public AuthorResponseDTO atualizarAutor(Integer id, AuthorRequestDTO dto) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Autor não encontrado com ID: " + id));

        authorRepository.findByNomeIgnoreCase(dto.nome().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessRuleException("Já existe outro autor cadastrado com o nome: " + existing.getNome());
                });

        author.setNome(dto.nome().trim());
        author.setNacionalidade(dto.nacionalidade() != null ? dto.nacionalidade().trim() : "Não informada");
        author.setBiografia(dto.biografia() != null ? dto.biografia().trim() : "");

        Author updated = authorRepository.save(author);
        return authorMapper.toResponse(updated, bookRepository.countByAutorIgnoreCase(updated.getNome()));
    }

    @Transactional
    public void excluirAutor(Integer id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Autor não encontrado com ID: " + id));

        long livrosVinculados = bookRepository.countByAutorIgnoreCase(author.getNome());
        if (livrosVinculados > 0) {
            throw new BusinessRuleException("Não é possível excluir o autor '" + author.getNome() + "' pois existem " + livrosVinculados + " livro(s) vinculado(s) no acervo.");
        }
        authorRepository.delete(author);
    }

    @Transactional
    public void sincronizarAutorPeloNome(String nomeAutor) {
        if (nomeAutor == null || nomeAutor.isBlank()) return;
        String cleanName = nomeAutor.trim();
        if (authorRepository.findByNomeIgnoreCase(cleanName).isEmpty()) {
            authorRepository.save(new Author(null, cleanName, "Não informada", "Autor sincronizado a partir do acervo da biblioteca."));
        }
    }
}

