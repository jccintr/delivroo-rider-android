import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radius, spacing } from '../../theme/theme';
import AlertModal from '../../components/modals/AlertModal';
import useAlertModal from '../../hooks/useAlertModal';
import { useAuth } from '../../contexts/AuthContext';
import { useStatusBar } from '../../hooks/useStatusBar';
import { useKeyboardBehavior } from '../../hooks/useKeyboardBehavior';
import { useHeaderHeight } from '@react-navigation/elements';

const VEHICLES = [
  { key: 'Moto', label: 'Moto', icon: 'motorbike' },
  { key: 'Carro', label: 'Carro', icon: 'car' },
  { key: 'Bicicleta', label: 'Bicicleta', icon: 'bike' },
];

export default function VehicleDetails() {
  const alert = useAlertModal();
  const { user, updateVehicle } = useAuth();

  const [vehicleType, setVehicleType] = useState(null);
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');
  const [saving, setSaving] = useState(false);
  const keyboardBehavior = useKeyboardBehavior();
  const headerHeight = useHeaderHeight();
  useStatusBar(colors.white, 'dark-content');

  useEffect(() => {
    if (!user) return;
    setVehicleType(user.vehicle.type ?? null);
    setModel(user.vehicle.model ?? '');
    setColor(user.vehicle.color ?? '');
    setPlate(user.vehicle.plate ?? '');
  }, [user]);

  const selectedVehicle = VEHICLES.find((v) => v.key === vehicleType);

  async function handleSave() {
    if (!vehicleType) {
      alert.show({
        type: 'error',
        title: 'Veículo',
        message: 'Selecione o tipo de seu veículo para continuar.',
      });
      return;
    }
   
    setSaving(true);
    try {
      await updateVehicle({
        vehicleType,
        model: model.trim(),
        color: color.trim(),
        plate: plate.trim(),
      });

      alert.show({
        type: 'success',
        title: 'Veículo atualizado',
        message: 'Os dados do seu veículo foram salvos com sucesso.',
      });
    } catch (error) {
      alert.show({
        type: 'error',
        title: 'Erro ao salvar',
        message:
          error?.data?.error ||
          error?.message ||
          'Não foi possível atualizar seu veículo. Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.cream }}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Ícone do veículo */}
        <View style={styles.iconWrap}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name={selectedVehicle?.icon ?? 'moped'}
              size={44}
              color={colors.white}
            />
          </View>
        </View>

        {/* Tipo de veículo */}
        <Text style={styles.label}>Tipo de veículo</Text>
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
                <Text style={[styles.vehicleLabel, selected && styles.vehicleLabelSelected]}>
                  {v.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dados do veículo */}
        <View style={styles.fields}>
          <View>
            <Text style={styles.label}>Modelo</Text>
            <View style={styles.field}>
              <Ionicons name="construct-outline" size={18} color={colors.inkSoft} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Honda CG 125"
                placeholderTextColor={colors.inkSoft}
                value={model}
                onChangeText={setModel}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View>
            <Text style={styles.label}>Cor</Text>
            <View style={styles.field}>
              <Ionicons name="color-palette-outline" size={18} color={colors.inkSoft} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Preta"
                placeholderTextColor={colors.inkSoft}
                value={color}
                onChangeText={setColor}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View>
            <Text style={styles.label}>Placa</Text>
            <View style={styles.field}>
              <Ionicons name="id-card-outline" size={18} color={colors.inkSoft} />
              <TextInput
                style={styles.input}
                placeholder="ABC1D23"
                placeholderTextColor={colors.inkSoft}
                value={plate}
                onChangeText={setPlate}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={8}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <AlertModal {...alert.props} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xxl,
  },
  iconWrap: {
    alignSelf: 'center',
    marginBottom: spacing.xxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
    marginBottom: 6,
    marginLeft: 4,
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
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
  button: {
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.white,
  },
});