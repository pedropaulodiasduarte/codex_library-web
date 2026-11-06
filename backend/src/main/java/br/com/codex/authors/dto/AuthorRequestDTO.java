package br.com.codex.authors.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthorRequestDTO(
        @NotBlank(message = "O nome do autor é obrigatório.")
        @Size(max = 80, message = "O nome do autor deve ter no máximo 80 caracteres.")
        String nome,

        @Size(max = 50, message = "A nacionalidade deve ter no máximo 50 caracteres.")
        String nacionalidade,

        @Size(max = 1000, message = "A biografia deve ter no máximo 1000 caracteres.")
        String biografia
) {}

