package br.com.caronaai.caronaai.service;

import br.com.caronaai.caronaai.controller.CadastroRequest;
import br.com.caronaai.caronaai.model.Usuario;
import br.com.caronaai.caronaai.model.Veiculo;
import br.com.caronaai.caronaai.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public Usuario cadastrar(CadastroRequest req) {
        String nomeFinal = (req.getNomeCompleto() != null && !req.getNomeCompleto().isBlank())
                ? req.getNomeCompleto().trim()
                : (req.getNome() != null ? req.getNome().trim() : "");

        if (nomeFinal.isBlank() || req.getEmail() == null || req.getEmail().isBlank()
                || req.getSenha() == null || req.getSenha().isBlank()) {
            throw new RuntimeException("Nome, email e senha são obrigatórios.");
        }

        if (repository.existsByEmailIgnoreCase(req.getEmail().trim())) {
            throw new RuntimeException("Já existe uma conta com este e-mail.");
        }

        Usuario usuario = new Usuario();
        usuario.setNomeCompleto(nomeFinal);
        usuario.setEmail(req.getEmail().trim().toLowerCase());
        usuario.setCpf(req.getCpf() != null && !req.getCpf().isBlank() ? req.getCpf().trim() : null);
        usuario.setTelefone(req.getTelefone() != null && !req.getTelefone().isBlank() ? req.getTelefone().trim() : "");
        usuario.setSenhaHash(encoder.encode(req.getSenha()));
        usuario.setDisponivelParaCarona(false);

        String modeloFinal = (req.getModeloCarro() != null && !req.getModeloCarro().isBlank())
                ? req.getModeloCarro().trim()
                : (req.getModelo() != null ? req.getModelo().trim() : null);
        String placaFinal = (req.getPlaca() != null && !req.getPlaca().isBlank())
                ? req.getPlaca().trim().toUpperCase()
                : null;

        if (modeloFinal != null || placaFinal != null) {
            Veiculo veiculo = new Veiculo();
            veiculo.setMarca(req.getMarca() != null && !req.getMarca().isBlank() ? req.getMarca().trim() : null);
            veiculo.setCor(req.getCor() != null && !req.getCor().isBlank() ? req.getCor().trim() : null);
            veiculo.setModelo(modeloFinal);
            veiculo.setPlaca(placaFinal);
            usuario.setVeiculo(veiculo);
        }

        return repository.save(usuario);
    }

    public Usuario login(String email, String senha) {
        if (email == null || senha == null) {
            throw new RuntimeException("Email e senha são obrigatórios.");
        }

        Usuario u = repository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new RuntimeException("E-mail ou senha inválidos."));
        String guardada = u.getSenhaHash() == null ? "" : u.getSenhaHash();
        boolean ok = guardada.startsWith("$2")
                ? encoder.matches(senha, guardada)
                : guardada.equals(senha); // contas antigas, criadas antes do BCrypt
        if (!ok) throw new RuntimeException("E-mail ou senha inválidos.");
        return u;
    }

    public Usuario alternarDisponibilidade(Long id, Boolean disponivel) {
        Usuario usuario = buscarPorId(id);
        boolean novo = disponivel != null ? disponivel : !Boolean.TRUE.equals(usuario.getDisponivelParaCarona());
        if (novo && usuario.getVeiculo() == null) {
            throw new RuntimeException("Cadastre seu veículo no perfil antes de oferecer caronas.");
        }
        if (disponivel != null) {
            usuario.setDisponivelParaCarona(disponivel);
        } else {
            boolean atual = Boolean.TRUE.equals(usuario.getDisponivelParaCarona());
            usuario.setDisponivelParaCarona(!atual);
        }
        return repository.save(usuario);
    }

    public Usuario salvarVeiculo(Long id, Veiculo dados) {
        Usuario usuario = buscarPorId(id);
        Veiculo v = usuario.getVeiculo() != null ? usuario.getVeiculo() : new Veiculo();
        v.setMarca(dados.getMarca());
        v.setModelo(dados.getModelo());
        v.setCor(dados.getCor());
        v.setPlaca(dados.getPlaca() == null ? null : dados.getPlaca().trim().toUpperCase());
        usuario.setVeiculo(v);
        return repository.save(usuario);
    }

    public Usuario criarUsuario(Usuario usuario) {
        if (usuario.getSenhaHash() != null && !usuario.getSenhaHash().startsWith("$2")) {
            usuario.setSenhaHash(encoder.encode(usuario.getSenhaHash()));
        }
        if (usuario.getDisponivelParaCarona() == null) {
            usuario.setDisponivelParaCarona(false);
        }
        if (usuario.getTelefone() == null) {
            usuario.setTelefone("");
        }
        return repository.save(usuario);
    }

    public List<Usuario> listarTodos() {
        return repository.findAll();
    }

    public Usuario buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
}