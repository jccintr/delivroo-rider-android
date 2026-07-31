import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/navigation/StackNavigator';
import { useFonts as useBaloo2, Baloo2_500Medium, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { useFonts as useInter, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts as useMono, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';
import {View} from 'react-native';
import {AuthProvider} from './src/contexts/AuthContext';

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

  // Enquanto as fontes não carregam, não renderiza nada
  if (!fontsLoaded) {
  return <View style={{ flex: 1, backgroundColor: '#FF6B35' }} />;
}

  return (
    <AuthProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}