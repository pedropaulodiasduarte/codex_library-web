package br.com.codex.members.service;

import br.com.codex.loans.domain.Loan;
import br.com.codex.loans.repository.LoanRepository;
import br.com.codex.members.domain.Member;
import br.com.codex.members.dto.MemberRequestDTO;
import br.com.codex.members.dto.MemberResponseDTO;
import br.com.codex.members.mapper.MemberMapper;
import br.com.codex.members.repository.MemberRepository;
import br.com.codex.shared.exception.BusinessRuleException;
import br.com.codex.shared.exception.ResourceNotFoundException;
import br.com.codex.shared.validation.DocumentValidatorUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final LoanRepository loanRepository;
    private final MemberMapper memberMapper;

    public MemberService(MemberRepository memberRepository, LoanRepository loanRepository, MemberMapper memberMapper) {
        this.memberRepository = memberRepository;
        this.loanRepository = loanRepository;
        this.memberMapper = memberMapper;
    }

    @Transactional(readOnly = true)
    public List<MemberResponseDTO> listarLeitores(String pesquisa) {
        List<Member> members = (pesquisa == null || pesquisa.isBlank())
                ? memberRepository.findAllByOrderByNomeAsc()
                : memberRepository.pesquisarLeitores(pesquisa.trim());

        return members.stream()
                .map(this::enrichMemberResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MemberResponseDTO buscarPorId(Integer id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leitor não encontrado com ID: " + id));
        return enrichMemberResponse(member);
    }

    @Transactional(readOnly = true)
    public MemberResponseDTO buscarPorCpf(String cpf) {
        String cleanCpf = DocumentValidatorUtil.normalizeDigits(cpf);
        Member member = memberRepository.findByCpf(cleanCpf)
                .orElseThrow(() -> new ResourceNotFoundException("Leitor não encontrado com CPF: " + cleanCpf));
        return enrichMemberResponse(member);
    }

    @Transactional
    public MemberResponseDTO cadastrarLeitor(MemberRequestDTO dto) {
        String cleanCpf = DocumentValidatorUtil.normalizeDigits(dto.cpf());
        if (memberRepository.existsByCpf(cleanCpf)) {
            throw new BusinessRuleException("Já existe um leitor cadastrado com o CPF: " + cleanCpf);
        }

        Member saved = memberRepository.save(memberMapper.toEntity(dto));
        return memberMapper.toResponse(saved, "Não há registro", 0);
    }

    @Transactional
    public MemberResponseDTO atualizarLeitor(Integer id, MemberRequestDTO dto) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leitor não encontrado com ID: " + id));

        String cleanCpf = DocumentValidatorUtil.normalizeDigits(dto.cpf());
        memberRepository.findByCpf(cleanCpf)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessRuleException("Já existe outro leitor cadastrado com o CPF: " + cleanCpf);
                });

        member.setNome(dto.nome().trim());
        member.setCpf(cleanCpf);
        member.setEndereco(dto.endereco().trim());
        member.setTelefone(dto.telefone().trim());
        member.setEmail(dto.email().trim());

        Member updated = memberRepository.save(member);
        return enrichMemberResponse(updated);
    }

    @Transactional
    public void excluirLeitor(Integer id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leitor não encontrado com ID: " + id));

        int ativos = loanRepository.countActiveLoansByCpf(member.getCpf());
        if (ativos > 0) {
            throw new BusinessRuleException("Não é possível excluir o leitor '" + member.getNome() + "' pois possui " + ativos + " empréstimo(s) pendente(s).");
        }

        memberRepository.delete(member);
    }

    private MemberResponseDTO enrichMemberResponse(Member member) {
        String ultimoStatus = loanRepository.findFirstByCpfLeitorOrderByDataEmprestimoDescIdDesc(member.getCpf())
                .map(this::resolveEffectiveStatus)
                .orElse("Não há registro");
        int ativos = loanRepository.countActiveLoansByCpf(member.getCpf());
        return memberMapper.toResponse(member, ultimoStatus, ativos);
    }

    private String resolveEffectiveStatus(Loan loan) {
        if (!"Devolvido".equalsIgnoreCase(loan.getStatus()) && loan.getDataDevolucao().isBefore(LocalDate.now())) {
            return "Atrasado";
        }
        return loan.getStatus();
    }
}

