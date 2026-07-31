// AlertModal.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radius, spacing } from './../../theme/theme'

const VARIANTS = {
  error: {
    icon: 'close-circle',
    iconColor: colors.red,
    iconBg: colors.redBg,
    buttonBg: colors.red,
  },
  success: {
    icon: 'checkmark-circle',
    iconColor: colors.green,
    iconBg: colors.greenBg,
    buttonBg: colors.green,
  },
  warning: {
    icon: 'alert-circle',
    iconColor: colors.amber,
    iconBg: colors.amberBg,
    buttonBg: colors.orange,
  },
};

export default function AlertModal({
  visible,
  type = 'error',
  title,
  message,
  confirmText = 'Entendi',
  onClose,
}) {
  const variant = VARIANTS[type] ?? VARIANTS.error;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.iconWrap, { backgroundColor: variant.iconBg }]}>
            <Ionicons name={variant.icon} size={36} color={variant.iconColor} />
          </View>

          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!message && <Text style={styles.message}>{message}</Text>}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: variant.buttonBg }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{confirmText}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(38, 33, 28, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    // sombra
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.xl,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  button: {
    width: '100%',
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.white,
  },
});