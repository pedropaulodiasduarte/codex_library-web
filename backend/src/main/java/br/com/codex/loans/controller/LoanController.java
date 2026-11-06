package br.com.codex.loans.controller;

import br.com.codex.loans.dto.DashboardStatsDTO;
import br.com.codex.loans.dto.LoanRequestDTO;
import br.com.codex.loans.dto.LoanResponseDTO;
import br.com.codex.loans.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@Tag(name = "Empréstimos e Devoluções", description = "Gerenciamento de empréstimos, devoluções, renovações e indicadores da biblioteca")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @GetMapping
    @Operation(summary = "Listar empréstimos com filtro opcional por status (Ativo, Atrasado, Devolvido) e termo de busca")
    public ResponseEntity<List<LoanResponseDTO>> listar(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q
    ) {
        return ResponseEntity.ok(loanService.listarEmprestimos(status, q));
    }

    @GetMapping("/member/{cpf}")
    @Operation(summary = "Consultar histórico de empréstimos de um leitor pelo CPF")
    public ResponseEntity<List<LoanResponseDTO>> listarPorCpf(@PathVariable String cpf) {
        return ResponseEntity.ok(loanService.listarPorCpfLeitor(cpf));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Obter indicadores consolidados para a Tela Inicial (Dashboard)")
    public ResponseEntity<DashboardStatsDTO> obterDashboard() {
        return ResponseEntity.ok(loanService.obterEstatisticasDashboard());
    }

    @PostMapping
    @Operation(summary = "Registrar um novo empréstimo de livro")
    public ResponseEntity<LoanResponseDTO> registrar(@Valid @RequestBody LoanRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(loanService.registrarEmprestimo(dto));
    }

    @PatchMapping("/{id}/return")
    @Operation(summary = "Aprovar entrega / devolução de um livro emprestado")
    public ResponseEntity<LoanResponseDTO> aprovarEntrega(@PathVariable Integer id) {
        return ResponseEntity.ok(loanService.aprovarDevolucao(id));
    }

    @PatchMapping("/{id}/extend")
    @Operation(summary = "Adicionar tempo extra (renovar por +5 dias padrão) ao empréstimo")
    public ResponseEntity<LoanResponseDTO> adicionarTempoExtra(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "5") int days
    ) {
        return ResponseEntity.ok(loanService.prorrogarEmprestimo(id, days));
    }
}

