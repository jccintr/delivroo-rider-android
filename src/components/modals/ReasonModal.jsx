// Modal para capturar um motivo em texto antes de confirmar uma ação
// destrutiva (cancelar entrega, devolver pacote à loja). Diferente do
// AlertModal (que só confirma/informa), este tem um campo de texto e dois
// botões (Voltar / Confirmar).
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { colors, fonts, fontSizes, radius, spacing } from '../../theme/theme';

export default function ReasonModal({
  visible,
  title,
  message,
  placeholder = 'Descreva o motivo...',
  confirmText = 'Confirmar',
  confirmColor = colors.red,
  loading = false,
  onCancel,
  onConfirm,
}) {
  const [motivo, setMotivo] = useState('');

  function handleConfirm() {
    if (!motivo.trim()) return;
    onConfirm(motivo.trim());
  }

  function handleCancel() {
    setMotivo('');
    onCancel();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleCancel}>
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!message && <Text style={styles.message}>{message}</Text>}

          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.inkSoft}
            value={motivo}
            onChangeText={setMotivo}
            multiline
            numberOfLines={3}
            autoFocus
          />

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel} disabled={loading}>
              <Text style={styles.cancelButtonText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: confirmColor }, (!motivo.trim() || loading) && styles.buttonDisabled]}
              onPress={handleConfirm}
              disabled={!motivo.trim() || loading}
            >
              <Text style={styles.confirmButtonText}>{loading ? '...' : confirmText}</Text>
            </TouchableOpacity>
          </View>
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
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
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
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cancelButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
  },
  confirmButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.white,
  },
});