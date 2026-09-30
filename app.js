// ===== DASHBOARD (index.html) =====
// Nesta versão os dados são fictícios e ficam só na memória:
// ao recarregar a página, tudo volta ao original.

// Lista de atividades de exemplo
const atividades = [
  { titulo: "Prova de Psicologia", tipo: "Prova", quando: "Amanhã · 10:00", prioridade: "Alta" },
  { titulo: "Trabalho de Empreendedorismo", tipo: "Trabalho", quando: "05 OUT · Entrega", prioridade: "Média" },
  { titulo: "Projeto Integrador", tipo: "Projeto", quando: "10 OUT · Em andamento", prioridade: "Baixa" }
];

// Elementos da página
const listaAtividades = document.getElementById("lista-atividades");
const contadorPendentes = document.getElementById("contador-pendentes");
const contadorUrgentes = document.getElementById("contador-urgentes");
const modal = document.getElementById("modal");
const formulario = document.getElementById("form-atividade");

// Bolinha colorida de cada prioridade
const iconesPrioridade = { "Alta": "🔴", "Média": "🟡", "Baixa": "🟢" };

// Classe CSS de cada prioridade ("Média" -> "prioridade-media")
function classePrioridade(prioridade) {
  return "prioridade-" + prioridade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Desenha a lista de atividades na tela
function mostrarAtividades() {
  listaAtividades.innerHTML = "";

  atividades.forEach(function (atividade) {
    const card = document.createElement("article");
    card.className = "card atividade";

    // textContent evita que o texto digitado vire HTML
    const icone = document.createElement("span");
    icone.className = "atividade-icone";
    icone.textContent = iconesPrioridade[atividade.prioridade];

    const info = document.createElement("div");
    info.className = "atividade-info";
    const titulo = document.createElement("h3");
    titulo.textContent = atividade.titulo;
    const quando = document.createElement("p");
    quando.textContent = atividade.tipo + " · " + atividade.quando;
    info.append(titulo, quando);

    if (atividade.descricao) {
      const descricao = document.createElement("p");
      descricao.className = "atividade-descricao";
      descricao.textContent = atividade.descricao;
      info.append(descricao);
    }

    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta " + classePrioridade(atividade.prioridade);
    etiqueta.textContent = "Prioridade: " + atividade.prioridade;

    card.append(icone, info, etiqueta);
    listaAtividades.append(card);
  });

  atualizarResumo();
}

// Atualiza os números dos cards de resumo
function atualizarResumo() {
  contadorPendentes.textContent = atividades.length;
  contadorUrgentes.textContent = atividades.filter(a => a.prioridade === "Alta").length;
}

// Converte "2026-10-05" em "05 OUT"
function formatarData(dataISO) {
  const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  const partes = dataISO.split("-");
  return partes[2] + " " + meses[Number(partes[1]) - 1];
}

// ----- Modal -----
function abrirModal() {
  modal.hidden = false;
  document.getElementById("campo-titulo").focus();
}

function fecharModal() {
  modal.hidden = true;
  formulario.reset();
}

document.getElementById("botao-adicionar").addEventListener("click", abrirModal);
document.getElementById("botao-cancelar").addEventListener("click", fecharModal);

// Fecha ao clicar fora da caixa ou apertar Esc
modal.addEventListener("click", function (evento) {
  if (evento.target === modal) fecharModal();
});
document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape" && !modal.hidden) fecharModal();
});

// Salva a nova atividade (apenas na memória)
formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const horario = document.getElementById("campo-horario").value;
  const data = formatarData(document.getElementById("campo-data").value);

  atividades.push({
    titulo: document.getElementById("campo-titulo").value,
    tipo: document.getElementById("campo-tipo").value,
    quando: horario ? data + " · " + horario : data,
    prioridade: document.getElementById("campo-prioridade").value,
    descricao: document.getElementById("campo-descricao").value
  });

  mostrarAtividades();
  fecharModal();
});

// Início
mostrarAtividades();
