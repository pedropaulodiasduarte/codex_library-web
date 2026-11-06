package br.com.codex.books.mapper;

import br.com.codex.books.domain.Book;
import br.com.codex.books.domain.Location;
import br.com.codex.books.dto.BookRequestDTO;
import br.com.codex.books.dto.BookResponseDTO;
import br.com.codex.books.dto.LocationDTO;
import br.com.codex.shared.validation.DocumentValidatorUtil;
import org.springframework.stereotype.Component;

@Component
public class BookMapper {

    public Book toEntity(BookRequestDTO dto) {
        return new Book(
                null,
                dto.titulo().trim(),
                dto.autor().trim(),
                DocumentValidatorUtil.normalizeIsbn(dto.isbnCodigo()),
                dto.idioma().trim(),
                dto.editora().trim(),
                dto.dataPublicacao(),
                dto.copia(),
                dto.genero().trim(),
                dto.idLocalizacao()
        );
    }

    public BookResponseDTO toResponse(Book book, Location location, int emprestimosAtivos) {
        int disponiveis = Math.max(0, book.getCopia() - emprestimosAtivos);
        String descLoc = location != null
                ? location.getDescricaoFormatada()
                : "Localização #" + book.getIdLocalizacao();

        return new BookResponseDTO(
                book.getId(),
                book.getTitulo(),
                book.getAutor(),
                book.getIsbnCodigo(),
                book.getIdioma(),
                book.getEditora(),
                book.getDataPublicacao(),
                book.getCopia(),
                disponiveis,
                book.getGenero(),
                book.getIdLocalizacao(),
                descLoc
        );
    }

    public LocationDTO toLocationDTO(Location loc) {
        return new LocationDTO(
                loc.getId(),
                loc.getCorredor(),
                loc.getPrateleira(),
                loc.getEstante(),
                loc.getSala(),
                loc.getAndar(),
                loc.getDescricaoFormatada()
        );
    }
}

