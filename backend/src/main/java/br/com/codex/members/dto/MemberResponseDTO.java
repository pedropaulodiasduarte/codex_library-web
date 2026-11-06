package br.com.codex.members.dto;

public record MemberResponseDTO(
        Integer id,
        String nome,
        String cpf,
        String endereco,
        String telefone,
        String email,
        String statusUltimoEmprestimo,
        int emprestimosAtivosCount
) {}

