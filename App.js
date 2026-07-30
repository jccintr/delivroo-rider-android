import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/navigation/StackNavigator';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts as useBaloo2, Baloo2_500Medium, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { useFonts as useInter, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts as useMono, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';

SplashScreen.preventAutoHideAsync();

export default function App() {
   const [baloo2Loaded] = useBaloo2({ Baloo2_500Medium, Baloo2_700Bold, Baloo2_800ExtraBold });
  const [interLoaded] = useInter({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [monoLoaded] = useMono({ IBMPlexMono_500Medium, IBMPlexMono_600SemiBold });

  const fontsLoaded = baloo2Loaded && interLoaded && monoLoaded;

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;


  return (
    <NavigationContainer>
                    <StackNavigator/>
                </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
   title: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 30,
    color: '#26211C',
  },
  subtitle: {
     fontFamily: 'Inter_400Regular',
    color: '#fff',
    fontSize: 18
  }
});
