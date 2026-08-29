import { api } from './api';

export const deliveryService = {
  // GET /riders/deliveries/available — entregas com status "disponível"
  // (sem rider atribuído), para exibir na tela Home.
  listAvailable: () => api('/riders/deliveries/available', { method: 'GET' }),

  // GET /riders/deliveries/active — entregas do próprio rider em andamento
  // (status 1, 2 ou 3), para exibir na tela Home junto com as disponíveis.
  listActive: () => api('/riders/deliveries/active', { method: 'GET' }),

  // GET /riders/deliveries/:id — detalhes de uma entrega específica, para
  // a tela de Detalhes da Entrega (antes do aceite) e para a tela Delivery
  // (depois do aceite).
  getById: (id) => api(`/riders/deliveries/${id}`, { method: 'GET' }),

  // POST /riders/deliveries/:id/accept — aceita a entrega. status 0 → 1.
  // Retorna 409 se ela já não estiver mais disponível (outro rider aceitou
  // primeiro, ou a loja cancelou nesse meio-tempo).
  accept: (id) => api(`/riders/deliveries/${id}/accept`, { method: 'POST' }),

  // POST /riders/deliveries/:id/pickup — confirma a retirada. status 1 → 2.
  pickup: (id) => api(`/riders/deliveries/${id}/pickup`, { method: 'POST' }),

  // POST /riders/deliveries/:id/en-route — marca como a caminho do
  // destino. status 2 → 3.
  enRoute: (id) => api(`/riders/deliveries/${id}/en-route`, { method: 'POST' }),

  // POST /riders/deliveries/:id/deliver — confirma a entrega. status 3 → 4.
  deliver: (id) => api(`/riders/deliveries/${id}/deliver`, { method: 'POST' }),

  // POST /riders/deliveries/:id/return — devolve o pacote à loja (cliente
  // não encontrado/recusou). status 2 ou 3 → 5. Exige motivo.
  returnToStore: (id, motivo) =>
    api(`/riders/deliveries/${id}/return`, { method: 'POST', body: JSON.stringify({ motivo }) }),

  // POST /riders/deliveries/:id/cancel — cancela a entrega ANTES da
  // retirada. status 1 → volta para 0 (reabre no pool). Exige motivo.
  cancel: (id, motivo) =>
    api(`/riders/deliveries/${id}/cancel`, { method: 'POST', body: JSON.stringify({ motivo }) }),

    // GET /riders/deliveries/history — histórico de entregas finalizadas do
  // rider (entregue, devolvida, ou cancelada pela loja depois que ele já
  // tinha aceitado), para a tela "Minhas Entregas". Sempre paginado — quem
  // chama acumula as páginas (ver Deliveries.jsx). Aceita filtros opcionais
  // por status ('delivered' | 'returned' | 'cancelled') e por período
  // (from/to, formato AAAA-MM-DD, ancorado no dia civil de Brasília pela
  // API); sem esses filtros, traz tudo. Retorna
  // { data, page, limit, total, totalPages }.
  listHistory: ({ status, from, to, page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    params.set('page', String(page));
    params.set('limit', String(limit));
    return api(`/riders/deliveries/history?${params.toString()}`, { method: 'GET' });
  },
};

