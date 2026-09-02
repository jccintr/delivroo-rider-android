import { api } from './api';

export const cityService = {
  listActive: () => api('/cities', { method: 'GET' }),
};