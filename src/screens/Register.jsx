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
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radius, spacing } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext'
import AlertModal from '../components/modals/AlertModal';
import CitySelectModal from '../components/modals/CitySelectModal';
import useAlertModal from '../hooks/useAlertModal';
import logo from '../assets/rider-orange.png';
import AssetImage from '../components/reusable/AssetImage';
import {useStatusBar} from '../hooks/useStatusBar';
import { useKeyboardBehavior } from '../hooks/useKeyboardBehavior';

 
const VEHICLES = [
  { key: 'Moto', label: 'Moto', icon: 'motorbike' },
  { key: 'Carro', label: 'Carro', icon: 'car' },
  { key: 'Bicicleta', label: 'Bicicleta', icon: 'bike' },
];


const Register = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [vehicleType, setVehicleType] = useState(null);
  const [city, setCity] = useState(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { register } = useAuth();
  const alert = useAlertModal();
  useStatusBar(colors.cream, 'dark-content');
  const keyboardBehavior = useKeyboardBehavior();
 

  const handleRegister = async() => {
    if (!name || !email || !phone || !password) {
      alert.show({type: 'error',title: 'Campos obrigatórios', message: 'Preencha todos os campos para continuar.',});
      return;
    }
    if (!vehicleType) {
      alert.show({type: 'error',title: 'Vehículo', message: 'Selecione o tipo de seu veículo para continuar.',});
      return;
    }
    if (!city) {
      alert.show({type: 'error',title: 'Cidade', message: 'Selecione sua cidade para continuar.',});
      return;
    }
    setIsLoading(true);
    console.log('Register Request');
    console.log('Cadastro:', { name, email, phone, password, vehicleType, cityId: city._id });
    try {
       const response = await register(name, email, phone, password, vehicleType, city._id);
       alert.show({
          type: 'success',
          title: 'Cadastro efetuado',
          message: 'Faça login para começar a usar o aplicativo.',
          onClose: () => {
            navigation.navigate('login');
          },
        });
    } catch (err) {
      alert.show({type: 'error',title: 'Falha ao cadastrar', message: err.data.error,});
   } finally {
      setIsLoading(false);
    }
  }
 
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={keyboardBehavior}>
      
      <ScrollView  contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" >
         <View style={{alignSelf: 'center'}}>
           <AssetImage radius={0} height={100} width={100} source={logo} mode={'contain'} />
        </View>
        <Text style={styles.h1}>Delivroo Express</Text>
 
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>
          Informe seus dados para começar a entregar
        </Text>
 
        <View style={styles.fields}>
          {/* Nome */}
          <View style={styles.field}>
            <Ionicons name="person-outline" size={18} color={colors.inkSoft} />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor={colors.inkSoft}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>
 
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
 
          {/* Telefone */}
          <View style={styles.field}>
            <Ionicons name="call-outline" size={18} color={colors.inkSoft} />
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor={colors.inkSoft}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          {/* Cidade */}
          <TouchableOpacity style={styles.field} onPress={() => setShowCityModal(true)}>
            <Ionicons name="location-outline" size={18} color={colors.inkSoft} />
            <Text style={[styles.input, !city && styles.placeholderText]}>
              {city ? `${city.name} - ${city.state}` : 'Selecione sua cidade'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.inkSoft} />
          </TouchableOpacity>
 
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
 
        {/* Seletor de veículo */}
        <Text style={styles.label}>Veículo</Text>
        <View style={styles.vehicleRow}>
          {VEHICLES.map((v) => {
            const selected = vehicleType === v.key;
            return (
              <TouchableOpacity
                key={v.key}
                style={[styles.vehicleOption, selected && styles.vehicleOptionSelected]}
                onPress={() => setVehicleType(v.key)}
              >
                <MaterialCommunityIcons
                  name={v.icon}
                  size={22}
                  color={selected ? colors.white : colors.inkSoft}
                />
                <Text
                  style={[
                    styles.vehicleLabel,
                    selected && styles.vehicleLabelSelected,
                  ]}
                >
                  {v.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
 
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          {!isLoading?<Text style={styles.buttonText}>Criar conta</Text>:<ActivityIndicator  size="large" color={colors.white}/>}
        </TouchableOpacity>
 
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('login')}>
            <Text style={styles.loginLink}>Entre</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AlertModal {...alert.props} />
      <CitySelectModal
        visible={showCityModal}
        selectedCityId={city?._id}
        onSelect={(selected) => {
          setCity(selected);
          setShowCityModal(false);
        }}
        onClose={() => setShowCityModal(false)}
      />
    </KeyboardAvoidingView>
  );


}

export default Register

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
    marginBottom: 0,
  },
   h1: {
    fontFamily: 'Baloo2_700Bold',
    color: colors.orange,
    fontSize: 34,
    marginBottom: spacing.xs,
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
  placeholderText: {
    color: colors.inkSoft,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  vehicleOption: {
    flex: 1,
    height: 64,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  vehicleOptionSelected: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  vehicleLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  vehicleLabelSelected: {
    color: colors.white,
  },
  button: {
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  buttonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.white,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  loginLink: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.sm,
    color: colors.orangeDark,
  },
});