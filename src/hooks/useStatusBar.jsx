import { useCallback } from 'react';
import { StatusBar, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

/**
 * @param {string} backgroundColor
 * @param {'light-content' | 'dark-content'} barStyle
 */
export function useStatusBar(backgroundColor, barStyle = 'dark-content') {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(barStyle);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(backgroundColor);
        StatusBar.setTranslucent(false);
      }
    }, [backgroundColor, barStyle])
  );
}