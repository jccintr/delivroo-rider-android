// PasswordRecoveryCode.js
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radius, spacing } from '../theme/theme';
import {useStatusBar} from '../hooks/useStatusBar';

const CODE_LENGTH = 4;

export default function PasswordRecoveryCode({ navigation, route }) {
  const email = route?.params?.email ?? 'seuemail@exemplo.com';

  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const inputsRef = useRef([]);
   useStatusBar(colors.cream, 'dark-content');

  function handleChangeDigit(value, index) {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);

    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e, index) {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handleVerify() {
    const fullCode = code.join('');
    // TODO: integrar com a API — validar o código antes de liberar a redefinição
    console.log('Verificando código de recuperação:', fullCode);

    navigation.navigate('resetPassword', { email, code: fullCode });
  }

  function handleResend() {
    // TODO: integrar com a API de reenvio de código
    console.log('Reenviando código de recuperação para', email);
  }

  const isComplete = code.every((d) => d !== '');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.white }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark-outline" size={44} color={colors.green} />
        </View>

        <Text style={styles.title}>Verifique o código</Text>
        <Text style={styles.subtitle}>
          Enviamos um código de {CODE_LENGTH} dígitos para{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <View style={styles.codeRow}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputsRef.current[index] = ref)}
              style={[styles.codeBox, digit !== '' && styles.codeBoxFilled]}
              value={digit}
              onChangeText={(value) => handleChangeDigit(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, !isComplete && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={!isComplete}
        >
          <Text style={styles.buttonText}>Verificar código</Text>
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Não recebeu? </Text>
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}>Reenviar código</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.greenBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.title,
    color: colors.ink,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xxl,
  },
  email: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
  codeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    fontFamily: fonts.monoSemiBold,
    fontSize: fontSizes.title,
    color: colors.ink,
  },
  codeBoxFilled: {
    borderColor: colors.orange,
    color: colors.orangeDark,
  },
  button: {
    width: '100%',
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.line,
  },
  buttonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.white,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  resendText: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  resendLink: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.sm,
    color: colors.orangeDark,
  },
});