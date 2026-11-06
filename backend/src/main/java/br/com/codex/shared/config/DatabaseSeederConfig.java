package br.com.codex.shared.config;

import br.com.codex.authors.domain.Author;
import br.com.codex.authors.repository.AuthorRepository;
import br.com.codex.books.domain.Book;
import br.com.codex.books.domain.Location;
import br.com.codex.books.repository.BookRepository;
import br.com.codex.books.repository.LocationRepository;
import br.com.codex.loans.domain.Loan;
import br.com.codex.loans.repository.LoanRepository;
import br.com.codex.members.domain.Member;
import br.com.codex.members.repository.MemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class DatabaseSeederConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeederConfig.class);

    @Bean
    CommandLineRunner seedDatabase(
            LocationRepository locationRepository,
            AuthorRepository authorRepository,
            BookRepository bookRepository,
            MemberRepository memberRepository,
            LoanRepository loanRepository
    ) {
        return args -> {
            if (locationRepository.count() == 0) {
                log.info("Populando localizações físicas iniciais...");
                for (int i = 1; i <= 15; i++) {
                    locationRepository.save(new Location(
                            null,
                            ((i - 1) % 5) + 1,
                            ((i - 1) % 4) + 1,
                            ((i - 1) / 3) + 1,
                            1,
                            1
                    ));
                }
            }

            if (bookRepository.count() == 0) {
                log.info("Populando acervo inicial de livros do Codex...");
                List<Book> initialBooks = List.of(
                        new Book(null, "Dom Quixote", "Miguel de Cervantes", "9788574480011", "Português", "Editora Clássica", LocalDate.of(1605, 1, 16), 10, "Romance Clássico", 1),
                        new Book(null, "A Metamorfose", "Franz Kafka", "9788574480028", "Português", "Companhia das Letras", LocalDate.of(1915, 12, 1), 10, "Ficção Filosófica", 1),
                        new Book(null, "1984", "George Orwell", "9788574480035", "Português", "Companhia das Letras", LocalDate.of(1949, 6, 8), 10, "Distopia", 2),
                        new Book(null, "Admirável Mundo Novo", "Aldous Huxley", "9788574480042", "Português", "Biblioteca Azul", LocalDate.of(1932, 10, 18), 10, "Distopia", 2),
                        new Book(null, "Cem Anos de Solidão", "Gabriel García Márquez", "9788574480066", "Espanhol", "Record", LocalDate.of(1967, 5, 30), 10, "Realismo Mágico", 3),
                        new Book(null, "Crime e Castigo", "Fiódor Dostoiévski", "9788574480080", "Português", "Editora 34", LocalDate.of(1866, 12, 1), 10, "Romance Psicológico", 4),
                        new Book(null, "O Senhor dos Anéis: A Sociedade do Anel", "J.R.R. Tolkien", "9788574480219", "Português", "HarperCollins", LocalDate.of(1954, 7, 29), 10, "Fantasia Épica", 5),
                        new Book(null, "O Hobbit", "J.R.R. Tolkien", "9788574480226", "Português", "HarperCollins", LocalDate.of(1937, 9, 21), 10, "Fantasia", 5),
                        new Book(null, "Memórias Póstumas de Brás Cubas", "Machado de Assis", "9788574480639", "Português", "Penguin Companhia", LocalDate.of(1881, 1, 1), 10, "Clássico Brasileiro", 6),
                        new Book(null, "A Hora da Estrela", "Clarice Lispector", "9788574480707", "Português", "Rocco", LocalDate.of(1977, 1, 1), 10, "Ficção Existencial", 7),
                        new Book(null, "Clean Code", "Robert C. Martin", "9788574481100", "Inglês", "Prentice Hall", LocalDate.of(2008, 8, 1), 10, "Tecnologia", 8),
                        new Book(null, "Algoritmos e Estruturas de Dados", "Thomas H. Cormen", "9788574481124", "Português", "Elsevier", LocalDate.of(2009, 1, 1), 10, "Tecnologia", 8)
                );
                bookRepository.saveAll(initialBooks);
            }

            if (authorRepository.count() == 0) {
                log.info("Sincronizando autores a partir do acervo...");
                bookRepository.findAll().stream()
                        .map(Book::getAutor)
                        .distinct()
                        .forEach(nome -> authorRepository.save(
                                new Author(null, nome, "Internacional / Brasil", "Autor catalogado no acervo da Biblioteca Codex.")
                        ));
            }

            if (memberRepository.count() == 0) {
                log.info("Populando leitores iniciais para demonstração...");
                List<Member> initialMembers = List.of(
                        new Member(null, "Ana Beatriz Silva", "52998224725", "Rua das Palmeiras, 120 - Centro", "(11) 98765-4321", "ana.silva@email.com"),
                        new Member(null, "Carlos Eduardo Mendes", "11144477735", "Av. Paulista, 1500 - Bela Vista", "(11) 99876-1234", "carlos.mendes@email.com"),
                        new Member(null, "Mariana Costa Oliveira", "12345678909", "Rua Sete de Setembro, 45 - Jardim", "(21) 97654-3210", "mariana.costa@email.com")
                );
                memberRepository.saveAll(initialMembers);
            }

            if (loanRepository.count() == 0) {
                log.info("Populando empréstimos iniciais...");
                LocalDate hoje = LocalDate.now();
                List<Loan> initialLoans = List.of(
                        new Loan(null, "9788574480219", "52998224725", hoje.minusDays(4), hoje.plusDays(6), "Ativo"),
                        new Loan(null, "9788574480035", "11144477735", hoje.minusDays(18), hoje.minusDays(5), "Atrasado"),
                        new Loan(null, "9788574480639", "12345678909", hoje.minusDays(20), hoje.minusDays(12), "Devolvido")
                );
                loanRepository.saveAll(initialLoans);
            }
        };
    }
}

