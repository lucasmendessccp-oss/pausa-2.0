// ===== CALENDÁRIO (calendario.html) =====
// Os dados são fictícios e ficam só na memória:
// ao recarregar a página, tudo volta ao original.
//
// FUTURO: hoje esta página tem a sua própria lista de atividades.
// Quando houver banco de dados, Dashboard, Minha rotina e Calendário vão
// ler a MESMA lista (a tabela de atividades), e só a função carregarAtividades() muda.

// ----- 1. FUNÇÕES DE DATA -----
// Neste arquivo as datas são guardadas como texto "AAAA-MM-DD" (ex.: "2026-10-18").
// É o mesmo formato do <input type="date"> e dos bancos de dados (tipo DATE).

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
               "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function doisDigitos(numero) {
  return String(numero).padStart(2, "0"); // 5 -> "05"
}

// Date -> "AAAA-MM-DD".
// Não usamos toISOString(): ele converte para UTC e pode trocar o dia no Brasil à noite.
function paraISO(data) {
  return data.getFullYear() + "-" + doisDigitos(data.getMonth() + 1) + "-" + doisDigitos(data.getDate());
}

// "AAAA-MM-DD" -> Date.
// Não usamos new Date("2026-10-18"): ele também interpreta como UTC e pode voltar um dia.
function criarData(iso) {
  const partes = iso.split("-").map(Number);
  return new Date(partes[0], partes[1] - 1, partes[2]); // o mês começa em 0 (janeiro = 0)
}

// Data de hoje somada a alguns dias (usada nos dados fictícios, para o calendário
// sempre abrir com atividades perto do dia atual)
function dataEmDias(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return paraISO(data);
}

function pluralizar(numero, singular, plural) {
  return numero === 1 ? singular : plural;
}

// Tira acentos e maiúsculas ("Média" -> "media"); usado nos nomes das classes CSS
function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ----- 2. DADOS -----

// FUTURO: quando houver banco de dados, esta atividade poderá possuir
// um ID persistente, status, data de conclusão etc.
// Troque SÓ o conteúdo desta função por uma busca no banco.
function carregarAtividades() {
  return [
    { id: 1, titulo: "Prova de Psicologia", tipo: "Prova", data: dataEmDias(1), horario: "10:00", prioridade: "Alta", descricao: "Revisar capítulos 4, 5 e 6.", concluida: false },
    { id: 2, titulo: "Seminário de Sociologia", tipo: "Trabalho", data: dataEmDias(1), horario: "14:00", prioridade: "Média", descricao: "Apresentação em grupo.", concluida: false },
    { id: 3, titulo: "Revisão de Estatística", tipo: "Estudo", data: dataEmDias(1), horario: "19:00", prioridade: "Baixa", descricao: "", concluida: false },
    { id: 4, titulo: "Trabalho de Empreendedorismo", tipo: "Trabalho", data: dataEmDias(4), horario: "18:00", prioridade: "Média", descricao: "Finalizar apresentação do projeto.", concluida: false },
    { id: 5, titulo: "Estudo de Biologia", tipo: "Estudo", data: dataEmDias(6), horario: "16:00", prioridade: "Baixa", descricao: "", concluida: false },
    // Um dia com várias atividades, para testar vários indicadores
    { id: 6, titulo: "Projeto Integrador", tipo: "Projeto", data: dataEmDias(9), horario: "", prioridade: "Baixa", descricao: "Continuar desenvolvimento do protótipo.", concluida: false },
    { id: 7, titulo: "Prova de Metodologia", tipo: "Prova", data: dataEmDias(9), horario: "08:00", prioridade: "Alta", descricao: "", concluida: false },
    { id: 8, titulo: "Resenha de Antropologia", tipo: "Trabalho", data: dataEmDias(9), horario: "12:00", prioridade: "Média", descricao: "", concluida: false },
    { id: 9, titulo: "Estudo de Direito", tipo: "Estudo", data: dataEmDias(9), horario: "20:00", prioridade: "Baixa", descricao: "", concluida: false },
    { id: 10, titulo: "Apresentação do Projeto", tipo: "Projeto", data: dataEmDias(9), horario: "15:00", prioridade: "Média", descricao: "", concluida: false },
    { id: 11, titulo: "Prova de Sociologia", tipo: "Prova", data: dataEmDias(16), horario: "09:00", prioridade: "Alta", descricao: "", concluida: false },
    { id: 12, titulo: "Trabalho em grupo", tipo: "Trabalho", data: dataEmDias(21), horario: "", prioridade: "Média", descricao: "", concluida: false },
    { id: 13, titulo: "Projeto de Extensão", tipo: "Projeto", data: dataEmDias(26), horario: "", prioridade: "Média", descricao: "", concluida: false },
    // Atividade concluída: NÃO aparece no calendário (ela fica na página Minha rotina)
    { id: 14, titulo: "Resenha de Psicologia Social", tipo: "Trabalho", data: dataEmDias(-2), horario: "", prioridade: "Média", descricao: "", concluida: true }
  ];
}

let atividades = carregarAtividades();
let proximoId = Math.max(0, ...atividades.map(function (a) { return a.id; })) + 1;

// ----- 3. ESTADO DA TELA -----
let mesExibido = new Date(new Date().getFullYear(), new Date().getMonth(), 1); // sempre dia 1
let diaSelecionado = null;                      // "AAAA-MM-DD" ou null
const filtros = { tipo: "Todas", prioridade: "Todas" };
let celulas = {};                               // "AAAA-MM-DD" -> botão do dia (para trocar o destaque)

const MAX_INDICADORES = 4;                      // mais que isso vira "+N"
const ORDEM_PRIORIDADE = { "Alta": 0, "Média": 1, "Baixa": 2 };

// ----- 4. ELEMENTOS DA PÁGINA -----
const tituloMes = document.getElementById("titulo-mes");
const grade = document.getElementById("grade-dias");
const botoesFiltro = document.querySelectorAll("[data-filtro]");
const botaoAdicionar = document.getElementById("botao-adicionar");
const botaoAdicionarDia = document.getElementById("botao-adicionar-dia");
const painelData = document.getElementById("painel-data");
const painelContagem = document.getElementById("painel-contagem");
const painelLista = document.getElementById("painel-lista");
const painelVazio = document.getElementById("painel-vazio");
const resumoTitulo = document.getElementById("resumo-titulo");
const resumoItens = document.getElementById("resumo-itens");
const mensagemTitulo = document.getElementById("mensagem-titulo");
const mensagemTexto = document.getElementById("mensagem-texto");
const modal = document.getElementById("modal");
const formulario = document.getElementById("form-atividade");

// ----- 5. BUSCAR ATIVIDADES -----

// A atividade passa nos filtros de tipo e prioridade?
function passaNosFiltros(atividade) {
  const tipoOk = filtros.tipo === "Todas" || atividade.tipo === filtros.tipo;
  const prioridadeOk = filtros.prioridade === "Todas" || atividade.prioridade === filtros.prioridade;
  return tipoOk && prioridadeOk;
}

// Atividades PENDENTES de um dia que passam nos filtros (as concluídas ficam de fora)
function atividadesDoDia(iso) {
  return atividades.filter(function (a) {
    return !a.concluida && a.data === iso && passaNosFiltros(a);
  });
}

// Atividades pendentes de um mês, SEM aplicar os filtros (usado no resumo e na mensagem)
function atividadesDoMes(ano, mes) {
  const prefixo = ano + "-" + doisDigitos(mes + 1); // ex.: "2026-10"
  return atividades.filter(function (a) {
    return !a.concluida && a.data.slice(0, 7) === prefixo;
  });
}

// ----- 6. DESENHAR O CALENDÁRIO -----

function criarIndicador(prioridade) {
  const ponto = document.createElement("span");
  ponto.className = "ponto ponto-" + normalizar(prioridade); // ponto-alta, ponto-media, ponto-baixa
  return ponto;
}

// Cria o botão de um dia da grade
function criarCelula(data, iso, mesDoCalendario, ehHoje) {
  const doDia = atividadesDoDia(iso);

  const celula = document.createElement("button");
  celula.type = "button";
  celula.className = "dia"
    + (data.getMonth() !== mesDoCalendario ? " fora-do-mes" : "")
    + (ehHoje ? " hoje" : "")
    + (iso === diaSelecionado ? " selecionado" : "");
  celula.dataset.data = iso;
  celula.setAttribute("aria-pressed", iso === diaSelecionado ? "true" : "false");
  celula.setAttribute("aria-label",
    data.getDate() + " de " + MESES[data.getMonth()].toLowerCase()
    + (ehHoje ? ", hoje" : "")
    + ", " + (doDia.length === 0 ? "sem atividades" : doDia.length + pluralizar(doDia.length, " atividade", " atividades")));

  const numero = document.createElement("span");
  numero.className = "dia-numero";
  numero.textContent = data.getDate();
  celula.append(numero);

  // Uma bolinha por atividade (as mais importantes primeiro). Passou do limite, mostra "+N".
  if (doDia.length > 0) {
    const pontos = document.createElement("span");
    pontos.className = "pontos";
    pontos.setAttribute("aria-hidden", "true");

    const porPrioridade = doDia.slice().sort(function (a, b) {
      return ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade];
    });
    porPrioridade.slice(0, MAX_INDICADORES).forEach(function (atividade) {
      pontos.append(criarIndicador(atividade.prioridade));
    });
    if (doDia.length > MAX_INDICADORES) {
      const mais = document.createElement("span");
      mais.className = "pontos-mais";
      mais.textContent = "+" + (doDia.length - MAX_INDICADORES);
      pontos.append(mais);
    }
    celula.append(pontos);
  }

  celula.addEventListener("click", function () { selecionarDia(iso); });
  return celula;
}

// Monta a grade do mês exibido
function desenharCalendario() {
  const ano = mesExibido.getFullYear();
  const mes = mesExibido.getMonth();
  tituloMes.textContent = MESES[mes] + " " + ano;

  // Em que dia da semana o mês começa? A semana começa na segunda:
  // getDay() devolve 0 = domingo ... 6 = sábado, então somamos 6 e usamos o resto
  // da divisão por 7 para ter 0 = segunda ... 6 = domingo.
  const posicaoDoDia1 = (new Date(ano, mes, 1).getDay() + 6) % 7;
  const diasNoMes = new Date(ano, mes + 1, 0).getDate(); // dia 0 do próximo mês = último dia deste
  const totalCelulas = Math.ceil((posicaoDoDia1 + diasNoMes) / 7) * 7; // semanas completas

  const hojeISO = paraISO(new Date());
  grade.innerHTML = "";
  celulas = {};

  for (let i = 0; i < totalCelulas; i++) {
    // O JavaScript aceita dias fora do mês: o dia 0 vira o último do mês anterior,
    // o dia 32 vira o começo do próximo. Assim os dias "de fora" saem de graça.
    const data = new Date(ano, mes, 1 - posicaoDoDia1 + i);
    const iso = paraISO(data);
    const celula = criarCelula(data, iso, mes, iso === hojeISO);
    celulas[iso] = celula;
    grade.append(celula);
  }
}

// ----- 7. NAVEGAÇÃO ENTRE MESES -----

// Ao trocar de mês, seleciona o dia de hoje se ele estiver nesse mês
function diaInicialDoMes() {
  const hoje = new Date();
  const hojeEstaNoMes = hoje.getFullYear() === mesExibido.getFullYear() && hoje.getMonth() === mesExibido.getMonth();
  return hojeEstaNoMes ? paraISO(hoje) : null;
}

function mudarMes(quantidade) {
  // O JavaScript acerta o ano sozinho (mês 12 vira janeiro do ano seguinte)
  mesExibido = new Date(mesExibido.getFullYear(), mesExibido.getMonth() + quantidade, 1);
  diaSelecionado = diaInicialDoMes();
  atualizarTela();
}

function irParaHoje() {
  const hoje = new Date();
  mesExibido = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  diaSelecionado = paraISO(hoje);
  atualizarTela();
}

document.getElementById("botao-anterior").addEventListener("click", function () { mudarMes(-1); });
document.getElementById("botao-proximo").addEventListener("click", function () { mudarMes(1); });
document.getElementById("botao-hoje").addEventListener("click", irParaHoje);

// ----- 8. SELECIONAR UM DIA -----
function selecionarDia(iso) {
  const data = criarData(iso);
  const outroMes = data.getMonth() !== mesExibido.getMonth() || data.getFullYear() !== mesExibido.getFullYear();

  if (outroMes) {
    // Clicou num dia "de fora": mostra o mês dele e seleciona o dia
    mesExibido = new Date(data.getFullYear(), data.getMonth(), 1);
    diaSelecionado = iso;
    atualizarTela();
    return;
  }

  // Mesmo mês: só troca o destaque (não redesenha a grade, para o foco do teclado não se perder)
  if (celulas[diaSelecionado]) {
    celulas[diaSelecionado].classList.remove("selecionado");
    celulas[diaSelecionado].setAttribute("aria-pressed", "false");
  }
  diaSelecionado = iso;
  celulas[iso].classList.add("selecionado");
  celulas[iso].setAttribute("aria-pressed", "true");
  desenharPainel();
}

// ----- 9. PAINEL LATERAL DO DIA -----

// Cria uma linha de atividade no painel
function criarItemDia(atividade) {
  const item = document.createElement("div");
  item.className = "item-dia";

  const corpo = document.createElement("div");
  corpo.className = "item-corpo";

  const topo = document.createElement("div");
  topo.className = "item-topo";
  const titulo = document.createElement("h3");
  titulo.textContent = atividade.titulo; // textContent evita que o texto digitado vire HTML
  const etiqueta = document.createElement("span");
  etiqueta.className = "etiqueta prioridade-" + normalizar(atividade.prioridade); // estilo do dashboard.css
  etiqueta.textContent = atividade.prioridade;
  topo.append(titulo, etiqueta);

  const meta = document.createElement("p");
  meta.className = "item-meta";
  meta.textContent = atividade.tipo + " · " + (atividade.horario || "Sem horário definido");

  corpo.append(topo, meta);
  if (atividade.descricao) {
    const descricao = document.createElement("p");
    descricao.className = "item-descricao";
    descricao.textContent = atividade.descricao;
    corpo.append(descricao);
  }

  item.append(criarIndicador(atividade.prioridade), corpo);
  return item;
}

function desenharPainel() {
  painelLista.innerHTML = "";

  // Nenhum dia selecionado ainda
  if (!diaSelecionado) {
    painelData.textContent = "Selecione um dia";
    painelContagem.textContent = "Clique em um dia do calendário para ver as atividades.";
    painelVazio.hidden = true;
    botaoAdicionarDia.hidden = true;
    return;
  }

  const data = criarData(diaSelecionado);
  painelData.textContent = doisDigitos(data.getDate()) + " de " + MESES[data.getMonth()].toLowerCase();
  botaoAdicionarDia.hidden = false;

  // Ordena pelo horário (atividades sem horário vão para o fim)
  const doDia = atividadesDoDia(diaSelecionado).sort(function (a, b) {
    return (a.horario || "99:99").localeCompare(b.horario || "99:99");
  });

  painelContagem.textContent = doDia.length === 0
    ? ""
    : doDia.length + pluralizar(doDia.length, " atividade", " atividades");
  painelVazio.hidden = doDia.length > 0;

  doDia.forEach(function (atividade) {
    painelLista.append(criarItemDia(atividade));
  });
}

// ----- 10. RESUMO DO MÊS -----
function criarEstatistica(numero, texto) {
  const bloco = document.createElement("div");
  bloco.className = "estatistica";
  const forte = document.createElement("strong");
  forte.textContent = numero;
  const rotulo = document.createElement("span");
  rotulo.textContent = texto;
  bloco.append(forte, rotulo);
  return bloco;
}

function contarPorTipo(lista, tipo) {
  return lista.filter(function (a) { return a.tipo === tipo; }).length;
}

function contarAltas(lista) {
  return lista.filter(function (a) { return a.prioridade === "Alta"; }).length;
}

// O resumo conta TODAS as atividades pendentes do mês (os filtros só mudam o que o calendário mostra)
function desenharResumo() {
  const doMes = atividadesDoMes(mesExibido.getFullYear(), mesExibido.getMonth());
  const provas = contarPorTipo(doMes, "Prova");
  const trabalhos = contarPorTipo(doMes, "Trabalho");
  const projetos = contarPorTipo(doMes, "Projeto");
  const estudos = contarPorTipo(doMes, "Estudo");
  const altas = contarAltas(doMes);

  resumoTitulo.textContent = MESES[mesExibido.getMonth()] + " " + mesExibido.getFullYear();
  resumoItens.innerHTML = "";
  resumoItens.append(
    criarEstatistica(doMes.length, pluralizar(doMes.length, "atividade", "atividades")),
    criarEstatistica(provas, pluralizar(provas, "prova", "provas")),
    criarEstatistica(trabalhos, pluralizar(trabalhos, "trabalho", "trabalhos")),
    criarEstatistica(projetos, pluralizar(projetos, "projeto", "projetos")),
    criarEstatistica(estudos, pluralizar(estudos, "estudo", "estudos")),
    criarEstatistica(altas, pluralizar(altas, "de alta prioridade", "de alta prioridade"))
  );

  desenharMensagem(doMes.length, altas);
}

// ----- 11. MENSAGEM DO PAUSA -----
// Regras simples (sem IA). Para ajustar a sensibilidade, mude só os números abaixo.
const LIMITES_CARGA = {
  MUITAS_ATIVIDADES: 10, // a partir de 10 atividades no mês, o mês é "movimentado"
  MUITAS_ALTAS: 3        // a partir de 3 atividades de prioridade alta, o mês "exige atenção"
};

const MENSAGENS = {
  livre: {
    titulo: "Parece que sua agenda está livre por enquanto.",
    texto: "Aproveite o momento para descansar ou se antecipar às próximas atividades."
  },
  movimentado: {
    titulo: "Seu mês está bastante movimentado.",
    texto: "Organize suas prioridades e lembre-se de reservar momentos para descansar."
  },
  atencao: {
    titulo: "Seu mês tem algumas atividades que exigem atenção.",
    texto: "Organize suas prioridades e evite deixar tudo para a última hora."
  },
  tranquilo: {
    titulo: "Seu mês está mais tranquilo.",
    texto: "Aproveite esse espaço para manter seu ritmo e também reservar um tempo para você."
  }
};

// Classifica o mês. A ORDEM das regras importa: vale a primeira que for verdadeira.
function classificarMes(totalAtividades, totalAltas) {
  if (totalAtividades === 0) return "livre";
  if (totalAtividades >= LIMITES_CARGA.MUITAS_ATIVIDADES) return "movimentado";
  if (totalAltas >= LIMITES_CARGA.MUITAS_ALTAS) return "atencao"; // poucas atividades, mas várias importantes
  return "tranquilo";
}

function desenharMensagem(totalAtividades, totalAltas) {
  const mensagem = MENSAGENS[classificarMes(totalAtividades, totalAltas)];
  mensagemTitulo.textContent = mensagem.titulo;
  mensagemTexto.textContent = mensagem.texto;
}

// ----- 12. FILTROS -----
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
    atualizarTela();
  });
});

function limparFiltros() {
  filtros.tipo = "Todas";
  filtros.prioridade = "Todas";
  marcarBotoesFiltro();
}

// ----- 13. ADICIONAR ATIVIDADE (MODAL) -----
function abrirModal() {
  formulario.reset();
  // Se há um dia selecionado, a data já vem preenchida (o navegador mostra no formato 18/10/2026)
  if (diaSelecionado) document.getElementById("campo-data").value = diaSelecionado;
  modal.hidden = false;
  document.getElementById("campo-titulo").focus();
}

function fecharModal() {
  modal.hidden = true;
  formulario.reset();
}

botaoAdicionar.addEventListener("click", abrirModal);
botaoAdicionarDia.addEventListener("click", abrirModal);
document.getElementById("botao-cancelar").addEventListener("click", function () {
  fecharModal();
  botaoAdicionar.focus();
});

// Fecha ao clicar fora da caixa ou apertar Esc
modal.addEventListener("click", function (evento) {
  if (evento.target === modal) fecharModal();
});
document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape" && !modal.hidden) fecharModal();
});

function adicionarAtividade(dados) {
  atividades.push({
    id: proximoId, // FUTURO: o banco de dados gera o ID
    titulo: dados.titulo,
    tipo: dados.tipo,
    data: dados.data,
    horario: dados.horario,
    prioridade: dados.prioridade,
    descricao: dados.descricao,
    concluida: false
  });
  proximoId++;

  // Limpa os filtros para a nova atividade aparecer, vai para o mês dela e seleciona o dia
  limparFiltros();
  const data = criarData(dados.data);
  mesExibido = new Date(data.getFullYear(), data.getMonth(), 1);
  diaSelecionado = dados.data;
  atualizarTela();
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const titulo = document.getElementById("campo-titulo").value.trim();
  const data = document.getElementById("campo-data").value;
  if (titulo === "" || data === "") return;

  adicionarAtividade({
    titulo: titulo,
    tipo: document.getElementById("campo-tipo").value,
    data: data,
    horario: document.getElementById("campo-horario").value,
    prioridade: document.getElementById("campo-prioridade").value,
    descricao: document.getElementById("campo-descricao").value.trim()
  });

  fecharModal();
  botaoAdicionar.focus();
});

// ----- 14. INÍCIO -----
function atualizarTela() {
  desenharCalendario();
  desenharPainel();
  desenharResumo();
}

diaSelecionado = paraISO(new Date()); // começa com o dia de hoje selecionado
atualizarTela();
