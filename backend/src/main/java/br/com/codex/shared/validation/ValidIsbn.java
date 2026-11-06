package br.com.codex.shared.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = IsbnConstraintValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidIsbn {
    String message() default "O código ISBN informado não é válido (deve ser ISBN-10 ou ISBN-13 com dígito verificador válido).";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

