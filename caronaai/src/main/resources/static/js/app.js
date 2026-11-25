
/* =========================================================
   CaronaAí — Front-end JavaScript
   HTML/CSS/JS puro, sem build.

   Rotas:
   #/entrar
   #/cadastro
   #/
   #/buscar
   #/carona/ID
   #/viagens
   #/motorista
   #/oferta
   #/caronas
   #/perfil
   #/notificacoes
   ========================================================= */

/* ---------- UTILIDADES ---------- */

const $ = (s, r = document) => r.querySelector(s);

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

const dinheiro = (v) =>
  "R$ " + Number(v || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

const dataBR = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).replace(/\./g, "")
    : "";

const horaBR = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      })
    : "";

const inicial = (n) =>
  (n || "?").trim().charAt(0).toUpperCase();

const primeiroNome = (n) =>
  (n || "").trim().split(" ")[0];

const nota = (n) =>
  Number(n ?? 5).toFixed(1).replace(".", ",");


/* ---------- AVISOS ---------- */

function avisar(t) {
  const el = $("#toast");

  if (!el) {
    alert(t);
    return;
  }

  el.textContent = t;
  el.classList.add("show");

  clearTimeout(avisar._t);

  avisar._t = setTimeout(() => {
    el.classList.remove("show");
  }, 3400);
}


/* ---------- SESSÃO ---------- */

const Sessao = {
  get() {
    try {
      return JSON.parse(localStorage.getItem("caronaai:usuario"));
    } catch {
      return null;
    }
  },

  set(u) {
    try {
      localStorage.setItem("caronaai:usuario", JSON.stringify(u));
    } catch {
      // Armazenamento indisponível
    }
  },

  sair() {
    try {
      localStorage.removeItem("caronaai:usuario");
    } catch {
      // Armazenamento indisponível
    }
  }
};


/* ---------- COMUNICAÇÃO COM O BACK-END ---------- */

async function api(url, metodo = "GET", corpo) {
  try {
    const r = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json"
      },
      body: corpo === undefined
        ? undefined
        : JSON.stringify(corpo)
    });

    const j = await r.json().catch(() => null);

    if (!r.ok) {
      return {
        ok: false,
        erro: (j && j.erro) || "Erro " + r.status
      };
    }

    return {
      ok: true,
      dados: j
    };

  } catch {
    return {
      ok: false,
      erro: "Não foi possível falar com o servidor. Ele está rodando?"
    };
  }
}


/* ---------- MAPA ILUSTRATIVO ---------- */

function mapa(origem = "Origem", destino = "Destino", preco = "") {
  return `
    <div class="mapa">
      <svg viewBox="0 0 660 400"
        preserveAspectRatio="xMidYMid slice"
        aria-label="Mapa ilustrativo">

        <rect width="660" height="400" fill="#eceee8"/>

        <path d="M0 40 L180 0 L250 0 L120 70Z
          M470 0 L660 0 L660 120 L560 90Z
          M0 250 L130 330 L60 400 L0 400Z"
          fill="#d8e4d6"/>

        <path d="M60 330 Q250 300 420 340
          L660 300 L660 370 Q420 410 250 380
          Q130 380 60 400Z"
          fill="#c8dde4" opacity=".8"/>

        <g stroke="#fff" stroke-width="12"
          fill="none" stroke-linecap="round">
          <path d="M0 90 L660 150"/>
          <path d="M0 220 L660 190"/>
          <path d="M80 0 L160 400"/>
          <path d="M300 0 L340 400"/>
          <path d="M500 0 L560 400"/>
        </g>

        <path d="M110 350 C200 300 230 250 300 200
          S420 130 520 70"
          stroke="#e5c98f" stroke-width="9"
          fill="none" stroke-linecap="round" opacity=".8"/>

        <path d="M110 350 C190 310 240 240 310 190
          S440 110 520 70"
          stroke="#b51224" stroke-width="5"
          fill="none" stroke-linecap="round"/>

        <circle cx="110" cy="350" r="11"
          fill="#fff" stroke="#b51224" stroke-width="5"/>

        <circle cx="520" cy="70" r="9" fill="#b51224"/>

        <g font-family="Inter,sans-serif"
          font-size="13" font-weight="600" fill="#222">

          <rect x="130" y="320" rx="14"
            width="${Math.min(260, 28 + origem.length * 7.4)}"
            height="30" fill="#fff"/>

          <text x="146" y="340">
            ${esc(origem.slice(0, 32))}
          </text>

          <rect x="360" y="40" rx="14"
            width="${Math.min(260, 28 + destino.length * 7.4)}"
            height="30" fill="#fff"/>

          <text x="376" y="60">
            ${esc(destino.slice(0, 32))}
          </text>

          ${preco ? `
            <rect x="250" y="215" rx="15"
              width="76" height="30" fill="#b51224"/>

            <text x="288" y="235"
              fill="#fff" text-anchor="middle">
              ${esc(preco)}
            </text>
          ` : ""}

        </g>
      </svg>

      <span class="mapa-nota">Mapa demonstrativo</span>
    </div>
  `;
}


/* ---------- TOPO E RODAPÉ ---------- */

function topo(ativo, pendentes = 0) {
  const u = Sessao.get();

  const links = [
    ["", "Início"],
    ["buscar", "Buscar caronas"],
    ["viagens", "Minhas viagens"]
  ];

  if (u && (u.disponivelParaCarona || u.veiculo)) {
    links.push(["caronas", "Minhas caronas"]);
  }

  return `
    <header class="topo">
      <div class="topo-in">

        <a class="logo" href="#/">
          <img src="img/logo.jpg" alt="CaronaAí">
        </a>

        <nav class="nav">
          ${links.map(([r, n]) => `
            <a href="#/${r}" class="${r === ativo ? "on" : ""}">
              ${n}
            </a>
          `).join("")}
        </nav>

        <div class="topo-dir">

          <a class="sino ${ativo === "notificacoes" ? "verm" : ""}"
            href="#/notificacoes">
            Notificações
            ${pendentes ? `<b>${pendentes}</b>` : ""}
          </a>

          <a class="user" href="#/perfil">
            <span class="avatar">
              ${esc(inicial(u?.nomeCompleto))}
            </span>

            <span>${esc(u?.nomeCompleto || "")}</span>
          </a>

          <button class="sair" id="btn-sair">
            Sair
          </button>

        </div>
      </div>
    </header>
  `;
}

const rodapeSimples = `
  <footer class="rodape">
    Compartilhamento de custos, não transporte comercial.
    Combine os detalhes da viagem com responsabilidade.
  </footer>
`;

function pagina(ativo, html, pend) {
  return topo(ativo, pend) +
    `<main class="wrap">${html}</main>` +
    rodapeSimples;
}


/* ---------- COMPONENTES ---------- */

function formBusca(v = {}, rotulo = "Buscar caronas") {
  const p = v.p || 1;

  return `
    <form class="card busca" id="form-busca">

      <div>
        <label>De onde você vai sair?</label>
        <input id="b-o"
          value="${esc(v.o || "")}"
          placeholder="Cidade, bairro ou rua">
      </div>

      <div>
        <label>Para onde você quer ir?</label>
        <input id="b-d"
          value="${esc(v.d || "")}"
          placeholder="Cidade, bairro ou rua">
      </div>

      <div>
        <label>Data da viagem</label>
        <input id="b-dt" type="date"
          value="${esc(v.dt || "")}">
      </div>

      <div>
        <label>Passageiros</label>
        <input id="b-p" type="number"
          min="1" max="6" value="${p}">
      </div>

      <div class="busca-nota">
        Deixe em branco para ver todas as caronas abertas.
      </div>

      <button class="btn btn-p" type="submit">
        ${rotulo}
      </button>

    </form>
  `;
}

function ligarBusca() {
  const form = $("#form-busca");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const q = new URLSearchParams({
      o: $("#b-o").value.trim(),
      d: $("#b-d").value.trim(),
      dt: $("#b-dt").value,
      p: $("#b-p").value || 1
    });

    location.hash = "#/buscar?" + q.toString();
  });
}

function cardCarona(c) {
  return `
    <article class="carona">

      <div class="cab">
        <span class="avatar g alt">
          ${esc(inicial(c.motoristaNome))}
        </span>

        <div>
          <div class="nome">
            ${esc(c.motoristaNome)}
          </div>

          <div class="meta">
            ★ ${nota(c.motoristaNota)}
            ${c.veiculo ? " • " + esc(c.veiculo) : ""}
          </div>
        </div>
      </div>

      <div>
        <span class="hora">${horaBR(c.dataHoraPartida)}</span>
        &nbsp;
        <b>${esc(c.origemEndereco)}</b>
      </div>

      <div class="mt8" style="padding-left:52px">
        ${esc(c.destinoEndereco)}
      </div>

      <div class="meta mt8">
        ${dataBR(c.dataHoraPartida)}
        &nbsp;•&nbsp;
        ${c.vagas} vaga${c.vagas === 1 ? "" : "s"}
        disponíve${c.vagas === 1 ? "l" : "is"}
      </div>

      <div class="rodape-c">

        <div class="preco">
          ${dinheiro(c.valorTotal)}
          <small>por pessoa</small>
        </div>

        <a class="btn btn-p btn-s"
          href="#/carona/${c.idCorrida}">
          Ver detalhes
        </a>

      </div>
    </article>
  `;
}

const rotuloStatus = {
  pendente: "Aguardando motorista",
  aceita: "Confirmada",
  recusada: "Recusada",
  cancelada: "Cancelada",
  aberta: "Oferta ativa",
  lotada: "Lotada"
};

const chipStatus = (s) =>
  `<span class="status s-${esc(s)}">${rotuloStatus[s] || esc(s)}</span>`;


/* ---------- MÁSCARAS ---------- */

function mascaraCPF(valor) {
  return String(valor || "")
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function mascaraTelefone(valor) {
  const n = String(valor || "")
    .replace(/\D/g, "")
    .slice(0, 11);

  if (n.length <= 2) {
    return n ? `(${n}` : "";
  }

  if (n.length <= 6) {
    return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  }

  if (n.length <= 10) {
    return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  }

  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}


/* ---------- TELAS PÚBLICAS ---------- */

function painelVinho() {
  return `
    <section class="painel-vinho">

      <div class="kicker">
        Juntos, o caminho rende mais
      </div>

      <h2>
        Caminhos em comum.<br>
        Mais possibilidades.
      </h2>

      <p>
        Encontre pessoas que vão na mesma direção.
        Compartilhe a viagem, divida os custos
        e chegue com mais tranquilidade.
      </p>

      <svg class="rota" viewBox="0 0 330 110"
        width="100%" height="100">

        <path d="M20 90 H90 C120 90 120 30 160 30 H300"
          stroke="#c9505d" stroke-width="16"
          fill="none" stroke-linecap="round"
          stroke-linejoin="round"/>

        <path d="M20 90 H90 C120 90 120 30 160 30 H300"
          stroke="#fff" stroke-width="2"
          stroke-dasharray="7 7" fill="none"/>

        <circle cx="20" cy="90" r="10" fill="#fff"/>

        <circle cx="300" cy="30" r="11"
          fill="none" stroke="#fff" stroke-width="5"/>

      </svg>

      <ol>
        <li><b>01</b> Segurança em cada encontro</li>
        <li><b>02</b> Custos compartilhados, sem lucro</li>
        <li><b>03</b> Mais conexões, menos carros</li>
      </ol>

    </section>
  `;
}

function topoAuth(texto, rotulo, destino) {
  return `
    <header class="auth-topo">
      <div class="topo-in">

        <a class="logo" href="#/entrar">
          <img src="img/logo.jpg" alt="CaronaAí">
        </a>

        <div class="linha">
          <span class="suave peq">${texto}</span>

          <a class="btn btn-p btn-s" href="${destino}">
            ${rotulo}
          </a>
        </div>

      </div>
    </header>
  `;
}

const rodapeAuth = `
  <footer class="rodape">
    © CaronaAí 2026 • Compartilhando caminhos.
  </footer>
`;


/* ---------- ROTAS ---------- */

const ROTAS = {};


/* ---------- LOGIN ---------- */

ROTAS.entrar = {
  publica: true,

  render: () =>
    topoAuth(
      "Ainda não tem uma conta?",
      "Criar conta",
      "#/cadastro"
    ) +

    `<div class="auth">
      ${painelVinho()}

      <form class="card auth-card" id="form-login">

        <div class="kicker">Bem-vindo de volta</div>

        <h1>Seu próximo caminho começa aqui.</h1>

        <p class="sub">
          Entre para buscar ou oferecer caronas com a mesma conta.
        </p>

        <label>E-mail</label>
        <input id="l-email" type="email"
          placeholder="ana.martins@email.com"
          required autocomplete="email">

        <label>Senha</label>
        <input id="l-senha" type="password"
          placeholder="Sua senha"
          required autocomplete="current-password">

        <label>CPF</label>
        <input id="l-cpf" inputmode="numeric"
          maxlength="14"
          placeholder="123.456.789-09"
          autocomplete="off">

        <p class="mt16">
          <a class="verm peq"
            href="#/recuperar-senha"
            style="font-weight:600;font-size:14px">
            Esqueceu sua senha?
          </a>
        </p>

        <div class="erro-campo" id="l-erro" role="alert"></div>

        <button class="btn btn-p btn-bloco" type="submit">
          Entrar
        </button>

        <p class="suave peq mt16">
          Uma conta para ir junto. Uma comunidade para confiar.
        </p>

        <p class="mt16">
          <a class="verm"
            href="#/cadastro"
            style="font-weight:600;font-size:14px">
            Ainda não tem uma conta? Cadastre-se
          </a>
        </p>

      </form>
    </div>` +

    rodapeAuth,

  bind() {
    const cpf = $("#l-cpf");

    cpf.addEventListener("input", () => {
      cpf.value = mascaraCPF(cpf.value);
    });

    $("#form-login").addEventListener("submit", async (e) => {
      e.preventDefault();

      const btn = e.submitter;
      btn.disabled = true;

      const r = await api("/api/usuarios/login", "POST", {
        email: $("#l-email").value.trim(),
        senha: $("#l-senha").value,
        cpf: cpf.value.replace(/\D/g, "")
      });

      btn.disabled = false;

      if (!r.ok) {
        $("#l-erro").textContent = r.erro;
        return;
      }

      Sessao.set(r.dados);
      location.hash = "#/";
    });
  }
};


/* ---------- CADASTRO ---------- */

ROTAS.cadastro = {
  publica: true,

  render: () =>
    topoAuth(
      "Já tem uma conta?",
      "Entrar",
      "#/entrar"
    ) +

    `<div class="auth">
      ${painelVinho()}

      <form class="card auth-card cadastro-card" id="form-cad">

        <div class="kicker">Crie sua conta</div>

        <h1>É melhor ir junto.</h1>

        <p class="sub">
          Uma conta. Todos os seus caminhos.
        </p>

        <button class="btn btn-o btn-bloco mt24"
          type="button" id="google-cadastro">
          Continuar com Google
        </button>

        <p class="suave peq mt16">
          ou cadastre-se com seus dados
        </p>

        <label>Nome completo</label>
        <input id="c-nome"
          placeholder="Ana Martins"
          required autocomplete="name">

        <div class="linha-2">
          <div>
            <label>E-mail</label>
            <input id="c-email" type="email"
              placeholder="ana.martins@email.com"
              required autocomplete="email">
          </div>

          <div>
            <label>Senha</label>
            <input id="c-s1" type="password"
              minlength="8"
              placeholder="Crie uma senha segura"
              required autocomplete="new-password">
          </div>
        </div>

        <div class="linha-2">
          <div>
            <label>CPF</label>
            <input id="c-cpf" inputmode="numeric"
              maxlength="14"
              placeholder="123.456.789-09"
              required>
          </div>

          <div>
            <label>Número de telefone</label>
            <input id="c-tel" type="tel"
              placeholder="(11) 98765-4321"
              required autocomplete="tel">
          </div>
        </div>

        <label>Confirme sua senha</label>
        <input id="c-s2" type="password"
          minlength="8"
          placeholder="Digite a senha novamente"
          required autocomplete="new-password">

        <h3 class="mt24">
          Como você quer compartilhar caminhos?
        </h3>

        <div class="tipo-conta mt16">

          <label class="tipo-opcao" for="c-passageiro">
            <input id="c-passageiro"
              type="radio" name="tipo-conta"
              value="passageiro" checked>
            <span>Não quero ser motorista</span>
          </label>

          <label class="tipo-opcao" for="c-mot">
            <input id="c-mot"
              type="radio" name="tipo-conta"
              value="motorista">
            <span>Quero ser motorista também!</span>
          </label>

        </div>

        <section id="c-veic"
          class="veiculo-cadastro" hidden>

          <h3>Informações do veículo</h3>

          <div class="linha-2">
            <div>
              <label>Marca</label>
              <input id="c-marca" placeholder="Volkswagen">
            </div>

            <div>
              <label>Modelo</label>
              <input id="c-modelo" placeholder="Polo">
            </div>
          </div>

          <div class="linha-2">
            <div>
              <label>Ano</label>
              <input id="c-ano" type="number"
                min="1980" max="2035"
                placeholder="2021">
            </div>

            <div>
              <label>Cor</label>
              <input id="c-cor" placeholder="Prata">
            </div>
          </div>

          <div class="linha-2">
            <div>
              <label>Placa</label>
              <input id="c-placa"
                maxlength="8" placeholder="FQR-3A24">
            </div>

            <div>
              <label>Assentos disponíveis</label>
              <input id="c-assentos"
                type="number" min="1" max="8"
                placeholder="3">
            </div>
          </div>

          <div class="linha-2">
            <div>
              <label>Número da CNH</label>
              <input id="c-cnh" inputmode="numeric"
                placeholder="01234567890">
            </div>

            <div>
              <label>Categoria da CNH</label>
              <select id="c-categoria">
                <option value="">Selecione</option>
                <option>A</option>
                <option>B</option>
                <option>AB</option>
                <option>C</option>
                <option>D</option>
                <option>E</option>
              </select>
            </div>
          </div>

          <div class="aviso-info">
            Os campos de documentos e dados complementares
            serão conectados ao envio seguro no back-end.
            Nesta etapa, os dados de veículo enviados são
            marca, modelo, cor e placa.
          </div>

        </section>

        <p class="suave peq mt24">
          Ao continuar, você concorda com os Termos de Uso
          e a Política de Privacidade. Seus dados estão protegidos.
        </p>

        <div class="erro-campo" id="c-erro" role="alert"></div>

        <button class="btn btn-p btn-bloco" type="submit">
          Criar conta
        </button>

      </form>
    </div>` +

    rodapeAuth,

  bind() {
    const cpf = $("#c-cpf");
    const tel = $("#c-tel");
    const secaoVeiculo = $("#c-veic");

    cpf.addEventListener("input", () => {
      cpf.value = mascaraCPF(cpf.value);
    });

    tel.addEventListener("input", () => {
      tel.value = mascaraTelefone(tel.value);
    });

    document.querySelectorAll('input[name="tipo-conta"]')
      .forEach((r) => {
        r.addEventListener("change", () => {
          secaoVeiculo.hidden = !$("#c-mot").checked;

          secaoVeiculo.querySelectorAll("input,select")
            .forEach((el) => {
              el.required =
                $("#c-mot").checked &&
                [
                  "c-marca",
                  "c-modelo",
                  "c-ano",
                  "c-cor",
                  "c-placa",
                  "c-assentos",
                  "c-cnh",
                  "c-categoria"
                ].includes(el.id);
            });
        });
      });

    $("#google-cadastro").addEventListener("click", () => {
      avisar(
        "O acesso com Google precisa ser configurado no servidor."
      );
    });

    $("#form-cad").addEventListener("submit", async (e) => {
      e.preventDefault();

      const v = (id) => $(id).value.trim();

      if ($("#c-s1").value !== $("#c-s2").value) {
        $("#c-erro").textContent = "As senhas não conferem.";
        return;
      }

      if (v("#c-cpf").replace(/\D/g, "").length !== 11) {
        $("#c-erro").textContent =
          "Informe um CPF com 11 números.";
        return;
      }

      if (v("#c-tel").replace(/\D/g, "").length < 10) {
        $("#c-erro").textContent =
          "Informe um telefone válido com DDD.";
        return;
      }

      const corpo = {
        nomeCompleto: v("#c-nome"),
        email: v("#c-email"),
        telefone: v("#c-tel"),
        cpf: v("#c-cpf"),
        senha: $("#c-s1").value
      };

      if ($("#c-mot").checked) {
        Object.assign(corpo, {
          marca: v("#c-marca"),
          modelo: v("#c-modelo"),
          cor: v("#c-cor"),
          placa: v("#c-placa")
        });
      }

      const btn = e.submitter;
      btn.disabled = true;
      btn.textContent = "Criando conta...";

      const r = await api(
        "/api/usuarios/cadastro",
        "POST",
        corpo
      );

      btn.disabled = false;
      btn.textContent = "Criar conta";

      if (!r.ok) {
        $("#c-erro").textContent = r.erro;
        return;
      }

      try {
        localStorage.setItem(
          "caronaai:cadastro-pendente",
          JSON.stringify({
            usuario: r.dados,
            motorista: $("#c-mot").checked
          })
        );
      } catch {}

      location.hash = "#/cadastro-sucesso";
    });
  }
};


/* ---------- CADASTRO CONCLUÍDO ---------- */

ROTAS["cadastro-sucesso"] = {
  publica: true,

  render: () => {
    let pendente = null;

    try {
      pendente = JSON.parse(
        localStorage.getItem("caronaai:cadastro-pendente")
      );
    } catch {}

    if (!pendente?.usuario) {
      return topoAuth(
        "Já tem uma conta?",
        "Entrar",
        "#/entrar"
      ) +

      `<main class="sucesso-wrap">
        <section class="card sucesso-card">
          <h1>Não encontramos um cadastro recente.</h1>
          <a class="btn btn-p" href="#/cadastro">
            Voltar ao cadastro
          </a>
        </section>
      </main>`;
    }

    return topoAuth(
      "Bem-vindo(a) ao CaronaAí!",
      "Entrar",
      "#/entrar"
    ) +

    `<main class="sucesso-wrap">
      <section class="card sucesso-card">

        <div class="sucesso-icone">✓</div>

        <div class="kicker">Cadastro concluído</div>

        <h1>Sua conta está pronta!</h1>

        <p class="sub">
          Boas-vindas ao CaronaAí.
          Sua próxima viagem começa aqui.
        </p>

        ${pendente.motorista ? `
          <div class="aviso-info mt24">
            Seu cadastro também inclui informações de motorista.
            O envio e a análise dos documentos serão ativados
            na próxima etapa de integração.
          </div>
        ` : ""}

        <button class="btn btn-p btn-bloco mt24"
          id="continuar-conta">
          Acessar minha conta
        </button>

      </section>
    </main>` +

    rodapeAuth;
  },

  bind() {
    const b = $("#continuar-conta");
    if (!b) return;

    b.addEventListener("click", () => {
      let p = null;

      try {
        p = JSON.parse(
          localStorage.getItem("caronaai:cadastro-pendente")
        );
      } catch {}

      if (!p?.usuario) {
        location.hash = "#/entrar";
        return;
      }

      Sessao.set(p.usuario);

      localStorage.removeItem("caronaai:cadastro-pendente");

      location.hash = "#/";
    });
  }
};


/* ---------- RECUPERAR SENHA ---------- */

ROTAS["recuperar-senha"] = {
  publica: true,

  render: () =>
    topoAuth(
      "Lembrou sua senha?",
      "Entrar",
      "#/entrar"
    ) +

    `<main class="sucesso-wrap">

      <form class="card sucesso-card" id="form-recuperar">

        <div class="kicker">Recuperação de acesso</div>

        <h1>Esqueceu sua senha?</h1>

        <p class="sub">
          Informe seu e-mail para iniciar a recuperação.
        </p>

        <label>E-mail</label>

        <input id="r-email" type="email"
          placeholder="voce@email.com" required>

        <div class="erro-campo" id="r-erro"></div>

        <button class="btn btn-p btn-bloco" type="submit">
          Continuar
        </button>

        <p class="suave peq mt16">
          O envio do link será conectado ao serviço
          de e-mail na etapa do back-end.
        </p>

      </form>
    </main>` +

    rodapeAuth,

  bind() {
    $("#form-recuperar").addEventListener("submit", (e) => {
      e.preventDefault();

      $("#r-erro").textContent =
        "A recuperação por e-mail ainda precisa ser ativada no servidor.";
    });
  }
};


/* ---------- PASSAGEIRO: INÍCIO ---------- */

ROTAS[""] = {
  async render() {
    const u = Sessao.get();

    return pagina(
      "",
      `
        <div class="kicker">Caminhos em comum</div>

        <h1>
          Para onde vamos hoje,
          ${esc(primeiroNome(u.nomeCompleto))}?
        </h1>

        <p class="sub">
          Encontre pessoas no seu caminho
          e compartilhe os custos da viagem.
        </p>

        <div class="mt24">
          ${formBusca({}, "Buscar caronas")}
        </div>

        <div class="grade g-lado mt24">

          <div class="grade">

            <div class="card">
              <h3>Seu trajeto, compartilhado.</h3>

              <p class="sub mt8">
                Escolha uma carona, solicite sua vaga
                e aguarde a confirmação do motorista.
              </p>

              <div class="mt16">
                <span class="chip rosa">Perfis avaliados</span>
                <span class="chip">Custos divididos</span>
              </div>
            </div>

            <div class="card" id="destaque">
              <div class="kicker">Um caminho para explorar</div>
              <h3 class="mt8">Carregando…</h3>
            </div>

            <div class="card">
              <h3 style="font-size:17px">
                Vá com mais tranquilidade
              </h3>

              <p class="suave mt8 peq">
                Motoristas verificados, avaliações reais
                e informações claras antes de viajar.
              </p>
            </div>

          </div>

          ${mapa("Origem", "Destino", "")}

        </div>
      `
    );
  },

  async bind() {
    ligarBusca();

    const r = await api("/api/corridas");

    const box = $("#destaque");

    if (!box) return;

    const abertas = (r.ok ? r.dados : [])
      .filter((c) => c.status === "aberta" && c.vagas > 0);

    if (!abertas.length) {
      box.innerHTML = `
        <div class="kicker">Um caminho para explorar</div>
        <h3 class="mt8">Ainda sem caronas</h3>
        <p class="suave mt8">
          Quando um motorista publicar, ela aparece aqui.
        </p>
      `;
      return;
    }

    const c = abertas.sort((a, b) =>
      a.dataHoraPartida.localeCompare(b.dataHoraPartida)
    )[0];

    box.innerHTML = `
      <div class="kicker">Um caminho para explorar</div>

      <h3 class="mt8" style="font-size:22px">
        ${esc(c.origemEndereco)} → ${esc(c.destinoEndereco)}
      </h3>

      <p class="mt16">
        <a class="verm" style="font-weight:600"
          href="#/carona/${c.idCorrida}">
          A partir de ${dinheiro(c.valorTotal)}
          • Ver carona →
        </a>
      </p>
    `;
  }
};


/* ---------- BUSCAR CARONAS ---------- */

ROTAS.buscar = {
  async render(q) {
    return pagina(
      "buscar",
      `
        <div class="kicker">Caronas compatíveis</div>

        <h1>Uma rota. Boas companhias.</h1>

        <p class="sub">
          Encontre pessoas no seu caminho
          e compartilhe os custos da viagem.
        </p>

        <div class="mt24">
          ${formBusca({
            o: q.get("o"),
            d: q.get("d"),
            dt: q.get("dt"),
            p: q.get("p")
          }, "Alterar busca")}
        </div>

        <div class="grade g-lado mt24">

          <div>
            <h2 id="res-t">Buscando…</h2>

            <p class="suave peq" id="res-s">
              Ordenadas por horário de saída
            </p>

            <div class="lista mt16" id="res-lista"></div>
          </div>

          <div>
            ${mapa(
              q.get("o") || "Origem",
              q.get("d") || "Destino",
              ""
            )}
          </div>

        </div>
      `
    );
  },

  async bind(q) {
    ligarBusca();

    const u = Sessao.get();

    const r = await api("/api/corridas");

    if (!r.ok) {
      $("#res-t").textContent = "Erro ao buscar";

      $("#res-lista").innerHTML = `
        <div class="card vazio">${esc(r.erro)}</div>
      `;

      return;
    }

    const norm = (s) =>
      String(s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const o = norm(q.get("o"));
    const d = norm(q.get("d"));
    const dt = q.get("dt");
    const pax = +q.get("p") || 1;

    const lista = r.dados
      .filter((c) =>
        c.status === "aberta" &&
        c.vagas >= pax &&
        c.idMotorista !== u.idUsuario &&
        (!o || norm(c.origemEndereco).includes(o)) &&
        (!d || norm(c.destinoEndereco).includes(d)) &&
        (!dt || (c.dataHoraPartida || "").startsWith(dt))
      )
      .sort((a, b) =>
        a.dataHoraPartida.localeCompare(b.dataHoraPartida)
      );

    $("#res-t").textContent =
      `${lista.length} carona${lista.length === 1 ? "" : "s"} encontrada${lista.length === 1 ? "" : "s"}`;

    $("#res-lista").innerHTML = lista.length
      ? lista.map(cardCarona).join("")
      : `
        <div class="card vazio">
          <h3>Nenhuma carona por aqui</h3>
          <p class="mt8">
            Tente ampliar a busca ou outra data.
          </p>
        </div>
      `;
  }
};


/* ---------- DETALHES DA CARONA ---------- */

ROTAS.carona = {
  async render(q, id) {
    const r = await api("/api/corridas/" + id);

    if (!r.ok) {
      return pagina(
        "buscar",
        `
          <div class="card vazio">
            <h3>${esc(r.erro)}</h3>

            <p class="mt16">
              <a class="btn btn-p" href="#/buscar">
                Voltar à busca
              </a>
            </p>
          </div>
        `
      );
    }

    const c = r.dados;
    const u = Sessao.get();
    const minha = c.idMotorista === u.idUsuario;

    return pagina(
      "buscar",
      `
        <a class="verm" style="font-weight:600"
          href="#/buscar">
          ← Voltar aos resultados
        </a>

        <div class="kicker mt16">Detalhes da carona</div>

        <h1>
          ${esc(c.origemEndereco)}
          → ${esc(c.destinoEndereco)}
        </h1>

        <div class="grade g-lado mt24">

          <div class="grade">

            <div class="card">

              <div class="cab linha">
                <span class="avatar g alt">
                  ${esc(inicial(c.motoristaNome))}
                </span>

                <div>
                  <div style="font-weight:700;font-size:18px">
                    ${esc(c.motoristaNome)}
                  </div>

                  <div class="suave peq">
                    ★ ${nota(c.motoristaNota)}
                    ${c.veiculo ? " • " + esc(c.veiculo) : ""}
                  </div>
                </div>
              </div>

              <div class="item-linha mt16">
                <span class="suave">Saída</span>
                <b>
                  ${dataBR(c.dataHoraPartida)}
                  às ${horaBR(c.dataHoraPartida)}
                </b>
              </div>

              <div class="item-linha">
                <span class="suave">Embarque</span>
                <b>${esc(c.origemEndereco)}</b>
              </div>

              <div class="item-linha">
                <span class="suave">Destino</span>
                <b>${esc(c.destinoEndereco)}</b>
              </div>

              <div class="item-linha">
                <span class="suave">Vagas</span>
                <b>${c.vagas}</b>
              </div>

              <div class="preco mt16">
                ${dinheiro(c.valorTotal)}
                <small>por pessoa</small>
              </div>

              <p class="suave peq mt8">
                Nenhuma vaga é aprovada automaticamente:
                o motorista confirma seu pedido.
              </p>

              <div class="mt16">
                <button class="btn btn-p btn-bloco"
                  id="solicitar"
                  ${minha || c.status !== "aberta" ? "disabled" : ""}>
                  ${minha
                    ? "Esta é a sua carona"
                    : c.status !== "aberta"
                      ? "Sem vagas"
                      : "Solicitar vaga"}
                </button>
              </div>

              <div class="erro-campo" id="s-erro"></div>

            </div>
          </div>

          ${mapa(
            c.origemEndereco,
            c.destinoEndereco,
            dinheiro(c.valorTotal)
          )}

        </div>
      `
    );
  },

  bind(q, id) {
    const b = $("#solicitar");

    if (!b) return;

    b.addEventListener("click", async () => {
      b.disabled = true;

      const r = await api(
        "/api/solicitacoes",
        "POST",
        {
          idCorrida: +id,
          idPassageiro: Sessao.get().idUsuario
        }
      );

      if (!r.ok) {
        $("#s-erro").textContent = r.erro;
        b.disabled = false;
        return;
      }

      avisar("Pedido enviado! Aguarde a confirmação do motorista.");

      location.hash = "#/viagens";
    });
  }
};


/* ---------- MINHAS VIAGENS ---------- */

ROTAS.viagens = {
  async render() {
    const u = Sessao.get();

    const r = await api(
      "/api/solicitacoes?passageiro=" + u.idUsuario
    );

    const lista = r.ok ? r.dados : [];

    const itens = lista.map((s) => {
      const c = s.corrida || {};

      return `
        <article class="carona">

          <div class="linha entre">
            ${chipStatus(s.status)}

            <span class="suave peq">
              ${dataBR(c.dataHoraPartida)}
              • ${horaBR(c.dataHoraPartida)}
            </span>
          </div>

          <h3 class="mt16" style="font-size:20px">
            ${esc(c.origemEndereco)}
            → ${esc(c.destinoEndereco)}
          </h3>

          <p class="suave peq mt8">
            com ${esc(c.motoristaNome)}
            ${c.veiculo ? " • " + esc(c.veiculo) : ""}
          </p>

          <div class="rodape-c">

            <div class="preco">
              ${dinheiro(c.valorTotal)}
              <small>por pessoa</small>
            </div>

            <div class="linha">

              <a class="btn btn-c btn-s"
                href="#/carona/${s.idCorrida}">
                Detalhes
              </a>

              ${s.status === "pendente" || s.status === "aceita"
                ? `
                  <button class="btn btn-o btn-s"
                    data-cancelar="${s.idSolicitacao}">
                    Cancelar
                  </button>
                `
                : ""}

            </div>
          </div>
        </article>
      `;
    }).join("");

    return pagina(
      "viagens",
      `
        <div class="kicker">Passageiro</div>

        <h1>Minhas viagens</h1>

        <p class="sub">
          Acompanhe seus pedidos de vaga
          e as caronas confirmadas.
        </p>

        <div class="lista mt24">
          ${itens || `
            <div class="card vazio">
              <h3>Você ainda não pediu nenhuma carona</h3>

              <p class="mt16">
                <a class="btn btn-p" href="#/buscar">
                  Buscar caronas
                </a>
              </p>
            </div>
          `}
        </div>
      `
    );
  },

  bind() {
    document.querySelectorAll("[data-cancelar]")
      .forEach((b) => {
        b.addEventListener("click", async () => {
          const r = await api(
            "/api/solicitacoes/" + b.dataset.cancelar,
            "PATCH",
            { status: "cancelada" }
          );

          avisar(
            r.ok ? "Solicitação cancelada." : r.erro
          );

          renderizar();
        });
      });
  }
};


/* ---------- PAINEL DO MOTORISTA ---------- */

ROTAS.motorista = {
  async render() {
    const u = Sessao.get();

    const [rc, rs] = await Promise.all([
      api("/api/corridas?motorista=" + u.idUsuario),
      api("/api/solicitacoes?motorista=" + u.idUsuario)
    ]);

    const corridas = rc.ok ? rc.dados : [];
    const pedidos = rs.ok ? rs.dados : [];

    const ativa = corridas.find((c) => c.status === "aberta");

    const pend = pedidos.filter(
      (s) => s.status === "pendente"
    ).length;

    const nomesPend = pedidos
      .filter((s) => s.status === "pendente")
      .slice(0, 2)
      .map((s) => primeiroNome(s.passageiroNome))
      .join(" e ");

    return pagina(
      "caronas",
      `
        <div class="linha entre">

          <div>
            <div class="kicker">Área do motorista</div>

            <h1>
              Olá, ${esc(primeiroNome(u.nomeCompleto))}.
              Vamos compartilhar caminhos?
            </h1>

            <p class="sub">
              ${u.veiculo
                ? "Veículo: " + esc([
                    u.veiculo.marca,
                    u.veiculo.modelo,
                    u.veiculo.cor
                  ].filter(Boolean).join(" "))
                : "Cadastre seu veículo no perfil para oferecer caronas."}
            </p>
          </div>

          <div class="card linha" style="gap:30px">
            <b>Quero oferecer caronas</b>

            <button class="toggle ${u.disponivelParaCarona ? "on" : ""}"
              id="toggle"
              aria-label="Alternar disponibilidade">
            </button>
          </div>

        </div>

        <div class="grade g-3 mt24">

          <div class="card stat">
            <b>${corridas.filter((c) => c.status === "aberta").length}</b>
            <span class="suave">Carona ativa</span>
          </div>

          <div class="card stat">
            <b>${pend}</b>
            <span class="suave">Solicitações pendentes</span>
          </div>

          <div class="card stat">
            <b>${corridas.length}</b>
            <span class="suave">Caronas como motorista</span>
          </div>

        </div>

        <div class="linha entre mt32">
          <h2>Minhas caronas</h2>

          <a class="btn btn-p" href="#/oferta">
            + Nova oferta
          </a>
        </div>

        <div class="grade g-lado mt16"
          style="grid-template-columns:minmax(0,7fr) minmax(0,4fr)">

          ${ativa ? `
            <div class="card">

              ${chipStatus("aberta")}

              <h2 class="mt16">
                ${esc(ativa.origemEndereco)}
                → ${esc(ativa.destinoEndereco)}
              </h2>

              <p class="suave mt8">
                ${dataBR(ativa.dataHoraPartida)},
                ${horaBR(ativa.dataHoraPartida)}
              </p>

              <div class="linha mt24" style="gap:50px">

                <div>
                  <b style="font-size:30px">${ativa.vagas}</b>
                  <span class="suave">vagas disponíveis</span>
                </div>

                <div>
                  <b style="font-size:30px">
                    ${dinheiro(ativa.valorTotal)}
                  </b>
                  <div class="suave peq">por passageiro</div>
                </div>

              </div>

              <div class="linha mt24">

                <a class="btn btn-p" style="flex:1"
                  href="#/caronas">
                  Gerenciar solicitações
                </a>

                <a class="btn btn-c" style="flex:1"
                  href="#/caronas">
                  Todas as minhas caronas
                </a>

              </div>

            </div>
          ` : `
            <div class="card vazio">
              <h3>Nenhuma oferta ativa</h3>
              <p class="mt8">
                Publique uma carona para começar a receber pedidos.
              </p>
            </div>
          `}

          <div class="card rosa">

            <h3>Seu trajeto pode ajudar alguém</h3>

            <p class="suave mt16">
              ${pend
                ? esc(nomesPend) +
                  " solicitou" +
                  (pend > 1 ? "aram" : "") +
                  " uma vaga. Veja os perfis e decida quem poderá viajar."
                : "Quando alguém pedir vaga, você decide quem pode viajar."}
            </p>

            <p class="mt24"
              style="color:var(--vinho);font-weight:700;font-size:14px">
              Nenhuma vaga é aprovada automaticamente.
            </p>

            <a class="btn btn-o btn-bloco mt16"
              href="#/caronas">
              Ver solicitações
            </a>

          </div>

        </div>
      `
    );
  },

  bind() {
    const toggle = $("#toggle");

    if (!toggle) return;

    toggle.addEventListener("click", async () => {
      const u = Sessao.get();

      const r = await api(
        `/api/usuarios/${u.idUsuario}/disponibilidade`,
        "PATCH",
        {
          disponivelParaCarona: !u.disponivelParaCarona
        }
      );

      if (!r.ok) {
        avisar(r.erro);

        if (/veículo/i.test(r.erro)) {
          location.hash = "#/perfil";
        }

        return;
      }

      Sessao.set(r.dados);

      renderizar();
    });
  }
};


/* ---------- PUBLICAR CARONA ---------- */

ROTAS.oferta = {
  render() {
    const u = Sessao.get();

    const amanha = new Date(
      Date.now() + 864e5
    ).toISOString().slice(0, 10);

    if (!u.disponivelParaCarona) {
      return pagina(
        "caronas",
        `
          <div class="card vazio">

            <h3>Ative o modo motorista</h3>

            <p class="mt8">
              Ligue “Quero oferecer caronas” no painel
              do motorista. É preciso ter um veículo cadastrado.
            </p>

            <p class="mt16">
              <a class="btn btn-p" href="#/motorista">
                Ir para o painel
              </a>
            </p>

          </div>
        `
      );
    }

    return pagina(
      "caronas",
      `
        <div class="kicker">Nova oferta</div>

        <h1>Ofereça uma carona</h1>

        <p class="sub">
          Publique só uma viagem que você já pretende fazer.
          O valor é um rateio de custos, sem lucro.
        </p>

        <form class="card mt24"
          id="form-oferta"
          style="max-width:640px">

          <label style="margin-top:0">Origem</label>
          <input id="o-o"
            placeholder="São Paulo • Barra Funda"
            required>

          <label>Destino</label>
          <input id="o-d"
            placeholder="Campinas • Centro"
            required>

          <div class="linha-2">

            <div>
              <label>Data</label>
              <input id="o-dt" type="date"
                value="${amanha}" required>
            </div>

            <div>
              <label>Horário</label>
              <input id="o-h" type="time"
                value="18:30" required>
            </div>

          </div>

          <div class="linha-2">

            <div>
              <label>Vagas</label>
              <input id="o-v" type="number"
                min="1" max="6" value="3" required>
            </div>

            <div>
              <label>Valor por passageiro (R$)</label>
              <input id="o-val" type="number"
                min="1" step="0.5" value="28" required>
            </div>

          </div>

          <div class="erro-campo" id="o-erro"></div>

          <button class="btn btn-p btn-bloco" type="submit">
            Publicar carona
          </button>

        </form>
      `
    );
  },

  bind() {
    const f = $("#form-oferta");

    if (!f) return;

    f.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btn = e.submitter;
      btn.disabled = true;

      const r = await api(
        "/api/corridas",
        "POST",
        {
          idMotorista: Sessao.get().idUsuario,
          origemEndereco: $("#o-o").value.trim(),
          destinoEndereco: $("#o-d").value.trim(),
          dataHoraPartida:
            `${$("#o-dt").value}T${$("#o-h").value}:00`,
          valorTotal: +$("#o-val").value,
          vagas: +$("#o-v").value
        }
      );

      btn.disabled = false;

      if (!r.ok) {
        $("#o-erro").textContent = r.erro;
        return;
      }

      avisar("Carona publicada!");

      location.hash = "#/motorista";
    });
  }
};


/* ---------- MINHAS CARONAS ---------- */

ROTAS.caronas = {
  async render() {
    const u = Sessao.get();

    const [rc, rs] = await Promise.all([
      api("/api/corridas?motorista=" + u.idUsuario),
      api("/api/solicitacoes?motorista=" + u.idUsuario)
    ]);

    const corridas = rc.ok ? rc.dados : [];
    const pedidos = rs.ok ? rs.dados : [];

    const ped = pedidos.map((s) => {
      const c = s.corrida || {};

      return `
        <div class="item-linha">

          <div>
            <b>${esc(s.passageiroNome)}</b>

            <span class="suave peq">
              ★ ${nota(s.passageiroNota)}
            </span>

            <div class="suave peq">
              ${esc(c.origemEndereco)}
              → ${esc(c.destinoEndereco)}
              • ${dataBR(c.dataHoraPartida)}
            </div>
          </div>

          <div class="linha">

            ${s.status === "pendente" ? `
              <button class="btn btn-p btn-s"
                data-acao="aceita"
                data-id="${s.idSolicitacao}">
                Aceitar
              </button>

              <button class="btn btn-c btn-s"
                data-acao="recusada"
                data-id="${s.idSolicitacao}">
                Recusar
              </button>
            ` : chipStatus(s.status)}

          </div>

        </div>
      `;
    }).join("");

    const cor = corridas.map((c) => `
      <div class="item-linha">

        <div>
          <b>
            ${esc(c.origemEndereco)}
            → ${esc(c.destinoEndereco)}
          </b>

          <div class="suave peq">
            ${dataBR(c.dataHoraPartida)},
            ${horaBR(c.dataHoraPartida)}
            • ${c.vagas} vaga(s)
            • ${dinheiro(c.valorTotal)} por pessoa
          </div>
        </div>

        ${chipStatus(c.status)}

      </div>
    `).join("");

    return pagina(
      "caronas",
      `
        <div class="kicker">Área do motorista</div>

        <h1>Minhas caronas</h1>

        <div class="grade g-lado mt24"
          style="grid-template-columns:1fr 1fr">

          <div class="card">

            <h3>Solicitações recebidas</h3>

            <div class="mt16">
              ${ped || `
                <p class="suave">
                  Nenhuma solicitação ainda.
                </p>
              `}
            </div>

          </div>

          <div class="card">

            <div class="linha entre">
              <h3>Ofertas publicadas</h3>

              <a class="btn btn-p btn-s" href="#/oferta">
                + Nova oferta
              </a>
            </div>

            <div class="mt16">
              ${cor || `
                <p class="suave">
                  Você ainda não publicou caronas.
                </p>
              `}
            </div>

          </div>

        </div>
      `
    );
  },

  bind() {
    document.querySelectorAll("[data-acao]")
      .forEach((b) => {
        b.addEventListener("click", async () => {
          const r = await api(
            "/api/solicitacoes/" + b.dataset.id,
            "PATCH",
            {
              status: b.dataset.acao
            }
          );

          avisar(
            r.ok
              ? (
                  b.dataset.acao === "aceita"
                    ? "Passageiro confirmado!"
                    : "Solicitação recusada."
                )
              : r.erro
          );

          renderizar();
        });
      });
  }
};


/* ---------- PERFIL ---------- */

ROTAS.perfil = {
  render() {
    const u = Sessao.get();
    const v = u.veiculo || {};

    return pagina(
      "perfil",
      `
        <div class="kicker">Meu perfil</div>

        <div class="linha mt8">

          <span class="avatar g">
            ${esc(inicial(u.nomeCompleto))}
          </span>

          <h1 style="margin:0">
            ${esc(u.nomeCompleto)}
          </h1>

        </div>

        <p class="sub mt8">
          ${esc(u.email)}
          • ★ ${nota(u.notaMedia)}
        </p>

        <div class="grade g-lado mt24"
          style="grid-template-columns:1fr 1fr">

          <div class="card">

            <h3>Dados da conta</h3>

            <div class="item-linha mt16">
              <span class="suave">Telefone</span>
              <b>${esc(u.telefone || "—")}</b>
            </div>

            <div class="item-linha">
              <span class="suave">CPF</span>
              <b>${esc(u.cpf || "—")}</b>
            </div>

            <div class="item-linha">
              <span class="suave">Modo motorista</span>
              <b>
                ${u.disponivelParaCarona ? "Ativado" : "Desativado"}
              </b>
            </div>

          </div>

          <form class="card" id="form-veic">

            <h3>Meu veículo</h3>

            <div class="linha-2">

              <div>
                <label>Marca</label>
                <input id="v-marca"
                  value="${esc(v.marca || "")}"
                  required>
              </div>

              <div>
                <label>Modelo</label>
                <input id="v-modelo"
                  value="${esc(v.modelo || "")}"
                  required>
              </div>

            </div>

            <div class="linha-2">

              <div>
                <label>Cor</label>
                <input id="v-cor"
                  value="${esc(v.cor || "")}">
              </div>

              <div>
                <label>Placa</label>
                <input id="v-placa"
                  maxlength="8"
                  value="${esc(v.placa || "")}"
                  required>
              </div>

            </div>

            <div class="mt16">
              <button class="btn btn-p" type="submit">
                Salvar veículo
              </button>
            </div>

          </form>

        </div>
      `
    );
  },

  bind() {
    $("#form-veic").addEventListener("submit", async (e) => {
      e.preventDefault();

      const u = Sessao.get();

      const r = await api(
        `/api/usuarios/${u.idUsuario}/veiculo`,
        "PUT",
        {
          marca: $("#v-marca").value.trim(),
          modelo: $("#v-modelo").value.trim(),
          cor: $("#v-cor").value.trim(),
          placa: $("#v-placa").value.trim()
        }
      );

      if (!r.ok) {
        avisar(r.erro);
        return;
      }

      Sessao.set(r.dados);

      avisar("Veículo salvo.");

      renderizar();
    });
  }
};


/* ---------- NOTIFICAÇÕES ---------- */

ROTAS.notificacoes = {
  async render() {
    const u = Sessao.get();

    const [a, b] = await Promise.all([
      api("/api/solicitacoes?passageiro=" + u.idUsuario),
      api("/api/solicitacoes?motorista=" + u.idUsuario)
    ]);

    const itens = [];

    (a.ok ? a.dados : []).forEach((s) => {
      const c = s.corrida || {};

      const t = {
        pendente: "Pedido enviado, aguardando o motorista",
        aceita: "Sua vaga foi confirmada",
        recusada: "O motorista recusou seu pedido",
        cancelada: "Você cancelou este pedido"
      }[s.status];

      itens.push([
        s.criadoEm,
        t,
        `${c.origemEndereco} → ${c.destinoEndereco} com ${c.motoristaNome}`,
        "#/viagens"
      ]);
    });

    (b.ok ? b.dados : [])
      .filter((s) => s.status === "pendente")
      .forEach((s) => {
        itens.push([
          s.criadoEm,
          `${s.passageiroNome} quer uma vaga`,
          `${s.corrida?.origemEndereco} → ${s.corrida?.destinoEndereco}`,
          "#/caronas"
        ]);
      });

    itens.sort((x, y) =>
      String(y[0]).localeCompare(String(x[0]))
    );

    return pagina(
      "notificacoes",
      `
        <div class="kicker">Atualizações</div>

        <h1>Notificações</h1>

        <div class="card mt24">

          ${itens.map(([d, t, s, l]) => `
            <a class="item-linha" href="${l}">

              <div>
                <b>${esc(t)}</b>

                <div class="suave peq">
                  ${esc(s)}
                </div>
              </div>

              <span class="suave peq">
                ${dataBR(d)}
              </span>

            </a>
          `).join("") || `
            <p class="vazio">Nada por aqui ainda.</p>
          `}

        </div>
      `
    );
  }
};


/* ---------- ROTEADOR ---------- */

let _gen = 0;

async function renderizar() {
  const gen = ++_gen;

  const [caminho, query = ""] =
    (location.hash.replace(/^#\/?/, "") || "")
      .split("?");

  const [nome, id] = caminho.split("/");

  const q = new URLSearchParams(query);

  const u = Sessao.get();

  const rota = ROTAS[nome] || ROTAS[""];

  if (!rota.publica && !u) {
    location.hash = "#/entrar";
    return;
  }

  if (
    rota.publica &&
    u &&
    !["cadastro-sucesso", "recuperar-senha"].includes(nome)
  ) {
    location.hash = "#/";
    return;
  }

  const app = $("#app");

  if (!app) {
    console.error('Não encontrei o elemento com id="app" no HTML.');
    return;
  }

  const html = await rota.render(q, id);

  if (gen !== _gen) return;

  app.innerHTML = html;

  window.scrollTo(0, 0);

  const sair = $("#btn-sair");

  if (sair) {
    sair.addEventListener("click", () => {
      Sessao.sair();
      location.hash = "#/entrar";
    });
  }

  if (rota.bind) {
    await rota.bind(q, id);
  }
}


/* ---------- INICIALIZAÇÃO ---------- */

window.addEventListener("hashchange", renderizar);

window.addEventListener("DOMContentLoaded", renderizar);
