package br.com.codex.loans.dto;

import java.time.LocalDate;

public record LoanResponseDTO(
        Integer id,
        String isbnCodigo,
        String tituloLivro,
        String autorLivro,
        String cpfLeitor,
        String nomeLeitor,
        LocalDate dataEmprestimo,
        LocalDate dataDevolucao,
        String status,
        boolean atrasado
) {}

