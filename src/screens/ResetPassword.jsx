// ResetPassword.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radius, spacing } from '../theme/theme';

const MIN_LENGTH = 6;

export default function ResetPassword({ navigation, route }) {
  const { email, code } = route?.params ?? {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isTooShort = password.length > 0 && password.length < MIN_LENGTH;
  const doesNotMatch =
    confirmPassword.length > 0 && confirmPassword !== password;
  const isValid =
    password.length >= MIN_LENGTH && confirmPassword === password;

  function handleReset() {
    if (!isValid) return;
    // TODO: integrar com a API — enviar email/code (validados na etapa anterior) + nova senha
    console.log('Redefinindo senha:', { email, code, password });

    navigation.navigate('Login');
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.cream }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconWrap}>
          <Ionicons name="lock-open-outline" size={28} color={colors.white} />
        </View>

        <Text style={styles.title}>Nova senha</Text>
        <Text style={styles.subtitle}>
          Crie uma nova senha para acessar sua conta. Use pelo menos{' '}
          {MIN_LENGTH} caracteres.
        </Text>

        <View style={styles.fields}>
          {/* Nova senha */}
          <View>
            <View style={styles.field}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.inkSoft} />
              <TextInput
                style={styles.input}
                placeholder="Nova senha"
                placeholderTextColor={colors.inkSoft}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.inkSoft}
                />
              </TouchableOpacity>
            </View>
            {isTooShort && (
              <Text style={styles.errorText}>
                A senha deve ter pelo menos {MIN_LENGTH} caracteres
              </Text>
            )}
          </View>

          {/* Confirmar senha */}
          <View>
            <View style={styles.field}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.inkSoft} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar nova senha"
                placeholderTextColor={colors.inkSoft}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.inkSoft}
                />
              </TouchableOpacity>
            </View>
            {doesNotMatch && (
              <Text style={styles.errorText}>As senhas não coincidem</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleReset}
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>Redefinir senha</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xxl,
    justifyContent: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.title,
    color: colors.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  fields: {
    gap: spacing.md,
  },
  field: {
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.ink,
  },
  errorText: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.xs,
    color: colors.red,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  buttonDisabled: {
    backgroundColor: colors.line,
  },
  buttonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.white,
  },
});