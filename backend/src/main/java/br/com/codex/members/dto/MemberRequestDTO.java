package br.com.codex.members.dto;

import br.com.codex.shared.validation.ValidCpf;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MemberRequestDTO(
        @NotBlank(message = "O campo NOME é obrigatório e deve ser preenchido.")
        @Size(max = 50, message = "O nome deve ter no máximo 50 caracteres.")
        String nome,

        @NotBlank(message = "O campo CPF é obrigatório e deve ser preenchido.")
        @ValidCpf
        String cpf,

        @NotBlank(message = "O campo ENDEREÇO é obrigatório e deve ser preenchido.")
        String endereco,

        @NotBlank(message = "O campo TELEFONE é obrigatório e deve ser preenchido.")
        @Size(max = 18, message = "O telefone deve ter no máximo 18 caracteres.")
        String telefone,

        @NotBlank(message = "O campo E-MAIL é obrigatório e deve ser preenchido.")
        @Email(message = "O formato do e-mail informado é inválido.")
        @Size(max = 70, message = "O e-mail deve ter no máximo 70 caracteres.")
        String email
) {}

