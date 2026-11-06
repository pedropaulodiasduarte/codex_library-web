package br.com.codex;

import br.com.codex.shared.validation.DocumentValidatorUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev-h2")
class CodexWebApplicationTests {

    @Test
    @DisplayName("Deve subir o contexto do Monolito Modular Spring Boot com sucesso")
    void contextLoads() {
    }

    @Test
    @DisplayName("Deve validar CPF e ISBN conforme regras legadas do ValidadorUtil")
    void testValidators() {
        assertTrue(DocumentValidatorUtil.isCpfValido("52998224725"));
        assertTrue(DocumentValidatorUtil.isCpfValido("111.444.777-35"));
        assertFalse(DocumentValidatorUtil.isCpfValido("11111111111"));
        assertFalse(DocumentValidatorUtil.isCpfValido("12345678900"));

        assertTrue(DocumentValidatorUtil.isIsbnValido("9788574480011"));
        assertTrue(DocumentValidatorUtil.isIsbnValido("978-8574480219"));
        assertFalse(DocumentValidatorUtil.isIsbnValido("9788574480019"));
    }
}

