// ===== PÁGINA PAUSA =====
// Tudo funciona só no navegador: nada é salvo.

// ----- Elementos -----
const inicio = document.getElementById("inicio");
const sessao = document.getElementById("sessao");
const telas = {
  respirar: document.getElementById("tela-respirar"),
  timer: document.getElementById("tela-timer"),
  relaxar: document.getElementById("tela-relaxar")
};

// ----- Acessibilidade -----
// Nenhum texto recebe foco (isso podia mostrar um cursor piscando).
// Em vez disso: a mudança é anunciada numa área invisível (aria-live)
// e o foco vai para o primeiro botão/link da nova tela.
const anuncio = document.getElementById("anuncio");
let ultimoAbridor = null; // botão que abriu a experiência

function anunciar(texto) {
  anuncio.textContent = texto;
}

function primeiroControle(idDoBloco) {
  return document.querySelector("#" + idDoBloco + " button, #" + idDoBloco + " a");
}

// ----- Controle de tempo -----
// Guardamos todos os temporizadores para poder cancelá-los ao sair de uma tela.
let esperas = [];
let intervalo = null;

function esperar(funcao, milissegundos) {
  esperas.push(setTimeout(funcao, milissegundos));
}

function pararTudo() {
  esperas.forEach(clearTimeout);
  esperas = [];
  clearInterval(intervalo);
  intervalo = null;
}

// Mostra só os blocos da lista "visiveis" dentro de uma tela
function mostrarBlocos(ids, visiveis) {
  ids.forEach(function (id) {
    document.getElementById(id).hidden = !visiveis.includes(id);
  });
}

// Leva o foco para um elemento (ajuda quem usa teclado ou leitor de tela)
function focar(elemento) {
  if (elemento) elemento.focus({ preventScroll: true });
}

// ----- Navegação entre a tela inicial e as experiências -----
function abrirTela(nome) {
  pararTudo();
  inicio.hidden = true;
  sessao.hidden = false;
  Object.keys(telas).forEach(function (chave) {
    telas[chave].hidden = chave !== nome;
  });
  window.scrollTo(0, 0);

  if (nome === "respirar") iniciarRespiracao();
  if (nome === "timer") prepararTimer();
  if (nome === "relaxar") iniciarRelaxar();
}

function voltarParaOpcoes() {
  pararTudo();
  sessao.hidden = true;
  inicio.hidden = false;
  window.scrollTo(0, 0);
  anunciar("Está tudo bem parar. Escolha uma pausa.");
  focar(ultimoAbridor);
}

document.querySelectorAll("[data-abrir]").forEach(function (botao) {
  botao.addEventListener("click", function () {
    ultimoAbridor = botao;
    abrirTela(botao.dataset.abrir);
  });
});
document.querySelectorAll("[data-acao='voltar']").forEach(function (botao) {
  botao.addEventListener("click", voltarParaOpcoes);
});

// ----- Contagem regressiva (usada no Timer e no Relaxar) -----
function formatarTempo(segundos) {
  const min = String(Math.floor(segundos / 60)).padStart(2, "0");
  const seg = String(segundos % 60).padStart(2, "0");
  return min + ":" + seg;
}

function iniciarContagem(segundos, elemento, aoTerminar) {
  clearInterval(intervalo);
  const fim = Date.now() + segundos * 1000; // usar a hora evita atrasos acumulados

  function atualizar() {
    const restante = Math.max(0, Math.ceil((fim - Date.now()) / 1000));
    elemento.textContent = formatarTempo(restante);
    if (restante === 0) {
      clearInterval(intervalo);
      intervalo = null;
      aoTerminar();
    }
  }
  atualizar();
  intervalo = setInterval(atualizar, 250);
}

// ===== RESPIRAR =====
const TOTAL_CICLOS = 3;
const circulo = document.getElementById("circulo");
const textoRespiracao = document.getElementById("respiracao-texto");
const textoCiclo = document.getElementById("ciclo");
const blocosRespirar = ["respirar-ativo", "respirar-fim"];

function iniciarRespiracao() {
  mostrarBlocos(blocosRespirar, ["respirar-ativo"]);
  document.getElementById("fim-pergunta").hidden = false;
  document.getElementById("fim-obrigado").hidden = true;

  // Volta o círculo ao tamanho inicial, sem animação
  circulo.style.transitionDuration = "0s";
  circulo.classList.remove("cheio");
  textoRespiracao.textContent = "Prepare-se...";
  textoCiclo.innerHTML = "&nbsp;";

  anunciar("Exercício de respiração guiada. Prepare-se.");
  focar(primeiroControle("respirar-ativo"));
  esperar(function () { rodarCiclo(1); }, 3000);
}

// Um ciclo: 4s inspirando + 2s segurando + 4s expirando
function rodarCiclo(numero) {
  if (numero > TOTAL_CICLOS) {
    finalizarRespiracao();
    return;
  }
  textoCiclo.textContent = "Ciclo " + numero + " de " + TOTAL_CICLOS;

  // Inspirar: o círculo cresce
  textoRespiracao.textContent = "Inspire";
  circulo.style.transitionDuration = "4s";
  circulo.classList.add("cheio");

  // Segurar: o círculo fica parado
  esperar(function () { textoRespiracao.textContent = "Segure"; }, 4000);

  // Expirar: o círculo diminui
  esperar(function () {
    textoRespiracao.textContent = "Expire";
    circulo.classList.remove("cheio");
  }, 6000);

  // Próximo ciclo
  esperar(function () { rodarCiclo(numero + 1); }, 10000);
}

function finalizarRespiracao() {
  mostrarBlocos(blocosRespirar, ["respirar-fim"]);
  anunciar("Você terminou sua pausa. Como está se sentindo agora?");
  focar(primeiroControle("fim-pergunta"));
}

// As respostas de "Como está se sentindo?" não são salvas
document.querySelectorAll("[data-sentimento]").forEach(function (botao) {
  botao.addEventListener("click", function () {
    document.getElementById("fim-pergunta").hidden = true;
    document.getElementById("fim-obrigado").hidden = false;
  });
});

// ===== TIMER =====
const blocosTimer = ["timer-escolha", "timer-andamento", "timer-fim"];
const contagemTimer = document.getElementById("timer-contagem");

function prepararTimer() {
  mostrarBlocos(blocosTimer, ["timer-escolha"]);
  anunciar("Quanto tempo você quer reservar?");
  focar(primeiroControle("timer-escolha"));
}

document.querySelectorAll("[data-minutos]").forEach(function (botao) {
  botao.addEventListener("click", function () {
    mostrarBlocos(blocosTimer, ["timer-andamento"]);
    anunciar("Pausa iniciada. Esse momento é seu.");
    focar(primeiroControle("timer-andamento"));
    iniciarContagem(Number(botao.dataset.minutos) * 60, contagemTimer, function () {
      mostrarBlocos(blocosTimer, ["timer-fim"]);
      anunciar("Sua pausa terminou. Você pode voltar quando se sentir pronto.");
      focar(primeiroControle("timer-fim"));
    });
  });
});

// ===== RELAXAR =====
const frases = [
  "Afaste-se por alguns instantes.",
  "Relaxe os ombros.",
  "Respire lentamente.",
  "Deixe as tarefas para depois."
];
const blocosRelaxar = ["relaxar-ativo", "relaxar-fim"];
const fraseRelaxar = document.getElementById("relaxar-frase");
const contagemRelaxar = document.getElementById("relaxar-contagem");
const chips = document.querySelectorAll("[data-relaxar-minutos]");

function iniciarRelaxar() {
  mostrarBlocos(blocosRelaxar, ["relaxar-ativo"]);
  cancelarTimerRelaxar();
  anunciar("Momento de relaxar.");
  focar(primeiroControle("relaxar-ativo"));
  mostrarFrase(0);
}

// Troca a frase a cada 7 segundos
function mostrarFrase(indice) {
  fraseRelaxar.textContent = frases[indice % frases.length];
  // Reinicia a animação de aparecer
  fraseRelaxar.style.animation = "none";
  void fraseRelaxar.offsetWidth;
  fraseRelaxar.style.animation = "";
  esperar(function () { mostrarFrase(indice + 1); }, 7000);
}

function cancelarTimerRelaxar() {
  clearInterval(intervalo);
  intervalo = null;
  contagemRelaxar.hidden = true;
  chips.forEach(function (chip) { chip.setAttribute("aria-pressed", "false"); });
}

chips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    // Clicar no botão já escolhido cancela o timer
    if (chip.getAttribute("aria-pressed") === "true") {
      cancelarTimerRelaxar();
      return;
    }
    cancelarTimerRelaxar();
    chip.setAttribute("aria-pressed", "true");
    contagemRelaxar.hidden = false;
    iniciarContagem(Number(chip.dataset.relaxarMinutos) * 60, contagemRelaxar, function () {
      pararTudo(); // para também a troca de frases
      mostrarBlocos(blocosRelaxar, ["relaxar-fim"]);
      anunciar("Sua pausa terminou. Você pode voltar quando se sentir pronto.");
      focar(primeiroControle("relaxar-fim"));
    });
  });
});
