import { api } from './api';

export const deliveryService = {
  // GET /riders/deliveries/available — entregas com status "disponível"
  // (sem rider atribuído), para exibir na tela Home.
  listAvailable: () => api('/riders/deliveries/available', { method: 'GET' }),
};