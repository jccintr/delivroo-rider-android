import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { registerForPushNotificationsAsync } from '../utils/pushNotifications';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loading inicial (verificando token)
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentPromptShown, setDocumentPromptShown] = useState(false); // modal solicitando documento

  // Verifica se já existe token ao abrir o app

  const markDocumentPromptShown = useCallback(() => {
      setDocumentPromptShown(true);
   }, []);

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

  // Registra o push token sempre que o rider "se torna autenticado" — tanto
  // logo após o login quanto ao reabrir o app com uma sessão já válida
  // (loadStorageData acima). Usa user?._id como dependência (não `user`
  // inteiro) de propósito: updateProfile/uploadAvatar/toggleOnline/
  // updateVehicle recriam o objeto `user` a cada chamada, e isso não deve
  // disparar um novo registro toda vez — só quando a identidade do rider
  // logado muda de verdade (login/logout). Melhor esforço: falha aqui
  // nunca deve impedir o rider de usar o app, só fica sem notificação até
  // a próxima vez que o app abrir.
  useEffect(() => {
    if (!user?._id) return;

    registerForPushNotificationsAsync()
      .then((pushToken) => {
        if (pushToken) return authService.updatePushToken(pushToken);
      })
      .catch((err) => {
        console.log('Erro ao registrar push token:', err);
      });
  }, [user?._id]);

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

  const register = useCallback(async (name, email, phone, password, vehicleType, cityId) => {
    return handleRequest(() => authService.register(name, email, phone, password, vehicleType, cityId));
  }, [handleRequest]);

  
  const verifyEmail = useCallback(async (code) => {
    return handleRequest(async () => {
      const data = await authService.verifyEmail(code);
      // Atualiza o user se necessário
      if (data.user) setUser(data.user);
      return data;
    });
  }, [handleRequest]);

  /*
  const resendVerificationEmailCode = useCallback(async () => {
    return handleRequest(() => authService.resendVerificationEmailCode());
  }, [handleRequest]);
*/
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
    // Best-effort: tenta avisar o backend que o rider ficou offline, pra
    // parar de receber notificação de nova entrega enquanto deslogado.
    // Precisa rodar antes de remover o token (chamada autenticada) e nunca
    // deve travar o logout — sem internet, o rider ainda assim consegue sair.
    try {
      await authService.setOffline();
    } catch (err) {
      console.log('Erro ao marcar rider como offline no logout:', err);
    }

    await AsyncStorage.removeItem('@token');
    setUser(null);
    setDocumentPromptShown(false);
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
         // resendVerificationEmailCode,
          requestPasswordCode,
          verifyPasswordCode,
          resetPassword,
          updateProfile,
          uploadAvatar,
          uploadDocument,
          toggleOnline,
          updateVehicle,
          documentPromptShown,
          markDocumentPromptShown,
        
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