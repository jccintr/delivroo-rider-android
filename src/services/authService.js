import { api } from './api';

export const authService = {
  login: (email, password) => {
    return api('/riders/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: (data) => {
    return api('/riders/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  validateToken: () => {
    return api('riders/me', {
      method: 'GET',
    });
  },
/*
  verifyEmail: (code) => {
    return api('/passengers/auth/verifyemail', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

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