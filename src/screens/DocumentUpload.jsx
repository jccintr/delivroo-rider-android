import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radius, spacing } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';
import AlertModal from '../components/modals/AlertModal';
import useAlertModal from '../hooks/useAlertModal';
import { useStatusBar } from '../hooks/useStatusBar';

export default function DocumentUpload({ navigation }) {
  const { uploadDocument } = useAuth();
  const alert = useAlertModal();
  useStatusBar(colors.cream, 'dark-content');

  const [photoUri, setPhotoUri] = useState(null);
  const [isSending, setIsSending] = useState(false);

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert.show({
        type: 'warning',
        title: 'Permissão necessária',
        message: 'Precisamos de acesso à câmera para fotografar seu documento.',
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) return;
    setPhotoUri(result.assets[0].uri);
  }

  async function handlePickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert.show({
        type: 'warning',
        title: 'Permissão necessária',
        message: 'Precisamos de acesso às suas fotos para selecionar o documento.',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) return;
    setPhotoUri(result.assets[0].uri);
  }

  async function handleSend() {
    if (!photoUri) return;

    setIsSending(true);
    try {
      await uploadDocument(photoUri);
      alert.show({
        type: 'success',
        title: 'Documento enviado',
        message: 'Recebemos sua foto e vamos analisar em breve.',
        onClose: () => {
          navigation?.goBack?.();
        },
      });
    } catch (err) {
      alert.show({
        type: 'error',
        title: 'Erro ao enviar',
        message:
          err?.data?.error || err?.message || 'Não foi possível enviar seu documento. Tente novamente.',
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        

        <Text style={styles.title}>Envie seu documento</Text>
        <Text style={styles.subtitle}>
          Tire uma foto nítida da frente do seu documento (CNH ou RG) para confirmarmos sua identidade.
        </Text>

        <TouchableOpacity
          style={[styles.photoBox, photoUri && styles.photoBoxFilled]}
          onPress={photoUri ? undefined : handleTakePhoto}
          activeOpacity={photoUri ? 1 : 0.8}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={32} color={colors.inkSoft} />
              <Text style={styles.photoPlaceholderText}>Nenhuma foto selecionada</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto} disabled={isSending}>
            <Ionicons name="camera-outline" size={18} color={colors.orangeDark} />
            <Text style={styles.actionButtonText}>Tirar foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handlePickFromGallery} disabled={isSending}>
            <Ionicons name="image-outline" size={18} color={colors.orangeDark} />
            <Text style={styles.actionButtonText}>Galeria</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, (!photoUri || isSending) && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={!photoUri || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Enviar documento</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Usaremos essa foto apenas para verificar sua identidade.
        </Text>
        
      </ScrollView>

      <AlertModal {...alert.props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xxl,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  photoBox: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: 'dashed',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  photoBoxFilled: {
    borderStyle: 'solid',
    borderColor: colors.line,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  photoPlaceholderText: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.orange,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  actionButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.sm,
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
  footerNote: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  
});