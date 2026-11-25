package br.com.caronaai.caronaai.controller;

import br.com.caronaai.caronaai.model.Veiculo;
import br.com.caronaai.caronaai.repository.VeiculoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/veiculos")
public class VeiculoController {

    private final VeiculoRepository repository;

    public VeiculoController(VeiculoRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Veiculo cadastrar(@RequestBody Veiculo veiculo) {
        return repository.save(veiculo);
    }

    @GetMapping
    public List<Veiculo> listar() {
        return repository.findAll();
    }
}