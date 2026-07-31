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
  StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radius, spacing } from '../theme/theme';


import {useAuth} from '../contexts/AuthContext'


const Login = ({navigation}) => {
    const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
 
  function handleLogin() {
    // TODO: integrar com a API de autenticação
     navigation.navigate('accountActivation')
    console.log('Login:', { email, password });
  }


const { login, requestLoading, error } = useAuth();
const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin2 = async () => {
    setIsLoading(true);
   console.log('Login Request');
    try {
     const response =  await login("paulinho@gmail.com", '1234');
    // alert('Login efetuado com sucesso');
     const data = await response.json();
     console.log(data);
      // navegação automática (se usar navegação baseada em isAuthenticated)
    } catch (err) {
     //  alert('Erro ao efetuar login');
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  


   return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.cream }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar 
        backgroundColor={colors.cream} 
        barStyle="dark-content" 
        translucent={false} 
      />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.h1}>Delivroo Express</Text>
      
 
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>
          Entre para começar a aceitar entregas
        </Text>
 
        <View style={styles.fields}>
          {/* E-mail */}
          <View style={styles.field}>
            <Ionicons name="mail-outline" size={18} color={colors.inkSoft} />
            <TextInput
              style={styles.input}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={colors.inkSoft}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>
 
          {/* Senha */}
          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.inkSoft} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.inkSoft}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
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
        </View>
 
        <TouchableOpacity
          onPress={() => navigation.navigate('passwordRecovery')}
          style={styles.forgotWrap}
        >
          <Text style={styles.forgot}>Esqueci minha senha</Text>
        </TouchableOpacity>
 
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
 
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('register')}>
            <Text style={styles.signupLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


export default Login

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xxl,
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: 150,
    borderRadius: radius.xl,
    backgroundColor: colors.orangeDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  h1: {
    fontFamily: 'Baloo2_700Bold',
    color: colors.orange,
    fontSize: 34,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.heading,
    color: colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
    marginBottom: spacing.xl,
  },
  fields: {
    gap: spacing.sm,
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
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  forgot: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.orangeDark,
  },
  button: {
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.white,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  signupText: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  signupLink: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.sm,
    color: colors.orangeDark,
  },
});
