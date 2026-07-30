import { BASE_API } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getToken = async () => {
  return await AsyncStorage.getItem('@token');
};

export const api = async (endpoint, options = {}) => {
  const token = await getToken();



  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_API}${endpoint}`, {
    ...options,
    headers,
  });

  // Tratamento padronizado de erro
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      message: errorData.message || 'Erro na requisição',
      data: errorData,
    };
  }

  // Se a resposta for vazia
  if (response.status === 204) return null;

  return response.json();
};