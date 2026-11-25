package br.com.caronaai.caronaai.repository;

import br.com.caronaai.caronaai.model.Corrida;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CorridaRepository extends JpaRepository<Corrida, Long> {
    List<Corrida> findByIdMotoristaOrderByDataHoraPartidaDesc(Long idMotorista);
}
