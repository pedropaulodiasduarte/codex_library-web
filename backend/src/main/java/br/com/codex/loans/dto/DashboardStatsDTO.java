package br.com.codex.loans.dto;

import java.util.List;

public record DashboardStatsDTO(
        long totalTitulos,
        long totalExemplares,
        long exemplaresDisponiveis,
        long totalLeitores,
        long totalAutores,
        long emprestimosAtivos,
        long emprestimosAtrasados,
        long emprestimosDevolvidos,
        List<LoanResponseDTO> emprestimosRecentes
) {}

