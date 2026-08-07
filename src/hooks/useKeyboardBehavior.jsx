import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export const useKeyboardBehavior = () => {
  const defaultBehavior = Platform.OS === 'ios' ? 'padding' : 'height';
  const [behavior, setBehavior] = useState(defaultBehavior);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => {
      setBehavior(defaultBehavior);
    });

    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setBehavior(undefined); // ← Isso remove o espaço branco residual
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [defaultBehavior]);

  return behavior;
};