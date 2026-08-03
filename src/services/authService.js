import { api } from './api';

export const authService = {
  login: (email, password) => {
    return api('/riders/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: (name, email, phone, password, vehicleType) => {
    return api('/riders/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password, vehicleType }),
    });
  },

  validateToken: () => {
    return api('/riders/me', {
      method: 'GET',
    });
  },

  verifyEmail: (code) => {
    return api('/riders/verify-account', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },
/*
  requestVerificationEmail: () => {
    return api('/passengers/auth/email/verify/request', {
      method: 'POST',
    });
  },

  requestPasswordEmail: (email) => {
    return api('/passengers/auth/password/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: (email, code, password) => {
    return api('/passengers/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ email, code, password }),
    });
  },
  */
};