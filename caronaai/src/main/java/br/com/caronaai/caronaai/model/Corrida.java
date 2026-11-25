package br.com.caronaai.caronaai.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "corrida")
public class Corrida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_corrida")
    private Long idCorrida;

    @Column(name = "id_motorista")
    private Long idMotorista;

    @Column(name = "origem_endereco", nullable = false, columnDefinition = "TEXT")
    private String origemEndereco;

    @Column(name = "destino_endereco", nullable = false, columnDefinition = "TEXT")
    private String destinoEndereco;

    @Column(name = "data_hora_partida", nullable = false)
    private LocalDateTime dataHoraPartida;

    @Column(name = "valor_total", nullable = false)
    private BigDecimal valorTotal;

    private Integer vagas = 1;

    @Column(length = 20)
    private String status = "aberta";

    public Corrida() {}

    public Long getIdCorrida() { return idCorrida; }
    public void setIdCorrida(Long idCorrida) { this.idCorrida = idCorrida; }

    public Long getIdMotorista() { return idMotorista; }
    public void setIdMotorista(Long idMotorista) { this.idMotorista = idMotorista; }

    public String getOrigemEndereco() { return origemEndereco; }
    public void setOrigemEndereco(String origemEndereco) { this.origemEndereco = origemEndereco; }

    public String getDestinoEndereco() { return destinoEndereco; }
    public void setDestinoEndereco(String destinoEndereco) { this.destinoEndereco = destinoEndereco; }

    public LocalDateTime getDataHoraPartida() { return dataHoraPartida; }
    public void setDataHoraPartida(LocalDateTime dataHoraPartida) { this.dataHoraPartida = dataHoraPartida; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }

    public Integer getVagas() { return vagas; }
    public void setVagas(Integer vagas) { this.vagas = vagas; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}