# Relatório de Migração e Arquitetura — Codex Web

A migração do sistema desktop legado **Codex Controle de Biblioteca** (`JavaFX / FXML + JDBC puro`) para a nova arquitetura web moderna em **Monolito Modular** (`Spring Boot 3.4 + Java 21` e `Angular 18 Standalone + Acessibilidade WCAG 2.1 AA/AAA`) foi concluída em `C:\Projetos\codex\codex_web`.

---

## 1. Diagnóstico e Mapeamento do Legado (`codex_controle_de_biblioteca`)

Durante a análise do código-fonte e scripts SQL do projeto de origem, foram mapeados e migrados todos os elementos de domínio, consultas e regras de negócio:

* **Banco de Dados ([`scripts banco.txt`](file:///C:/Projetos/codex/codex_controle_de_biblioteca/documentos%20do%20projeto/scripts%20banco.txt) e [`ConectaDatabase`](file:///C:/Projetos/codex/codex_controle_de_biblioteca/src/main/java/br/com/codexcb/application/dao/ConectaDatabase.java)):**
  * Esquema MySQL `codexcb` com as tabelas `leitor`, `localizacao`, `livro` (com chave única em `isbnCodigo` e FK `idLocalizacao`) e `emprestimo` (relacionando `isbncodigofk` → `livro.isbnCodigo` e `cpffk` → `leitor.cpf`).
* **Consultas SQL e Regras de Negócio ([`LivroDAO`](file:///C:/Projetos/codex/codex_controle_de_biblioteca/src/main/java/br/com/codexcb/application/dao/LivroDAO.java), [`LeitorDAO`](file:///C:/Projetos/codex/codex_controle_de_biblioteca/src/main/java/br/com/codexcb/application/dao/LeitorDAO.java), [`EmprestimoDAO`](file:///C:/Projetos/codex/codex_controle_de_biblioteca/src/main/java/br/com/codexcb/application/dao/EmprestimoDAO.java)):**
  * Consulta consolidada de leitores com subquery do último status de empréstimo (`COALESCE(..., 'Não há registro')`).
  * Cálculo automático da data de devolução prevista para **+10 dias** a partir da data do empréstimo ([`CadastrarEmprestimoController`](file:///C:/Projetos/codex/codex_controle_de_biblioteca/src/main/java/br/com/codexcb/application/view/CadastrarEmprestimoController.java#L160-L170)).
  * Ações rápidas de **Aprovar Entrega** (atualiza status para `Devolvido` na data atual) e **Adicionar Tempo Extra** (prorroga o empréstimo em **+5 dias** mantendo status `Ativo`, conforme [`GerenciarEmprestimoController`](file:///C:/Projetos/codex/codex_controle_de_biblioteca/src/main/java/br/com/codexcb/application/view/GerenciarEmprestimoController.java#L109-L140)).
  * Validações matemáticas de dígitos verificadores de **CPF** (11 dígitos) e **ISBN-10 / ISBN-13** ([`ValidadorUtil`](file:///C:/Projetos/codex/codex_controle_de_biblioteca/src/main/java/br/com/codexcb/application/utilitarios/ValidadorUtil.java)).
  * Correção de um bug lógico presente no legado em [`CadastrarLeitorController`](file:///C:/Projetos/codex/codex_controle_de_biblioteca/src/main/java/br/com/codexcb/application/view/CadastrarLeitorController.java#L45) (`if (insertLeitor(...) || validaDados() == false)`), que tentava inserir no banco antes de validar os campos obrigatórios.

---

## 2. Arquitetura do Backend (`Spring Boot 3 + Java 21`)

Estruturado como um **Monolito Modular** em [`backend/pom.xml`](file:///C:/Projetos/codex/codex_web/backend/pom.xml), separando claramente os domínios de negócio e utilizando *Java 21 Records* para DTOs e *Switch Expressions*:

* **Módulo `books` (`br.com.codex.books`):**
  * Entidades JPA [`Book`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/books/domain/Book.java) (`livro`) e [`Location`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/books/domain/Location.java) (`localizacao`), [`BookRepository`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/books/repository/BookRepository.java), [`BookService`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/books/service/BookService.java) e [`BookController`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/books/controller/BookController.java) (`/api/books`). Calcula em tempo real os exemplares disponíveis descontando os empréstimos ativos/atrasados.
* **Módulo `authors` (`br.com.codex.authors`):**
  * Entidade [`Author`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/authors/domain/Author.java) (`autor`), [`AuthorService`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/authors/service/AuthorService.java) e [`AuthorController`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/authors/controller/AuthorController.java) (`/api/authors`), com sincronização automática de autores ao cadastrar/atualizar livros e contagem de obras no acervo.
* **Módulo `members` (`br.com.codex.members`):**
  * Entidade [`Member`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/members/domain/Member.java) (`leitor`), [`MemberService`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/members/service/MemberService.java) e [`MemberController`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/members/controller/MemberController.java) (`/api/members`), retornando o status do último empréstimo e impedindo exclusão caso o leitor possua empréstimos pendentes.
* **Módulo `loans` (`br.com.codex.loans`):**
  * Entidade [`Loan`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/loans/domain/Loan.java) (`emprestimo`), [`LoanService`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/loans/service/LoanService.java) e [`LoanController`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/loans/controller/LoanController.java) (`/api/loans`), incluindo sincronização automática de status `Atrasado`, validação de estoque disponível, endpoint de devolução (`PATCH /api/loans/{id}/return`), renovação (`PATCH /api/loans/{id}/extend`) e indicadores consolidados (`GET /api/loans/dashboard`).
* **Módulo `shared` (`br.com.codex.shared`):**
  * Tratamento global de erros em [`GlobalExceptionHandler`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/shared/exception/GlobalExceptionHandler.java) com payload padronizado [`ApiErrorResponse`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/shared/exception/ApiErrorResponse.java).
  * Anotações customizadas do Jakarta Bean Validation [`@ValidCpf`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/shared/validation/ValidCpf.java) e [`@ValidIsbn`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/shared/validation/ValidIsbn.java) apoiadas por [`DocumentValidatorUtil`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/shared/validation/DocumentValidatorUtil.java).
  * Configuração de CORS ([`CorsConfig`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/shared/config/CorsConfig.java)), Swagger/OpenAPI ([`OpenApiConfig`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/shared/config/OpenApiConfig.java)) e carga automática de dados iniciais ([`DatabaseSeederConfig`](file:///C:/Projetos/codex/codex_web/backend/src/main/java/br/com/codex/shared/config/DatabaseSeederConfig.java)).

---

## 3. Arquitetura do Frontend (`Angular 18 Standalone + Acessibilidade WCAG`)

Desenvolvido em `C:\Projetos\codex\codex_web\frontend` substituindo todas as telas FXML antigas por componentes acessíveis:

* **Conformidade Rigorosa com WCAG 2.1 AA / AAA e Leitores de Tela (NVDA, VoiceOver, JAWS):**
  * **Skip Link (`Pular para o conteúdo principal`)** e estrutura semântica HTML5 (`<header role="banner">`, `<nav aria-label="...">`, `<main id="main-content">`, `<footer role="contentinfo">`) em [`AppComponent`](file:///C:/Projetos/codex/codex_web/frontend/src/app/app.component.ts).
  * **Anúncios Dinâmicos (`aria-live`):** O serviço [`A11yAnnouncerService`](file:///C:/Projetos/codex/codex_web/frontend/src/app/core/services/a11y-announcer.service.ts) gerencia regiões `aria-live="polite"` e `aria-live="assertive"` além de controles globais de **Modo de Alto Contraste (WCAG AAA)** e **Ampliação de Fonte (`A+`)** estilizados em [`styles.css`](file:///C:/Projetos/codex/codex_web/frontend/src/styles.css).
  * **Telas e Componentes Standalone:**
    * [`DashboardComponent`](file:///C:/Projetos/codex/codex_web/frontend/src/app/features/dashboard/dashboard.component.ts): Substitui `telaprincipal-view.fxml` com KPIs dinâmicos em tempo real e tabela de movimentações recentes.
    * [`BooksComponent`](file:///C:/Projetos/codex/codex_web/frontend/src/app/features/books/books.component.ts): Substitui `acervo-view.fxml`, `cadastrarlivro-view.fxml` e `informacaolivro-view.fxml`.
    * [`MembersComponent`](file:///C:/Projetos/codex/codex_web/frontend/src/app/features/members/members.component.ts): Substitui `gerenciarclientes-view.fxml`, `cadastrarleitor-view.fxml` e `detalheleitor-view.fxml` (incluindo modal de histórico de empréstimos do leitor).
    * [`LoansComponent`](file:///C:/Projetos/codex/codex_web/frontend/src/app/features/loans/loans.component.ts): Substitui `gerenciaremprestimo-view.fxml` e `cadastraremprestimo-view.fxml`, com filtros acessíveis (`aria-pressed`), autocompletar de livros/leitores (`<datalist>`) e botões de aprovação/renovação com `aria-label` descritivo.
    * [`AuthorsComponent`](file:///C:/Projetos/codex/codex_web/frontend/src/app/features/authors/authors.component.ts): Interface dedicada para o módulo de autores.

---

## 4. Guia Passo a Passo para Compilar, Subir e Testar Localmente

### Passo 1: Iniciar o Backend (Spring Boot + Java 21)

1. Abra um terminal no diretório do backend:
   ```powershell
   cd C:\Projetos\codex\codex_web\backend
   ```
2. **Com MySQL local (`localhost:3306`, usuário `root`, senha `root`):**
   O banco `codexcb` e as tabelas são criados e populados automaticamente na primeira execução:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
   *(Alternativa rápida sem precisar do MySQL rodando: execute com o perfil H2 em memória em modo de compatibilidade MySQL)*:
   ```powershell
   .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev-h2"
   ```
3. Verifique a API e o Swagger UI no navegador:
   * **Endpoints REST:** http://localhost:8080/api/loans/dashboard
   * **Swagger UI (OpenAPI):** http://localhost:8080/swagger-ui.html

### Passo 2: Iniciar o Frontend (Angular)

1. Abra um **segundo terminal** no diretório do frontend:
   ```powershell
   cd C:\Projetos\codex\codex_web\frontend
   ```
2. Instale as dependências do Node.js e inicie o servidor Angular:
   ```powershell
   npm install
   npm start
   ```
3. Acesse a aplicação no navegador em **http://localhost:4200**.
