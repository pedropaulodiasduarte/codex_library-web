package br.com.codex.members.controller;

import br.com.codex.members.dto.MemberRequestDTO;
import br.com.codex.members.dto.MemberResponseDTO;
import br.com.codex.members.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@Tag(name = "Membros / Leitores", description = "Gerenciamento de leitores (clientes) da biblioteca")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    @Operation(summary = "Listar todos os leitores com status do último empréstimo ou filtrar por termo")
    public ResponseEntity<List<MemberResponseDTO>> listar(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(memberService.listarLeitores(q));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar detalhes de um leitor por ID")
    public ResponseEntity<MemberResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(memberService.buscarPorId(id));
    }

    @GetMapping("/cpf/{cpf}")
    @Operation(summary = "Buscar detalhes de um leitor pelo CPF")
    public ResponseEntity<MemberResponseDTO> buscarPorCpf(@PathVariable String cpf) {
        return ResponseEntity.ok(memberService.buscarPorCpf(cpf));
    }

    @PostMapping
    @Operation(summary = "Cadastrar novo leitor")
    public ResponseEntity<MemberResponseDTO> cadastrar(@Valid @RequestBody MemberRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(memberService.cadastrarLeitor(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar dados de um leitor")
    public ResponseEntity<MemberResponseDTO> atualizar(@PathVariable Integer id, @Valid @RequestBody MemberRequestDTO dto) {
        return ResponseEntity.ok(memberService.atualizarLeitor(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir um leitor sem empréstimos pendentes")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        memberService.excluirLeitor(id);
        return ResponseEntity.noContent().build();
    }
}

