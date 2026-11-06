package br.com.codex.shared.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = CpfConstraintValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCpf {
    String message() default "O CPF informado é inválido (verifique os 11 dígitos e o dígito verificador).";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

