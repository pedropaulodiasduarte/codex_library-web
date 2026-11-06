package br.com.codex.books.repository;

import br.com.codex.books.domain.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {

    Optional<Book> findByIsbnCodigo(String isbnCodigo);

    boolean existsByIsbnCodigo(String isbnCodigo);

    long countByAutorIgnoreCase(String autor);

    @Query("""
            SELECT b FROM Book b
            WHERE LOWER(b.titulo) LIKE LOWER(CONCAT('%', :termo, '%'))
               OR LOWER(b.autor) LIKE LOWER(CONCAT('%', :termo, '%'))
               OR LOWER(b.genero) LIKE LOWER(CONCAT('%', :termo, '%'))
               OR LOWER(b.isbnCodigo) LIKE LOWER(CONCAT('%', :termo, '%'))
               OR LOWER(b.editora) LIKE LOWER(CONCAT('%', :termo, '%'))
            ORDER BY b.titulo ASC
            """)
    List<Book> pesquisarAcervo(@Param("termo") String termo);

    List<Book> findAllByOrderByTituloAsc();
}

