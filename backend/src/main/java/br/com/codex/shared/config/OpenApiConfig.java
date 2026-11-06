package br.com.codex.shared.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI codexOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Codex Web - API de Controle de Biblioteca")
                        .description("API RESTful do Monolito Modular para gerenciamento de acervo de livros, autores, localizações, membros (leitores) e empréstimos.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Equipe Codex")
                                .email("contato@codexbiblioteca.com.br"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}

