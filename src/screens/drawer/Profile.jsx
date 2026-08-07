// UpdateProfile.js
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
  Image,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radius, spacing } from '../../theme/theme';
import AlertModal from '../../components/modals/AlertModal';
import useAlertModal from '../../hooks/useAlertModal';

export default function Profile() {
  const alert = useAlertModal();

  const [avatarUri, setAvatarUri] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [name, setName] = useState('Carlos Silva');
  const [phone, setPhone] = useState('(35) 99999-1234');
  const [document, setDocument] = useState('000.000.000-00');
  const [savingProfile, setSavingProfile] = useState(false);

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert.show({
        type: 'warning',
        title: 'Permissão necessária',
        message: 'Precisamos de acesso às suas fotos para atualizar o avatar.',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setAvatarUri(uri);
    handleUploadAvatar(uri);
  }

  async function handleUploadAvatar(uri) {
    setUploadingAvatar(true);
    try {
      // TODO: integrar com a API — request separada, ex:
      // const formData = new FormData();
      // formData.append('avatar', { uri, name: 'avatar.jpg', type: 'image/jpeg' });
      // await api.post('/rider/avatar', formData);
      console.log('Enviando avatar:', uri);

      await new Promise((resolve) => setTimeout(resolve, 800)); // simula chamada
    } catch (error) {
      alert.show({
        type: 'error',
        title: 'Erro ao atualizar avatar',
        message: 'Não foi possível enviar sua foto. Tente novamente.',
      });
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSaveProfile() {
    if (!name.trim() || !phone.trim() || !document.trim()) {
      alert.show({
        type: 'error',
        title: 'Campos obrigatórios',
        message: 'Preencha nome, telefone e documento para continuar.',
      });
      return;
    }

    setSavingProfile(true);
    try {
      // TODO: integrar com a API — request separada da do avatar, ex:
      // await api.put('/rider/profile', { name, phone, document });
      console.log('Salvando perfil:', { name, phone, document });

      await new Promise((resolve) => setTimeout(resolve, 800)); // simula chamada

      alert.show({
        type: 'success',
        title: 'Perfil atualizado',
        message: 'Seus dados foram salvos com sucesso.',
      });
    } catch (error) {
      alert.show({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Não foi possível atualizar seus dados. Tente novamente.',
      });
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.cream }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    > 
     <StatusBar backgroundColor={colors.white} barStyle="dark-content" translucent={false} />
      <ScrollView  contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" >
         {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={44} color={colors.white} />
            )}

            {uploadingAvatar && (
              <View style={styles.avatarLoading}>
                <ActivityIndicator color={colors.white} />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={handlePickAvatar}
            disabled={uploadingAvatar}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="camera-outline" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Dados pessoais */}
        <View style={styles.fields}>
          <View>
            <Text style={styles.label}>Nome</Text>
            <View style={styles.field}>
              <Ionicons name="person-outline" size={18} color={colors.inkSoft} />
              <TextInput
                style={styles.input}
                placeholder="Nome completo"
                placeholderTextColor={colors.inkSoft}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View>
            <Text style={styles.label}>Telefone</Text>
            <View style={styles.field}>
              <Ionicons name="call-outline" size={18} color={colors.inkSoft} />
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.inkSoft}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View>
            <Text style={styles.label}>Documento (CPF)</Text>
            <View style={styles.field}>
              <Ionicons name="id-card-outline" size={18} color={colors.inkSoft} />
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor={colors.inkSoft}
                value={document}
                onChangeText={setDocument}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, savingProfile && styles.buttonDisabled]}
          onPress={handleSaveProfile}
          disabled={savingProfile}
        >
          {savingProfile ? (
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
    marginBottom: spacing.xxl,
  },
  avatarWrap: {
    alignSelf: 'center',
    marginBottom: spacing.xxl,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarLoading: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(38, 33, 28, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.orangeDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cream,
  },
  fields: {
    gap: spacing.md,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
    marginBottom: 6,
    marginLeft: 4,
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