package br.com.caronaai.caronaai.controller;

import br.com.caronaai.caronaai.model.Corrida;
import br.com.caronaai.caronaai.model.Solicitacao;
import br.com.caronaai.caronaai.model.Usuario;
import br.com.caronaai.caronaai.repository.CorridaRepository;
import br.com.caronaai.caronaai.repository.SolicitacaoRepository;
import br.com.caronaai.caronaai.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/solicitacoes")
public class SolicitacaoController {

    private final SolicitacaoRepository solicitacoes;
    private final CorridaRepository corridas;
    private final UsuarioRepository usuarios;

    public SolicitacaoController(SolicitacaoRepository solicitacoes, CorridaRepository corridas,
                                 UsuarioRepository usuarios) {
        this.solicitacoes = solicitacoes;
        this.corridas = corridas;
        this.usuarios = usuarios;
    }

    private static Long toLong(Object o) {
        if (o == null) return null;
        try { return Long.valueOf(String.valueOf(o)); } catch (NumberFormatException e) { return null; }
    }

    private Map<String, Object> visao(Solicitacao s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idSolicitacao", s.getIdSolicitacao());
        m.put("idCorrida", s.getIdCorrida());
        m.put("idPassageiro", s.getIdPassageiro());
        m.put("status", s.getStatus());
        m.put("criadoEm", s.getCriadoEm());
        Usuario p = usuarios.findById(s.getIdPassageiro()).orElse(null);
        m.put("passageiroNome", p != null ? p.getNomeCompleto() : "Passageiro");
        m.put("passageiroNota", p != null ? p.getNotaMedia() : null);
        corridas.findById(s.getIdCorrida()).ifPresent(c -> m.put("corrida", CorridaController.visao(c, usuarios)));
        return m;
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Map<String, Object> body) {
        Long idCorrida = toLong(body.get("idCorrida"));
        Long idPassageiro = toLong(body.get("idPassageiro"));
        if (idCorrida == null || idPassageiro == null)
            return CorridaController.erro(HttpStatus.BAD_REQUEST, "Informe a carona e o passageiro.");
        Corrida c = corridas.findById(idCorrida).orElse(null);
        if (c == null) return CorridaController.erro(HttpStatus.NOT_FOUND, "Carona não encontrada.");
        if (idPassageiro.equals(c.getIdMotorista()))
            return CorridaController.erro(HttpStatus.BAD_REQUEST, "Você não pode pedir vaga na sua própria carona.");
        if (!"aberta".equals(c.getStatus()) || c.getVagas() == null || c.getVagas() < 1)
            return CorridaController.erro(HttpStatus.BAD_REQUEST, "Esta carona não tem mais vagas.");
        if (solicitacoes.existsByIdCorridaAndIdPassageiroAndStatusIn(idCorrida, idPassageiro, List.of("pendente", "aceita")))
            return CorridaController.erro(HttpStatus.BAD_REQUEST, "Você já solicitou vaga nesta carona.");
        Solicitacao s = new Solicitacao();
        s.setIdCorrida(idCorrida);
        s.setIdPassageiro(idPassageiro);
        return ResponseEntity.status(HttpStatus.CREATED).body(visao(solicitacoes.save(s)));
    }

    /** ?passageiro=ID  → minhas viagens | ?motorista=ID → pedidos recebidos nas minhas caronas */
    @GetMapping
    public List<Map<String, Object>> listar(@RequestParam(required = false) Long passageiro,
                                            @RequestParam(required = false) Long motorista) {
        if (passageiro != null)
            return solicitacoes.findByIdPassageiroOrderByCriadoEmDesc(passageiro).stream().map(this::visao).toList();
        if (motorista != null) {
            List<Long> ids = corridas.findByIdMotoristaOrderByDataHoraPartidaDesc(motorista).stream()
                    .map(Corrida::getIdCorrida).toList();
            if (ids.isEmpty()) return List.of();
            return solicitacoes.findByIdCorridaInOrderByCriadoEmDesc(ids).stream().map(this::visao).toList();
        }
        return List.of();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Solicitacao s = solicitacoes.findById(id).orElse(null);
        if (s == null) return CorridaController.erro(HttpStatus.NOT_FOUND, "Solicitação não encontrada.");
        String novo = body.get("status");
        Corrida c = corridas.findById(s.getIdCorrida()).orElse(null);
        if (novo == null || c == null) return CorridaController.erro(HttpStatus.BAD_REQUEST, "Dados inválidos.");

        switch (novo) {
            case "aceita" -> {
                if (!"pendente".equals(s.getStatus()))
                    return CorridaController.erro(HttpStatus.BAD_REQUEST, "Só é possível aceitar pedidos pendentes.");
                if (c.getVagas() == null || c.getVagas() < 1)
                    return CorridaController.erro(HttpStatus.BAD_REQUEST, "Não há mais vagas nesta carona.");
                c.setVagas(c.getVagas() - 1);
                if (c.getVagas() == 0) c.setStatus("lotada");
                corridas.save(c);
            }
            case "recusada" -> {
                if (!"pendente".equals(s.getStatus()))
                    return CorridaController.erro(HttpStatus.BAD_REQUEST, "Só é possível recusar pedidos pendentes.");
            }
            case "cancelada" -> {
                if ("aceita".equals(s.getStatus())) {
                    c.setVagas((c.getVagas() == null ? 0 : c.getVagas()) + 1);
                    if ("lotada".equals(c.getStatus())) c.setStatus("aberta");
                    corridas.save(c);
                } else if (!"pendente".equals(s.getStatus())) {
                    return CorridaController.erro(HttpStatus.BAD_REQUEST, "Esta solicitação não pode ser cancelada.");
                }
            }
            default -> { return CorridaController.erro(HttpStatus.BAD_REQUEST, "Status inválido."); }
        }
        s.setStatus(novo);
        return ResponseEntity.ok(visao(solicitacoes.save(s)));
    }
}
