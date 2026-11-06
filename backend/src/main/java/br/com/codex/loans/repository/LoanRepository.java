package br.com.codex.loans.repository;

import br.com.codex.loans.domain.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Integer> {

    List<Loan> findAllByOrderByDataEmprestimoDescIdDesc();

    List<Loan> findByStatusIgnoreCaseOrderByDataEmprestimoDescIdDesc(String status);

    List<Loan> findByCpfLeitorOrderByDataEmprestimoDescIdDesc(String cpfLeitor);

    Optional<Loan> findFirstByCpfLeitorOrderByDataEmprestimoDescIdDesc(String cpfLeitor);

    @Query("""
            SELECT COUNT(l) FROM Loan l
            WHERE l.isbnCodigo = :isbn
              AND LOWER(l.status) <> 'devolvido'
            """)
    int countActiveLoansByIsbn(@Param("isbn") String isbn);

    @Query("""
            SELECT COUNT(l) FROM Loan l
            WHERE l.cpfLeitor = :cpf
              AND LOWER(l.status) <> 'devolvido'
            """)
    int countActiveLoansByCpf(@Param("cpf") String cpf);
}

