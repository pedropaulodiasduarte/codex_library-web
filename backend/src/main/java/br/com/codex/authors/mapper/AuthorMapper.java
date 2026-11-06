package br.com.codex.authors.mapper;

import br.com.codex.authors.domain.Author;
import br.com.codex.authors.dto.AuthorRequestDTO;
import br.com.codex.authors.dto.AuthorResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class AuthorMapper {

    public Author toEntity(AuthorRequestDTO dto) {
        return new Author(
                null,
                dto.nome().trim(),
                dto.nacionalidade() != null ? dto.nacionalidade().trim() : "Não informada",
                dto.biografia() != null ? dto.biografia().trim() : ""
        );
    }

    public AuthorResponseDTO toResponse(Author entity, long totalLivros) {
        return new AuthorResponseDTO(
                entity.getId(),
                entity.getNome(),
                entity.getNacionalidade(),
                entity.getBiografia(),
                totalLivros
        );
    }
}

