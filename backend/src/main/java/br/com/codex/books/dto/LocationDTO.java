package br.com.codex.books.dto;

import jakarta.validation.constraints.Min;

public record LocationDTO(
        Integer id,
        @Min(value = 1, message = "O corredor deve ser maior ou igual a 1.") int corredor,
        @Min(value = 1, message = "A prateleira deve ser maior ou igual a 1.") int prateleira,
        @Min(value = 1, message = "A estante deve ser maior ou igual a 1.") int estante,
        @Min(value = 1, message = "A sala deve ser maior ou igual a 1.") int sala,
        @Min(value = 0, message = "O andar não pode ser negativo.") int andar,
        String descricaoFormatada
) {}

