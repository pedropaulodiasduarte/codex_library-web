package br.com.codex.books.dto;

import br.com.codex.shared.validation.ValidIsbn;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record BookRequestDTO(
        @NotBlank(message = "O título do livro é obrigatório.")
        @Size(max = 80, message = "O título deve ter no máximo 80 caracteres.")
        String titulo,

        @NotBlank(message = "O nome do autor é obrigatório.")
        @Size(max = 80, message = "O autor deve ter no máximo 80 caracteres.")
        String autor,

        @NotBlank(message = "O código ISBN é obrigatório.")
        @ValidIsbn
        String isbnCodigo,

        @NotBlank(message = "O idioma é obrigatório.")
        @Size(max = 35, message = "O idioma deve ter no máximo 35 caracteres.")
        String idioma,

        @NotBlank(message = "A editora é obrigatória.")
        @Size(max = 100, message = "A editora deve ter no máximo 100 caracteres.")
        String editora,

        @NotNull(message = "A data de publicação é obrigatória.")
        LocalDate dataPublicacao,

        @Min(value = 0, message = "A quantidade de cópias não pode ser negativa.")
        int copia,

        @NotBlank(message = "O gênero literário é obrigatório.")
        @Size(max = 50, message = "O gênero deve ter no máximo 50 caracteres.")
        String genero,

        @NotNull(message = "O código de localização é obrigatório.")
        @Min(value = 1, message = "O ID de localização deve ser válido.")
        Integer idLocalizacao
) {}

