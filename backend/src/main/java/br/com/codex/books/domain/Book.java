package br.com.codex.books.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "livro")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "titulo", nullable = false, length = 80)
    private String titulo;

    @Column(name = "autor", nullable = false, length = 80)
    private String autor;

    @Column(name = "isbnCodigo", nullable = false, unique = true, length = 20)
    private String isbnCodigo;

    @Column(name = "idioma", nullable = false, length = 35)
    private String idioma;

    @Column(name = "editora", nullable = false, length = 100)
    private String editora;

    @Column(name = "dataPublicacao", nullable = false)
    private LocalDate dataPublicacao;

    @Column(name = "copia", nullable = false)
    private int copia;

    @Column(name = "genero", nullable = false, length = 50)
    private String genero;

    @Column(name = "idLocalizacao", nullable = false)
    private Integer idLocalizacao;

    public Book() {
    }

    public Book(Integer id, String titulo, String autor, String isbnCodigo, String idioma, String editora, LocalDate dataPublicacao, int copia, String genero, Integer idLocalizacao) {
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.isbnCodigo = isbnCodigo;
        this.idioma = idioma;
        this.editora = editora;
        this.dataPublicacao = dataPublicacao;
        this.copia = copia;
        this.genero = genero;
        this.idLocalizacao = idLocalizacao;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public String getIsbnCodigo() {
        return isbnCodigo;
    }

    public void setIsbnCodigo(String isbnCodigo) {
        this.isbnCodigo = isbnCodigo;
    }

    public String getIdioma() {
        return idioma;
    }

    public void setIdioma(String idioma) {
        this.idioma = idioma;
    }

    public String getEditora() {
        return editora;
    }

    public void setEditora(String editora) {
        this.editora = editora;
    }

    public LocalDate getDataPublicacao() {
        return dataPublicacao;
    }

    public void setDataPublicacao(LocalDate dataPublicacao) {
        this.dataPublicacao = dataPublicacao;
    }

    public int getCopia() {
        return copia;
    }

    public void setCopia(int copia) {
        this.copia = copia;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public Integer getIdLocalizacao() {
        return idLocalizacao;
    }

    public void setIdLocalizacao(Integer idLocalizacao) {
        this.idLocalizacao = idLocalizacao;
    }
}

