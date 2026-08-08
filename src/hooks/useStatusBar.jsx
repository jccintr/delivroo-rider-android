import { useCallback } from 'react';
import { StatusBar, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

/**
 * @param {string} backgroundColor
 * @param {'light-content' | 'dark-content'} barStyle
 */
/*export function useStatusBar(backgroundColor, barStyle = 'dark-content') {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(barStyle);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(backgroundColor);
        StatusBar.setTranslucent(false);
      }
    }, [backgroundColor, barStyle])
  );
}*/

// novo
export function useStatusBar(backgroundColor, barStyle = 'dark-content') {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(barStyle);
      if (Platform.OS === 'android') {
        // Com edge-to-edge a cor de fundo não vale; deixe transparente
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor('transparent');
      }
    }, [barStyle])
  );
}