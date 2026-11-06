package br.com.codex.loans.dto;

import br.com.codex.shared.validation.ValidCpf;
import br.com.codex.shared.validation.ValidIsbn;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record LoanRequestDTO(
        @NotBlank(message = "O campo do código ISBN é obrigatório.")
        @ValidIsbn
        String isbnCodigo,

        @NotBlank(message = "O campo CPF do Leitor é obrigatório.")
        @ValidCpf
        String cpfLeitor,

        @NotNull(message = "A Data de Empréstimo é obrigatória.")
        LocalDate dataEmprestimo,

        LocalDate dataDevolucao
) {}

