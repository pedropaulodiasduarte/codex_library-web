package br.com.codex.members.repository;

import br.com.codex.members.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {

    Optional<Member> findByCpf(String cpf);

    boolean existsByCpf(String cpf);

    @Query("""
            SELECT m FROM Member m
            WHERE LOWER(m.nome) LIKE LOWER(CONCAT('%', :termo, '%'))
               OR m.cpf LIKE CONCAT('%', :termo, '%')
               OR LOWER(m.email) LIKE LOWER(CONCAT('%', :termo, '%'))
            ORDER BY m.nome ASC
            """)
    List<Member> pesquisarLeitores(@Param("termo") String termo);

    List<Member> findAllByOrderByNomeAsc();
}

