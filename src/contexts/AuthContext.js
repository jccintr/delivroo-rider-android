import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loading inicial (verificando token)
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verifica se já existe token ao abrir o app

  useEffect(() => {
    async function loadStorageData() {
      try {
        const token = await AsyncStorage.getItem('@token');

        if (token) {
          const data = await authService.validateToken();
          setUser(data);
        }
      } catch (err) {
        // Token inválido → limpa
        await AsyncStorage.removeItem('@token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  const handleRequest = useCallback(async (requestFn) => {
    try {
      setRequestLoading(true);
      setError(null);
      const data = await requestFn();
      return data;
    } catch (err) {
      setError(err.message || 'Ocorreu um erro');
      throw err;
    } finally {
      setRequestLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    return handleRequest(async () => {
      const data = await authService.login(email, password);
      await AsyncStorage.setItem('@token', data.token);
      setUser(data);
      return data;
    });
  }, [handleRequest]);

  const register = useCallback(async (name, email, phone, password, vehicleType) => {
    return handleRequest(() => authService.register(name, email, phone, password, vehicleType));
  }, [handleRequest]);

  
  const verifyEmail = useCallback(async (code) => {
    return handleRequest(async () => {
      const data = await authService.verifyEmail(code);
      // Atualiza o user se necessário
      if (data.user) setUser(data.user);
      return data;
    });
  }, [handleRequest]);

  const resendVerificationEmailCode = useCallback(async () => {
    return handleRequest(() => authService.resendVerificationEmailCode());
  }, [handleRequest]);

  const requestPasswordCode = useCallback(async (email) => {
    return handleRequest(() => authService.requestPasswordCode(email));
  }, [handleRequest]);

  const verifyPasswordCode = useCallback(async (email, code) => {
    return handleRequest(() => authService.verifyPasswordCode(email, code));
  }, [handleRequest]);

  const resetPassword = useCallback(async (email, code, password) => {
    return handleRequest(() => authService.resetPassword(email, code, password));
  }, [handleRequest]);

  const updateProfile = useCallback(async (data) => {
      return handleRequest(async () => {
        const updated = await authService.updateProfile(data);
        setUser((prev) => ({ ...prev, ...updated }));
        return updated;
      });
 }, [handleRequest]);

 const uploadAvatar = useCallback(async (uri) => {
        return handleRequest(async () => {
          const result = await authService.uploadAvatar(uri);
          setUser((prev) => ({
            ...prev,
            avatar: result.avatar,
          }));
          return result;
        });
  }, [handleRequest]);

  const uploadDocument = useCallback(async (uri) => {
    return handleRequest(async () => {
      const result = await authService.uploadDocument(uri);
      setUser((prev) => ({
        ...prev,
        document: result.document,
      }));
      return result;
    });
  }, [handleRequest]);


  const toggleOnline = useCallback(async () => {
      return handleRequest(async () => {
        const updated = await authService.toggleOnline();
        setUser((prev) => ({ ...prev, ...updated }));
        return updated;
      });
  }, [handleRequest]);

  const updateVehicle = useCallback(async (data) => {
      return handleRequest(async () => {
        const updated = await authService.updateVehicle(data);
        setUser((prev) => ({ ...prev, ...updated }));
        return updated;
      });
 }, [handleRequest]);



  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('@token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
          user,
          loading,           // loading inicial (splash)
          requestLoading,    // loading das requisições
          error,
          isAuthenticated: !!user,
          login,
          register,
          logout,
          verifyEmail,
          resendVerificationEmailCode,
          requestPasswordCode,
          verifyPasswordCode,
          resetPassword,
          updateProfile,
          uploadAvatar,
          uploadDocument,
          toggleOnline,
          updateVehicle
        
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}