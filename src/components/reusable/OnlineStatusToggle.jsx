// Toggle animado para o status online/offline do entregador. Substitui o
// <Switch> nativo (que fica com aparência genérica/inconsistente entre
// Android/iOS) por um controle desenhado no estilo do app: pill com um
// indicador que desliza, ícone + texto dentro dele, e um brilho pulsante
// ao redor enquanto estiver online (reforça a sensação de "ao vivo").
import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, Text, View, StyleSheet, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radius } from '../../theme/theme';

const TRACK_WIDTH = 148;
const TRACK_HEIGHT = 44;
const KNOB_PADDING = 3;
const KNOB_WIDTH = (TRACK_WIDTH - KNOB_PADDING * 2) / 2;

export default function OnlineStatusToggle({ value, onValueChange, disabled = false }) {
  const slide = useRef(new Animated.Value(value ? 1 : 0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      speed: 16,
      bounciness: 7,
    }).start();
  }, [value, slide]);

  // Brilho pulsante ao redor do pill enquanto estiver online — para de vez
  // quando volta a ficar offline ou o componente desmonta.
  useEffect(() => {
    if (!value) {
      glow.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [value, glow]);

  const knobTranslateX = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [KNOB_PADDING, TRACK_WIDTH - KNOB_WIDTH - KNOB_PADDING],
  });

  const knobBackground = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.ink, colors.green],
  });

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.45] });
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  function handlePress() {
    if (disabled) return;
    onValueChange(!value);
  }

  return (
    <View style={styles.wrap}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          { opacity: value ? glowOpacity : 0, transform: [{ scale: glowScale }] },
        ]}
      />

      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.track,
          disabled && styles.trackDisabled,
          pressed && !disabled && styles.trackPressed,
        ]}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        accessibilityLabel={value ? 'Ficar offline' : 'Ficar online'}
      >
        {/* Rótulos estáticos das duas metades — ficam visíveis do lado
            oposto ao indicador (o lado coberto pelo indicador não aparece). */}
        <View style={styles.labelsRow} pointerEvents="none">
          <View style={styles.labelSlot}>
            <Text style={styles.labelText}>Offline</Text>
          </View>
          <View style={styles.labelSlot}>
            <Text style={styles.labelText}>Online</Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.knob,
            {
              width: KNOB_WIDTH,
              backgroundColor: knobBackground,
              transform: [{ translateX: knobTranslateX }],
            },
          ]}
        >
          <Ionicons
            name={value ? 'checkmark-circle' : 'power'}
            size={14}
            color={colors.white}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.knobText} numberOfLines={1}>
            {value ? 'Online' : 'Offline'}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
  },
  glow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: radius.pill,
    backgroundColor: colors.green,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
  },
  trackPressed: {
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  trackDisabled: {
    opacity: 0.6,
  },
  labelsRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelSlot: {
    width: TRACK_WIDTH / 2,
    alignItems: 'center',
  },
  labelText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  knob: {
    position: 'absolute',
    height: TRACK_HEIGHT - KNOB_PADDING * 2,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  knobText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.white,
  },
});