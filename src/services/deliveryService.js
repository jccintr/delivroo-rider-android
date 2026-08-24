import { api } from './api';

export const deliveryService = {
  // GET /riders/deliveries/available — entregas com status "disponível"
  // (sem rider atribuído), para exibir na tela Home.
  listAvailable: () => api('/riders/deliveries/available', { method: 'GET' }),

  // GET /riders/deliveries/:id — detalhes de uma entrega específica, para
  // a tela de Detalhes da Entrega (antes do aceite).
  getById: (id) => api(`/riders/deliveries/${id}`, { method: 'GET' }),
};