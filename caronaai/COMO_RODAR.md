# CaronaAí – como rodar

## Pré-requisitos
- JDK 17 ou mais novo (`java -version`)
- Banco no Neon (PostgreSQL na nuvem). Não precisa instalar nada local.

## Configurar o banco (1x)
1. No Neon: Dashboard > Connect > copie host, usuário e senha (de preferência gere uma senha NOVA).
2. Copie `.env.example` para `.env` (mesma pasta do `pom.xml`) e preencha `DB_URL`, `DB_USER`, `DB_PASSWORD`.
3. O arquivo `.env` já está no `.gitignore`. Nunca suba ele para o GitHub.
4. As tabelas são criadas sozinhas na primeira execução (`ddl-auto=update`).

## Rodar
Na pasta onde está o `pom.xml`:

```powershell
.\mvnw.cmd spring-boot:run      # Windows (PowerShell)
./mvnw spring-boot:run          # Mac/Linux
```

Depois abra **http://localhost:8080** no navegador.

## Front-end
Fica em `src/main/resources/static` (HTML, CSS e JS puros, sem build) e é servido pelo próprio Spring Boot.

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Página única |
| `css/style.css` | Visual (cores, cartões, botões, mapa) |
| `js/app.js` | Todas as telas e o roteador (`#/entrar`, `#/cadastro`, `#/`, `#/buscar`, `#/carona/ID`, `#/viagens`, `#/motorista`, `#/oferta`, `#/caronas`, `#/perfil`, `#/notificacoes`) |

## Fluxo que já funciona de ponta a ponta (tudo grava no Neon)
1. Criar conta (opcionalmente já com veículo) e entrar.
2. Perfil > cadastrar veículo; Painel do motorista > ligar "Quero oferecer caronas".
3. Nova oferta > publicar carona.
4. Com OUTRA conta: buscar a carona > Solicitar vaga.
5. Na conta do motorista: Minhas caronas > Aceitar/Recusar (aceitar desconta uma vaga).
6. Passageiro acompanha em Minhas viagens e Notificações.

## Endpoints
`POST /api/usuarios/cadastro`, `POST /api/usuarios/login`, `PATCH /api/usuarios/{id}/disponibilidade`, `PUT /api/usuarios/{id}/veiculo`,
`GET|POST /api/corridas` (`?motorista=ID`), `GET /api/corridas/{id}`,
`POST /api/solicitacoes`, `GET /api/solicitacoes?passageiro=ID|motorista=ID`, `PATCH /api/solicitacoes/{id}`.
