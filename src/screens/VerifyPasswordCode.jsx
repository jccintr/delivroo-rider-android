import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radius, spacing } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext'
import AlertModal from '../components/modals/AlertModal';
import useAlertModal from '../hooks/useAlertModal';
import {useStatusBar} from '../hooks/useStatusBar';
import { useKeyboardBehavior } from '../hooks/useKeyboardBehavior';

const CODE_LENGTH = 4;

export default function VerifyPasswordCode({ navigation, route }) {
  const contact = route?.params?.contact ?? 'seuemail@exemplo.com';
  const email = route?.params?.email ?? '';
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const inputsRef = useRef([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const alert = useAlertModal();
  const {verifyPasswordCode,requestPasswordCode, error } = useAuth();
  useStatusBar(colors.cream, 'dark-content');
  const keyboardBehavior = useKeyboardBehavior();

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

  const handleVerify = async () => {
    const fullCode = code.join('');
    setIsLoading(true);

    try {
       const data = await verifyPasswordCode(email, fullCode);
       navigation.navigate('resetPassword', { email, code: fullCode });
    } catch (err) {
      alert.show({
        type: 'error',
        title: 'Código inválido',
        message: 'O código informado é inválido. Por favor, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  
  }

  const handleResend = async () => {
    // TODO: integrar com a API de reenvio de código
    console.log('Reenviando código para', email);
    try {
      const data = await requestPasswordCode(email);
      setCode(Array(CODE_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
      alert.show({
        type: 'success',
        title: 'Código reenviado',
        message: 'Um novo código de verificação foi enviado para seu e-mail.',
      });
    } catch (err) {
      alert.show({
        type: 'error',
        title: 'Falha ao reenviar código',
        message: err?.data?.error || err?.message || 'Erro ao reenviar código de verificação',
      });
    }
  }

  const isComplete = code.every((d) => d !== '');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.cream }}
      behavior={keyboardBehavior}
    >
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark-outline" size={44} color={colors.green} />
        </View>

        <Text style={styles.title}>Verifique o código</Text>
        <Text style={styles.subtitle}>
          Enviamos um código de {CODE_LENGTH} dígitos para{'\n'}
          <Text style={styles.contact}>{email}</Text>
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
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Verificar código</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Não recebeu? </Text>
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}>Reenviar código</Text>
          </TouchableOpacity>
        </View>
      </View>
       <AlertModal {...alert.props} />
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
  contact: {
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