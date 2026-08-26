// Indicador/botão de status online-offline do entregador, compacto o
// suficiente para ficar dentro do header, ao lado da saudação. Ícone
// circular (com pulso de radar quando online) + palavra "Online"/"Offline".
import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, Text, View, StyleSheet, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes } from '../../theme/theme';

const CIRCLE_SIZE = 40;

// Dois anéis de radar, defasados no tempo, cada um expandindo e
// desaparecendo em loop enquanto o botão estiver "online".
function useRadarPulses(active) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      ring1.setValue(0);
      ring2.setValue(0);
      return;
    }

    function buildLoop(anim, delay) {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      );
    }

    const loop1 = buildLoop(ring1, 0);
    const loop2 = buildLoop(ring2, 900);
    loop1.start();
    loop2.start();

    return () => {
      loop1.stop();
      loop2.stop();
    };
  }, [active, ring1, ring2]);

  return [ring1, ring2];
}

export default function GoOnlineButton({ value, onValueChange, loading = false }) {
  const [ring1, ring2] = useRadarPulses(value);

  function handlePress() {
    if (loading) return;
    onValueChange(!value);
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      style={({ pressed }) => [styles.wrap, pressed && !loading && styles.wrapPressed]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: loading }}
      accessibilityLabel={value ? 'Ficar offline' : 'Ficar online'}
    >
      <View style={styles.circleWrap}>
        {[ring1, ring2].map((ring, index) => (
          <Animated.View
            key={index}
            pointerEvents="none"
            style={[
              styles.radar,
              {
                opacity: value ? ring.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }) : 0,
                transform: [
                  { scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) },
                ],
              },
            ]}
          />
        ))}

        <View
          style={[
            styles.circle,
            { backgroundColor: value ? colors.green : 'rgba(255,255,255,0.25)' },
          ]}
        >
          <Ionicons name={value ? 'checkmark' : 'power'} size={18} color={colors.white} />
        </View>
      </View>

      <Text style={styles.label}>{value ? 'Online' : 'Offline'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  wrapPressed: {
    opacity: 0.8,
  },
  circleWrap: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radar: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.green,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.xs,
    color: colors.white,
    marginTop: 2,
  },
});