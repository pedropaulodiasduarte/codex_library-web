package br.com.codex.loans.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "emprestimo")
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "isbncodigofk", nullable = false, length = 20)
    private String isbnCodigo;

    @Column(name = "cpffk", nullable = false, length = 14)
    private String cpfLeitor;

    @Column(name = "dataemprestimo", nullable = false)
    private LocalDate dataEmprestimo;

    @Column(name = "dataDevolucao", nullable = false)
    private LocalDate dataDevolucao;

    @Column(name = "status", nullable = false, length = 25)
    private String status;

    public Loan() {
    }

    public Loan(Integer id, String isbnCodigo, String cpfLeitor, LocalDate dataEmprestimo, LocalDate dataDevolucao, String status) {
        this.id = id;
        this.isbnCodigo = isbnCodigo;
        this.cpfLeitor = cpfLeitor;
        this.dataEmprestimo = dataEmprestimo;
        this.dataDevolucao = dataDevolucao;
        this.status = status;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getIsbnCodigo() {
        return isbnCodigo;
    }

    public void setIsbnCodigo(String isbnCodigo) {
        this.isbnCodigo = isbnCodigo;
    }

    public String getCpfLeitor() {
        return cpfLeitor;
    }

    public void setCpfLeitor(String cpfLeitor) {
        this.cpfLeitor = cpfLeitor;
    }

    public LocalDate getDataEmprestimo() {
        return dataEmprestimo;
    }

    public void setDataEmprestimo(LocalDate dataEmprestimo) {
        this.dataEmprestimo = dataEmprestimo;
    }

    public LocalDate getDataDevolucao() {
        return dataDevolucao;
    }

    public void setDataDevolucao(LocalDate dataDevolucao) {
        this.dataDevolucao = dataDevolucao;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

