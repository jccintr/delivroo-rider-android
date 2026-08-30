import { useEffect, useRef } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import StackNavigator from './src/navigation/StackNavigator';
import { useFonts as useBaloo2, Baloo2_500Medium, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { useFonts as useInter, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts as useMono, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';
import {View} from 'react-native';
import {AuthProvider} from './src/contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { configureNotificationHandler } from './src/utils/pushNotifications';

// Precisa rodar antes de qualquer notificação chegar — define como o app
// se comporta com uma notificação recebida enquanto está aberto
// (foreground). Chamado uma vez, na avaliação do módulo.
configureNotificationHandler();

// Ref pro NavigationContainer, pra poder navegar de fora da árvore de
// componentes — é o que o listener de toque na notificação (abaixo) usa,
// já que ele não é um componente React.
export const navigationRef = createNavigationContainerRef();

export default function App() {
  const [baloo2Loaded] = useBaloo2({
    Baloo2_500Medium,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  });

  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [monoLoaded] = useMono({
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  const fontsLoaded = baloo2Loaded && interLoaded && monoLoaded;

  // Toque em qualquer notificação (app em foreground, background, ou
  // fechado e reaberto por ela) leva pra Home — tanto "nova entrega
  // disponível" quanto "entrega cancelada" já são refletidas lá
  // automaticamente pelo polling existente, não precisa de navegação mais
  // específica por tipo.
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('homeDrawer');
      }
    });

    return () => subscription.remove();
  }, []);

  // Enquanto as fontes não carregam, não renderiza nada
  if (!fontsLoaded) {
  return <View style={{ flex: 1, backgroundColor: '#FF6B35' }} />;
}

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <NavigationContainer ref={navigationRef}>
            <StackNavigator />
          </NavigationContainer>
        </AuthProvider>
    </GestureHandlerRootView>
  );
}