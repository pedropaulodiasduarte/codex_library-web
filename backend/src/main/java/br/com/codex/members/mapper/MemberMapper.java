package br.com.codex.members.mapper;

import br.com.codex.members.domain.Member;
import br.com.codex.members.dto.MemberRequestDTO;
import br.com.codex.members.dto.MemberResponseDTO;
import br.com.codex.shared.validation.DocumentValidatorUtil;
import org.springframework.stereotype.Component;

@Component
public class MemberMapper {

    public Member toEntity(MemberRequestDTO dto) {
        return new Member(
                null,
                dto.nome().trim(),
                DocumentValidatorUtil.normalizeDigits(dto.cpf()),
                dto.endereco().trim(),
                dto.telefone().trim(),
                dto.email().trim()
        );
    }

    public MemberResponseDTO toResponse(Member member, String statusUltimoEmprestimo, int emprestimosAtivosCount) {
        return new MemberResponseDTO(
                member.getId(),
                member.getNome(),
                member.getCpf(),
                member.getEndereco(),
                member.getTelefone(),
                member.getEmail(),
                statusUltimoEmprestimo != null ? statusUltimoEmprestimo : "Não há registro",
                emprestimosAtivosCount
        );
    }
}

