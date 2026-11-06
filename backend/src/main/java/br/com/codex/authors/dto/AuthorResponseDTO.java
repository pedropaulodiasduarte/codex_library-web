package br.com.codex.authors.dto;

public record AuthorResponseDTO(
        Integer id,
        String nome,
        String nacionalidade,
        String biografia,
        long totalLivrosNoAcervo
) {}

