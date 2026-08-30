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
  resendVerificationEmailCode: () => {
     return api('/riders/verify-account/resend', {
      method: 'POST',
    });
  },
*/
  requestPasswordCode: (email) => {
    return api('/riders/password/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

   verifyPasswordCode: (email,code) => {
    return api('/riders/password/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },
  resetPassword: (email,code,password) => {
    return api('/riders/password/reset', {
      method: 'POST',
      body: JSON.stringify({ email, code, password }),
    });
  },
  updateProfile: (data) => {
    return api('/riders/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  uploadAvatar: (uri) => {
    const formData = new FormData();
    formData.append('avatar', {
      uri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    });

    return api('/riders/me/avatar', {
      method: 'PATCH',
      body: formData,
    });
  },

  
toggleOnline: () =>
  api('/riders/me/status', { method: 'PATCH' }),

uploadDocument: (uri) => {
    const formData = new FormData();
    formData.append('document', {
      uri,
      type: 'image/jpeg',
      name: 'document.jpg',
    });
 
    return api('/riders/me/document', {
      method: 'PATCH',
      body: formData,
    });
  },

  updateVehicle: (data) => {
    return api('/riders/me/vehicle', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // PATCH /riders/me/push-token — salva/atualiza o Expo push token do
  // rider autenticado. Chamado pelo AuthContext sempre que o app consegue
  // obter um token novo (ver utils/pushNotifications.js).
  updatePushToken: (pushToken) => {
    return api('/riders/me/push-token', {
      method: 'PATCH',
      body: JSON.stringify({ pushToken }),
    });
  },
};


