package br.com.caronaai.caronaai.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitacao")
public class Solicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitacao")
    private Long idSolicitacao;

    @Column(name = "id_corrida", nullable = false)
    private Long idCorrida;

    @Column(name = "id_passageiro", nullable = false)
    private Long idPassageiro;

    /** pendente | aceita | recusada | cancelada */
    @Column(length = 20)
    private String status = "pendente";

    @Column(name = "criado_em")
    private LocalDateTime criadoEm = LocalDateTime.now();

    public Solicitacao() {}

    public Long getIdSolicitacao() { return idSolicitacao; }
    public void setIdSolicitacao(Long v) { this.idSolicitacao = v; }
    public Long getIdCorrida() { return idCorrida; }
    public void setIdCorrida(Long v) { this.idCorrida = v; }
    public Long getIdPassageiro() { return idPassageiro; }
    public void setIdPassageiro(Long v) { this.idPassageiro = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime v) { this.criadoEm = v; }
}
