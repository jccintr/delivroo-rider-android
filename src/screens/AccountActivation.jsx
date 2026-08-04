// AccountActivationScreen.js
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
import { useAuth } from '../contexts/AuthContext';
import AlertModal from '../components/modals/AlertModal';
import useAlertModal from '../hooks/useAlertModal';

const CODE_LENGTH = 4;

const AccountActivation = ({ navigation, route }) => {
  //const phone = route?.params?.phone ?? '(35) 9****-1234';
  const {  user, verifyEmail, resendVerificationEmailCode, logout } = useAuth();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const inputsRef = useRef([]);
  const alert = useAlertModal();
  const [isLoading, setIsLoading] = React.useState(false);
  const email = user?.email ?? '';
  function handleChangeDigit(value, index) {
    // aceita apenas 1 dígito numérico por caixa
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

  const handleActivate = async () => {

    const fullCode = code.join('');
    // TODO: integrar com a API de ativação de conta
    console.log('Ativando conta com código:', fullCode);
    setIsLoading(true);
    try {
      const data = await verifyEmail(fullCode);
      alert.show({
          type: 'success',
          title: 'Email Verificado',
          message: 'Agora a sua conta esta ativa.',
          onClose: () => {
            navigation.reset({ index: 0, routes: [{ name: 'home' }],});
          },
        });
        
  
    } catch(err){
      alert.show({
      type: 'error',
      title: 'Código inválido',
      message: err?.data?.error || err?.message || 'Erro ao fazer validar conta.',
    });
    } finally {
      setIsLoading(false);
    }
  }

  function handleResend() {
    // TODO: integrar com a API de reenvio de código
    console.log('Reenviando código para', email);
    try {
      resendVerificationEmailCode();
      alert.show({
        type: 'success',
        title: 'Código reenviado',
        message: `Um novo código foi enviado para ${email}.`,
      });
    } catch(err){
      alert.show({
        type: 'error',
        title: 'Erro ao reenviar código',
        message: err?.data?.error || err?.message || 'Erro ao reenviar código.',
      });
    }
  }

  const handleLogout = async () => {
  try {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'login' }],
    });
  } catch (err) {
    console.log(err);
    
  }
};

  const isComplete = code.every((d) => d !== '');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.white }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="mail-open-outline" size={44} color={colors.green} />
        </View>

        <Text style={styles.title}>Confirme sua conta</Text>
        <Text style={styles.subtitle}>
          Enviamos um código de {CODE_LENGTH} dígitos para{'\n'}
          <Text style={styles.phone}>{email}</Text>
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
          onPress={handleActivate}
          disabled={!isComplete}
        >
          {isLoading ?  <ActivityIndicator  size="large" color={colors.white}/> : <Text style={styles.buttonText}>Ativar conta</Text>}
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Não recebeu? </Text>
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}>Reenviar código</Text>
          </TouchableOpacity>
        </View>
         <View style={styles.resendRow}>
            <TouchableOpacity onPress={handleLogout}>
               <Text style={styles.resendLink}>Utilizar outra conta</Text>
            </TouchableOpacity>
         </View>
      </View>
      <AlertModal {...alert.props} />
    </KeyboardAvoidingView>
  );
}

export default AccountActivation;

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
  phone: {
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