package br.com.caronaai.caronaai.controller;

import br.com.caronaai.caronaai.model.Corrida;
import br.com.caronaai.caronaai.model.Usuario;
import br.com.caronaai.caronaai.model.Veiculo;
import br.com.caronaai.caronaai.repository.CorridaRepository;
import br.com.caronaai.caronaai.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/corridas")
public class CorridaController {

    private final CorridaRepository repository;
    private final UsuarioRepository usuarios;

    public CorridaController(CorridaRepository repository, UsuarioRepository usuarios) {
        this.repository = repository;
        this.usuarios = usuarios;
    }

    private static String nz(String s) { return s == null ? "" : s.trim(); }

    /** Corrida + dados do motorista, no formato que o front usa. */
    public static Map<String, Object> visao(Corrida c, UsuarioRepository usuarios) {
        Usuario u = c.getIdMotorista() == null ? null : usuarios.findById(c.getIdMotorista()).orElse(null);
        String veiculo = "";
        if (u != null && u.getVeiculo() != null) {
            Veiculo v = u.getVeiculo();
            veiculo = (nz(v.getMarca()) + " " + nz(v.getModelo())).trim();
            if (!nz(v.getCor()).isEmpty()) veiculo += ", " + nz(v.getCor());
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idCorrida", c.getIdCorrida());
        m.put("idMotorista", c.getIdMotorista());
        m.put("origemEndereco", c.getOrigemEndereco());
        m.put("destinoEndereco", c.getDestinoEndereco());
        m.put("dataHoraPartida", c.getDataHoraPartida());
        m.put("valorTotal", c.getValorTotal());
        m.put("vagas", c.getVagas() == null ? 1 : c.getVagas());
        m.put("status", c.getStatus());
        m.put("motoristaNome", u != null ? u.getNomeCompleto() : "Motorista");
        m.put("motoristaNota", u != null ? u.getNotaMedia() : null);
        m.put("veiculo", veiculo);
        return m;
    }

    @PostMapping
    public ResponseEntity<?> publicar(@RequestBody Corrida c) {
        if (c.getIdMotorista() == null)
            return erro(HttpStatus.UNAUTHORIZED, "Faça login para publicar uma carona.");
        Usuario u = usuarios.findById(c.getIdMotorista()).orElse(null);
        if (u == null) return erro(HttpStatus.UNAUTHORIZED, "Usuário não encontrado.");
        if (!Boolean.TRUE.equals(u.getDisponivelParaCarona()))
            return erro(HttpStatus.BAD_REQUEST, "Ative \"Quero oferecer caronas\" no painel do motorista.");
        if (nz(c.getOrigemEndereco()).isEmpty() || nz(c.getDestinoEndereco()).isEmpty()
                || c.getDataHoraPartida() == null || c.getValorTotal() == null)
            return erro(HttpStatus.BAD_REQUEST, "Preencha origem, destino, data, horário e valor.");
        if (c.getVagas() == null || c.getVagas() < 1) c.setVagas(1);
        c.setStatus("aberta");
        return ResponseEntity.status(HttpStatus.CREATED).body(visao(repository.save(c), usuarios));
    }

    @GetMapping
    public List<Map<String, Object>> listar(@RequestParam(required = false) Long motorista) {
        List<Corrida> lista = motorista != null
                ? repository.findByIdMotoristaOrderByDataHoraPartidaDesc(motorista)
                : repository.findAll();
        return lista.stream().map(c -> visao(c, usuarios)).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable Long id) {
        return repository.findById(id)
                .<ResponseEntity<?>>map(c -> ResponseEntity.ok(visao(c, usuarios)))
                .orElseGet(() -> erro(HttpStatus.NOT_FOUND, "Carona não encontrada."));
    }

    static ResponseEntity<?> erro(HttpStatus s, String msg) {
        return ResponseEntity.status(s).body(Map.of("erro", msg));
    }
}
