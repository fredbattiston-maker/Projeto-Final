package br.com.caronaai.caronaai.controller;

import br.com.caronaai.caronaai.model.Usuario;
import br.com.caronaai.caronaai.model.Veiculo;
import br.com.caronaai.caronaai.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody CadastroRequest request) {
        try {
            Usuario salvo = service.cadastrar(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            Usuario logado = service.login(body.get("email"), body.get("senha"));
            return ResponseEntity.ok(logado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("erro", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/disponibilidade")
    public ResponseEntity<?> alterarDisponibilidade(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Boolean> body) {
        try {
            Boolean disponivel = (body != null) ? body.get("disponivelParaCarona") : null;
            Usuario atualizado = service.alternarDisponibilidade(id, disponivel);
            return ResponseEntity.ok(atualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("erro", e.getMessage()));
        }
    }

    @PutMapping("/{id}/veiculo")
    public ResponseEntity<?> salvarVeiculo(@PathVariable Long id, @RequestBody Veiculo veiculo) {
        try {
            return ResponseEntity.ok(service.salvarVeiculo(id, veiculo));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping
    public Usuario criar(@RequestBody Usuario usuario) {
        return service.criarUsuario(usuario);
    }

    @GetMapping
    public List<Usuario> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public Usuario buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }
}