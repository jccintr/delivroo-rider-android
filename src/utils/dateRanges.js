// Calcula os intervalos de data dos filtros pré-definidos da tela
// "Minhas Entregas" (Hoje / Esta semana / Este mês). Usa os getters locais
// do Date (não UTC) de propósito: o aparelho do rider está no fuso de
// Brasília, e a API também ancora datas soltas (AAAA-MM-DD) no dia civil
// de Brasília — então "hoje" aqui bate com "hoje" que a API vai entender.

function toDateOnlyString(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Início da semana na segunda-feira (padrão usado no Brasil), não domingo.
function startOfWeek(date) {
  const day = date.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - diffToMonday);
  return monday;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Retorna { from, to } (strings AAAA-MM-DD) para o período informado, ou
// { from: undefined, to: undefined } se period não for reconhecido (ou for
// null/'' — "sem filtro de período"). `to` é sempre "hoje": não faz
// sentido estender até o fim da semana/mês se esses dias ainda não
// aconteceram.
export function getPeriodRange(period) {
  const now = new Date();
  const today = toDateOnlyString(now);

  switch (period) {
    case 'today':
      return { from: today, to: today };
    case 'week':
      return { from: toDateOnlyString(startOfWeek(now)), to: today };
    case 'month':
      return { from: toDateOnlyString(startOfMonth(now)), to: today };
    default:
      return { from: undefined, to: undefined };
  }
}