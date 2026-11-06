package br.com.codex.books.dto;

import java.time.LocalDate;

public record BookResponseDTO(
        Integer id,
        String titulo,
        String autor,
        String isbnCodigo,
        String idioma,
        String editora,
        LocalDate dataPublicacao,
        int copia,
        int copiasDisponiveis,
        String genero,
        Integer idLocalizacao,
        String descricaoLocalizacao
) {}

