import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Enquanto o app está aberto (foreground), mostra a notificação normalmente
// (banner + som) em vez do comportamento padrão da lib, que é não exibir
// nada visualmente nesse caso. Precisa ser chamado uma vez, cedo — ver
// App.js.
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Pede permissão, garante o canal de notificação do Android (obrigatório
// a partir do Android 8) e obtém o Expo push token do aparelho.
//
// Retorna null (sem lançar erro) em qualquer caso em que não dá pra
// registrar: rodando em emulador/simulador (a Expo não entrega push pra
// eles), permissão negada, ou falha ao obter o token — quem chama trata
// isso como "não foi possível registrar agora, tudo bem, tenta de novo
// depois".
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log('Push notifications exigem um aparelho físico — ignorando em emulador/simulador.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Entregas',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permissão de notificação negada pelo rider.');
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('projectId da EAS não encontrado em app.config.js — não é possível obter o push token.');
    return null;
  }

  try {
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    return expoPushToken;
  } catch (error) {
    console.log('Erro ao obter o Expo push token:', error);
    return null;
  }
}