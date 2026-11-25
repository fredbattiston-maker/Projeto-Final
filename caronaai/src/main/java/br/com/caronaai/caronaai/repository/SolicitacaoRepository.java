package br.com.caronaai.caronaai.repository;

import br.com.caronaai.caronaai.model.Solicitacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {
    List<Solicitacao> findByIdPassageiroOrderByCriadoEmDesc(Long idPassageiro);
    List<Solicitacao> findByIdCorridaInOrderByCriadoEmDesc(Collection<Long> ids);
    boolean existsByIdCorridaAndIdPassageiroAndStatusIn(Long idCorrida, Long idPassageiro, Collection<String> status);
}
