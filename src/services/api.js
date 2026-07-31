/*
import { BASE_API } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getToken = async () => {
  return await AsyncStorage.getItem('@token');
};

export const api = async (endpoint, options = {}) => {
  const token = await getToken();

  const url = `${BASE_API}${endpoint}`;
  console.log('→ Request:', options.method || 'GET', url);

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      body: options.body,
    });

    console.log('← Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || 'Erro na requisição',
        data: errorData,
      };
    }

    if (response.status === 204) return null;

    return await response.json();
  } catch (err) {
    console.log('Erro no fetch:', err);
    throw err;
  }
};
*/

//*************
//  */
import { BASE_API } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getToken = async () => {
  return await AsyncStorage.getItem('@token');
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = async (endpoint, options = {}, retries = 2) => {
  const token = await getToken();
  const url = `${BASE_API}${endpoint}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`→ Request (${attempt + 1}):`, options.method || 'GET', url);

      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        body: options.body,
      });

      console.log('← Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.message || 'Erro na requisição',
          data: errorData,
        };
      }

      if (response.status === 204) return null;
      return await response.json();
    } catch (err) {
      const isNetworkError =
        err?.message === 'Network request failed' ||
        err?.name === 'TypeError';

      // Se for erro de rede e ainda tiver tentativas, espera e tenta de novo
      if (isNetworkError && attempt < retries) {
        console.log(`Tentativa ${attempt + 1} falhou. Tentando novamente...`);
        await delay(2000); // espera 2 segundos (dá tempo do Railway acordar)
        continue;
      }

      console.log('Erro no fetch:', err);
      throw err;
    }
  }
};