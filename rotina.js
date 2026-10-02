// ===== MINHA ROTINA (rotina.html) =====
// Os dados são fictícios e ficam só na memória:
// ao recarregar a página, tudo volta ao original.

// ----- 1. DADOS -----

// Cada atividade é um objeto. Os campos que controlam o histórico são:
//   concluida:     true/false (hoje funciona como o "status": pendente ou concluída)
//   dataConclusao: dia em que foi concluída, no formato "AAAA-MM-DD" (null enquanto pendente)
// FUTURO (banco de dados): cada atividade viraria uma linha de uma tabela, com
// id, status ("pendente" ou "concluida") e data_conclusao. Concluir seria um UPDATE
// nessa linha e excluir seria um DELETE. A tela continuaria igual.

// FUTURO: quando existir banco de dados, troque SÓ o conteúdo desta função
// por uma busca no banco. O resto da página continua funcionando igual,
// desde que cada atividade tenha estes campos.
function carregarAtividades() {
  return [
    {
      id: 1,
      titulo: "Prova de Psicologia",
      tipo: "Prova",
      data: "Amanhã",
      horario: "10:00",
      prioridade: "Alta",
      descricao: "Revisar capítulos 4, 5 e 6.",
      concluida: false,
      dataConclusao: null
    },
    {
      id: 2,
      titulo: "Trabalho de Empreendedorismo",
      tipo: "Trabalho",
      data: "05 OUT",
      horario: "Entrega",
      prioridade: "Média",
      descricao: "Finalizar apresentação do projeto.",
      concluida: false,
      dataConclusao: null
    },
    {
      id: 3,
      titulo: "Projeto Integrador",
      tipo: "Projeto",
      data: "10 OUT",
      horario: "Em andamento",
      prioridade: "Baixa",
      descricao: "Continuar desenvolvimento do protótipo.",
      concluida: false,
      dataConclusao: null
    },
    // Atividades já concluídas (fictícias). Elas aparecem na seção "Atividades concluídas"
    // e fazem o contador de concluídas começar em 5.
    { id: 4, titulo: "Seminário de Sociologia", tipo: "Trabalho", data: "28 SET", horario: "", prioridade: "Média", descricao: "", concluida: true, dataConclusao: "2026-09-28" },
    { id: 5, titulo: "Revisão de Estatística", tipo: "Estudo", data: "27 SET", horario: "", prioridade: "Baixa", descricao: "", concluida: true, dataConclusao: "2026-09-27" },
    { id: 6, titulo: "Prova de Metodologia", tipo: "Prova", data: "25 SET", horario: "", prioridade: "Alta", descricao: "", concluida: true, dataConclusao: "2026-09-25" },
    { id: 7, titulo: "Resenha de Antropologia", tipo: "Trabalho", data: "22 SET", horario: "", prioridade: "Média", descricao: "", concluida: true, dataConclusao: "2026-09-22" },
    { id: 8, titulo: "Estudo de Biologia", tipo: "Estudo", data: "20 SET", horario: "", prioridade: "Baixa", descricao: "", concluida: true, dataConclusao: "2026-09-20" }
  ];
}

let atividades = carregarAtividades();
let proximoId = Math.max(0, ...atividades.map(function (a) { return a.id; })) + 1;

// Filtros atuais (os três funcionam em conjunto)
const filtros = { tipo: "Todas", prioridade: "Todas", busca: "" };

// ----- 2. ELEMENTOS DA PÁGINA -----
const listaAtividades = document.getElementById("lista-atividades");
const estadoVazio = document.getElementById("estado-vazio");
const listaConcluidas = document.getElementById("lista-concluidas");
const vazioConcluidas = document.getElementById("vazio-concluidas");
const campoBusca = document.getElementById("campo-busca");
const botoesFiltro = document.querySelectorAll("[data-filtro]");
const botaoAdicionar = document.getElementById("botao-adicionar");
const aviso = document.getElementById("aviso");
const avisoTexto = document.getElementById("aviso-texto");
const botaoDesfazer = document.getElementById("botao-desfazer");
const modal = document.getElementById("modal");
const formulario = document.getElementById("form-atividade");

const iconesPrioridade = { "Alta": "🔴", "Média": "🟡", "Baixa": "🟢" };

// ----- 3. FUNÇÕES AUXILIARES -----

// Tira acentos e maiúsculas, para a busca achar "psicologia" em "Psicologia"
function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Classe CSS de cada prioridade ("Média" -> "prioridade-media")
function classePrioridade(prioridade) {
  return "prioridade-" + normalizar(prioridade);
}

// Converte "2026-10-05" em "05 OUT"
function formatarData(dataISO) {
  const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  const partes = dataISO.split("-");
  return partes[2] + " " + meses[Number(partes[1]) - 1];
}

// Data de hoje no formato "AAAA-MM-DD" (usa o fuso do computador do usuário)
function dataDeHoje() {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0"); // getMonth() começa em 0
  const dia = String(hoje.getDate()).padStart(2, "0");
  return hoje.getFullYear() + "-" + mes + "-" + dia;
}

// Escolhe singular ou plural conforme o número
function pluralizar(numero, singular, plural) {
  return numero === 1 ? singular : plural;
}

// ----- 4. FILTROS E PESQUISA -----

// Devolve só as atividades PENDENTES que combinam com os filtros e a busca
// (as concluídas ficam na seção "Atividades concluídas", sem filtro)
function aplicarFiltros() {
  const busca = normalizar(filtros.busca.trim());

  return atividades.filter(function (atividade) {
    const tipoOk = filtros.tipo === "Todas" || atividade.tipo === filtros.tipo;
    const prioridadeOk = filtros.prioridade === "Todas" || atividade.prioridade === filtros.prioridade;
    const buscaOk = busca === "" || normalizar(atividade.titulo).includes(busca);
    return !atividade.concluida && tipoOk && prioridadeOk && buscaOk;
  });
}

// Marca visualmente o botão escolhido em cada grupo de filtro
function marcarBotoesFiltro() {
  botoesFiltro.forEach(function (botao) {
    const escolhido = filtros[botao.dataset.filtro] === botao.dataset.valor;
    botao.setAttribute("aria-pressed", escolhido ? "true" : "false");
  });
}

botoesFiltro.forEach(function (botao) {
  botao.addEventListener("click", function () {
    filtros[botao.dataset.filtro] = botao.dataset.valor;
    marcarBotoesFiltro();
    mostrarAtividades();
  });
});

campoBusca.addEventListener("input", function () {
  filtros.busca = campoBusca.value;
  mostrarAtividades();
});

// Volta tudo para "Todas" e limpa a busca
function limparFiltros() {
  filtros.tipo = "Todas";
  filtros.prioridade = "Todas";
  filtros.busca = "";
  campoBusca.value = "";
  marcarBotoesFiltro();
}

// ----- 5. DESENHAR A LISTA -----

// Cria o card de uma atividade
function criarCard(atividade) {
  const card = document.createElement("article");
  card.className = "card atividade" + (atividade.concluida ? " concluida" : "");
  card.dataset.id = atividade.id;

  // Caixa para marcar como concluída
  const caixa = document.createElement("input");
  caixa.type = "checkbox";
  caixa.className = "concluir";
  caixa.checked = atividade.concluida;
  caixa.setAttribute("aria-label", "Marcar como concluída: " + atividade.titulo);
  caixa.addEventListener("change", function () { concluirAtividade(atividade.id); });

  // Bolinha de prioridade (ou ✅ quando concluída)
  const icone = document.createElement("span");
  icone.className = "atividade-icone";
  icone.textContent = atividade.concluida ? "✅" : iconesPrioridade[atividade.prioridade];

  // Título, tipo · data · horário, descrição
  // (textContent evita que o texto digitado vire HTML)
  const info = document.createElement("div");
  info.className = "atividade-info";
  const titulo = document.createElement("h3");
  titulo.textContent = atividade.titulo;
  const detalhes = document.createElement("p");
  detalhes.textContent = [atividade.tipo, atividade.data, atividade.horario]
    .filter(Boolean)
    .join(" · ");
  info.append(titulo, detalhes);
  if (atividade.descricao) {
    const descricao = document.createElement("p");
    descricao.className = "atividade-descricao";
    descricao.textContent = atividade.descricao;
    info.append(descricao);
  }

  // Lado direito: prioridade e botão de excluir
  const lado = document.createElement("div");
  lado.className = "atividade-lado";
  const etiqueta = document.createElement("span");
  etiqueta.className = "etiqueta " + classePrioridade(atividade.prioridade);
  etiqueta.textContent = "Prioridade: " + atividade.prioridade;
  const excluir = document.createElement("button");
  excluir.type = "button";
  excluir.className = "excluir";
  excluir.textContent = "Excluir";
  excluir.setAttribute("aria-label", "Excluir atividade: " + atividade.titulo);
  excluir.addEventListener("click", function () { excluirAtividade(atividade.id); });
  lado.append(etiqueta, excluir);

  card.append(caixa, icone, info, lado);
  return card;
}

// Desenha a lista (já filtrada) ou a mensagem de "nenhuma atividade"
function mostrarAtividades() {
  const visiveis = aplicarFiltros();

  listaAtividades.innerHTML = "";
  visiveis.forEach(function (atividade) {
    listaAtividades.append(criarCard(atividade));
  });

  estadoVazio.hidden = visiveis.length > 0;
}

// Cria o card de uma atividade concluída (sem checkbox; só o botão Excluir)
function criarCardConcluido(atividade) {
  const card = document.createElement("article");
  card.className = "card atividade concluida"; // a classe "concluida" deixa o card mais discreto
  card.dataset.id = atividade.id;

  const icone = document.createElement("span");
  icone.className = "atividade-icone";
  icone.textContent = "✅";

  const info = document.createElement("div");
  info.className = "atividade-info";
  const titulo = document.createElement("h3");
  titulo.textContent = atividade.titulo;
  const detalhes = document.createElement("p");
  detalhes.textContent = [
    atividade.tipo,
    atividade.data,
    atividade.dataConclusao ? "Concluída em " + formatarData(atividade.dataConclusao) : ""
  ].filter(Boolean).join(" · ");
  info.append(titulo, detalhes);

  const lado = document.createElement("div");
  lado.className = "atividade-lado atividade-lado-linha"; // botões lado a lado

  // Retomar: devolve a atividade (a mesma, não uma cópia) para a lista de pendentes
  const retomar = document.createElement("button");
  retomar.type = "button";
  retomar.className = "retomar";
  retomar.textContent = "Retomar";
  retomar.setAttribute("aria-label", "Retomar atividade: " + atividade.titulo);
  retomar.addEventListener("click", function () { reabrirAtividade(atividade.id); });

  const excluir = document.createElement("button");
  excluir.type = "button";
  excluir.className = "excluir";
  excluir.textContent = "Excluir";
  excluir.setAttribute("aria-label", "Excluir atividade concluída: " + atividade.titulo);
  // Reaproveita a mesma função de excluir das pendentes (ela pede confirmação)
  excluir.addEventListener("click", function () { excluirAtividade(atividade.id); });
  lado.append(retomar, excluir);

  card.append(icone, info, lado);
  return card;
}

// Desenha a seção "Atividades concluídas" (a mais recente primeiro)
function mostrarConcluidas() {
  const concluidas = atividades
    .filter(function (a) { return a.concluida; })
    .sort(function (a, b) { return b.dataConclusao.localeCompare(a.dataConclusao); });
  // Como "AAAA-MM-DD" é sempre do mesmo tamanho, comparar como texto ordena pela data

  listaConcluidas.innerHTML = "";
  concluidas.forEach(function (atividade) {
    listaConcluidas.append(criarCardConcluido(atividade));
  });

  vazioConcluidas.hidden = concluidas.length > 0;
}

// ----- 6. CONTADORES -----
function atualizarContadores() {
  const pendentes = atividades.filter(function (a) { return !a.concluida; });
  const urgentes = pendentes.filter(function (a) { return a.prioridade === "Alta"; });
  // O contador é calculado a partir da lista, então sempre bate com o que aparece na tela
  const concluidas = atividades.filter(function (a) { return a.concluida; }).length;

  document.getElementById("contador-pendentes").textContent = pendentes.length;
  document.getElementById("contador-urgentes").textContent = urgentes.length;
  document.getElementById("contador-concluidas").textContent = concluidas;

  document.getElementById("texto-pendentes").textContent =
    pluralizar(pendentes.length, "atividade pendente", "atividades pendentes");
  document.getElementById("texto-urgentes").textContent =
    pluralizar(urgentes.length, "atividade urgente", "atividades urgentes");
  document.getElementById("texto-concluidas").textContent =
    pluralizar(concluidas, "atividade concluída", "atividades concluídas");
}

// Atualiza as duas listas (pendentes e concluídas) e os contadores
function atualizarTela() {
  mostrarAtividades();
  mostrarConcluidas();
  atualizarContadores();
}

// ----- 7. AÇÕES: ADICIONAR, CONCLUIR, EXCLUIR -----

function adicionarAtividade(dados) {
  atividades.push({
    id: proximoId,
    titulo: dados.titulo,
    tipo: dados.tipo,
    data: dados.data,
    horario: dados.horario,
    prioridade: dados.prioridade,
    descricao: dados.descricao,
    concluida: false,
    dataConclusao: null
  });
  proximoId++;

  // Limpa os filtros para a nova atividade aparecer imediatamente
  limparFiltros();
  atualizarTela();
}

// Marca como concluída: a atividade sai da lista de pendentes
// e passa para a seção "Atividades concluídas" (ela continua na lista "atividades")
function concluirAtividade(id) {
  const atividade = atividades.find(function (a) { return a.id === id; });
  atividade.concluida = true;
  atividade.dataConclusao = dataDeHoje();
  atualizarTela();

  // Avisa e oferece "Desfazer" por alguns segundos (sem janela de confirmação, para ser rápido)
  mostrarAviso(atividade);
  botaoDesfazer.focus(); // o card sumiu da lista; levar o foco ao "Desfazer" ajuda quem usa teclado
}

// Volta uma atividade concluída para pendente. Usada por "Desfazer" e por "Retomar".
// Não cria uma atividade nova: é o MESMO objeto da lista, só muda o estado.
// FUTURO (banco de dados): seria um UPDATE na mesma linha, com status = "pendente"
// e data_conclusao = NULL (nunca um INSERT).
function reabrirAtividade(id) {
  const atividade = atividades.find(function (a) { return a.id === id; });
  if (!atividade) return; // já foi excluída: não há o que reabrir

  atividade.concluida = false;
  atividade.dataConclusao = null;
  if (idDoAviso === id) esconderAviso();
  atualizarTela();
  focarAtividade(id);
}

// Leva o foco ao checkbox da atividade (se ela está visível na lista) ou ao botão de adicionar
function focarAtividade(id) {
  const caixa = document.querySelector('[data-id="' + id + '"] .concluir');
  (caixa || botaoAdicionar).focus();
}

// ----- AVISO COM "DESFAZER" (aparece depois de concluir) -----
const DURACAO_AVISO = 7000; // por quanto tempo o "Desfazer" fica disponível (em milissegundos)
let idDoAviso = null;       // id da atividade a que o aviso se refere
let relogioDoAviso = null;  // guarda o temporizador para poder cancelá-lo

function mostrarAviso(atividade) {
  idDoAviso = atividade.id;
  avisoTexto.textContent = '"' + atividade.titulo + '" foi concluída.';
  aviso.hidden = false;
  clearTimeout(relogioDoAviso); // se já havia um aviso aberto, a contagem recomeça
  relogioDoAviso = setTimeout(esconderAviso, DURACAO_AVISO);
}

function esconderAviso() {
  clearTimeout(relogioDoAviso);
  aviso.hidden = true;
  idDoAviso = null;
}

botaoDesfazer.addEventListener("click", function () {
  const id = idDoAviso;
  esconderAviso();
  reabrirAtividade(id);
});

// Exclui pendente ou concluída: remove da lista e os contadores se ajustam sozinhos
function excluirAtividade(id) {
  if (!window.confirm("Tem certeza que deseja excluir esta atividade?")) return;

  atividades = atividades.filter(function (a) { return a.id !== id; });
  if (idDoAviso === id) esconderAviso(); // não faz sentido oferecer "Desfazer" de algo excluído
  atualizarTela();
  botaoAdicionar.focus();
}

// ----- 8. MODAL -----
function abrirModal() {
  modal.hidden = false;
  document.getElementById("campo-titulo").focus();
}

function fecharModal() {
  modal.hidden = true;
  formulario.reset();
  botaoAdicionar.focus();
}

botaoAdicionar.addEventListener("click", abrirModal);
document.getElementById("botao-cancelar").addEventListener("click", fecharModal);

// Fecha ao clicar fora da caixa ou apertar Esc
modal.addEventListener("click", function (evento) {
  if (evento.target === modal) fecharModal();
});
document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape" && !modal.hidden) fecharModal();
});

// Salvar: lê os campos e chama adicionarAtividade
formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const titulo = document.getElementById("campo-titulo").value.trim();
  if (titulo === "") return;

  adicionarAtividade({
    titulo: titulo,
    tipo: document.getElementById("campo-tipo").value,
    data: formatarData(document.getElementById("campo-data").value),
    horario: document.getElementById("campo-horario").value,
    prioridade: document.getElementById("campo-prioridade").value,
    descricao: document.getElementById("campo-descricao").value.trim()
  });

  fecharModal();
});

// ----- 9. INÍCIO -----
atualizarTela();
