package br.com.codex.books.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "localizacao")
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "corredor", nullable = false)
    private int corredor;

    @Column(name = "prateleira", nullable = false)
    private int prateleira;

    @Column(name = "estante", nullable = false)
    private int estante;

    @Column(name = "sala", nullable = false)
    private int sala;

    @Column(name = "andar", nullable = false)
    private int andar;

    public Location() {
    }

    public Location(Integer id, int corredor, int prateleira, int estante, int sala, int andar) {
        this.id = id;
        this.corredor = corredor;
        this.prateleira = prateleira;
        this.estante = estante;
        this.sala = sala;
        this.andar = andar;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public int getCorredor() {
        return corredor;
    }

    public void setCorredor(int corredor) {
        this.corredor = corredor;
    }

    public int getPrateleira() {
        return prateleira;
    }

    public void setPrateleira(int prateleira) {
        this.prateleira = prateleira;
    }

    public int getEstante() {
        return estante;
    }

    public void setEstante(int estante) {
        this.estante = estante;
    }

    public int getSala() {
        return sala;
    }

    public void setSala(int sala) {
        this.sala = sala;
    }

    public int getAndar() {
        return andar;
    }

    public void setAndar(int andar) {
        this.andar = andar;
    }

    public String getDescricaoFormatada() {
        return String.format("Andar %d, Sala %d, Corredor %d, Estante %d, Prateleira %d",
                andar, sala, corredor, estante, prateleira);
    }
}

