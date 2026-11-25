package br.com.caronaai.caronaai.repository;

import br.com.caronaai.caronaai.model.Veiculo;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {
}
