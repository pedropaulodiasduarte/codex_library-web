package br.com.codex.authors.repository;

import br.com.codex.authors.domain.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Integer> {
    Optional<Author> findByNomeIgnoreCase(String nome);
    List<Author> findByNomeContainingIgnoreCaseOrderByNomeAsc(String nome);
    List<Author> findAllByOrderByNomeAsc();
}

