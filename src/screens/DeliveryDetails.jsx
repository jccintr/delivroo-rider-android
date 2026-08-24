import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, fontSizes, radius, spacing } from '../theme/theme';
import { deliveryService } from '../services/deliveryService';
import NetworkImage from '../components/reusable/NetworkImage';
import AlertModal from '../components/modals/AlertModal';
import useAlertModal from '../hooks/useAlertModal';
import { useStatusBar } from '../hooks/useStatusBar';

function formatCurrency(value) {
  return typeof value === 'number' ? `R$ ${value.toFixed(2).replace('.', ',')}` : '—';
}

function formatDistance(km) {
  return typeof km === 'number' ? `${km.toFixed(1).replace('.', ',')} km` : '—';
}

// Ajusta a câmera do mapa para enquadrar origem + destino, com uma margem
// (padding) para as bordas não ficarem coladas na tela.
function fitMapToDelivery(mapRef, origem, destino) {
  if (!mapRef.current || !origem || !destino) return;

  mapRef.current.fitToCoordinates(
    [
      { latitude: origem.latitude, longitude: origem.longitude },
      { latitude: destino.latitude, longitude: destino.longitude },
    ],
    {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
      animated: false,
    },
  );
}

export default function DeliveryDetails({ route, navigation }) {
  const { deliveryId } = route.params ?? {};
  const insets = useSafeAreaInsets();
  const alert = useAlertModal();
  const mapRef = useRef(null);
  useStatusBar(colors.white, 'dark-content');

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDelivery() {
      setLoading(true);
      setLoadError(null);

      try {
        const data = await deliveryService.getById(deliveryId);
        if (isMounted) setDelivery(data);
      } catch (err) {
        console.log('Erro ao buscar detalhes da entrega:', err);
        if (isMounted) {
          setLoadError(
            err?.data?.error || err?.message || 'Não foi possível carregar esta entrega.',
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (deliveryId) {
      loadDelivery();
    } else {
      setLoading(false);
      setLoadError('Entrega inválida.');
    }

    return () => {
      isMounted = false;
    };
  }, [deliveryId]);

  // TODO: ligar no endpoint de aceite assim que ele existir na API
  // (algo como POST /riders/deliveries/:id/accept). Por enquanto só avisa
  // que a funcionalidade ainda não está disponível.
  function handleAccept() {
    setAccepting(true);
    alert.show({
      type: 'info',
      title: 'Em breve',
      message: 'O aceite de entregas ainda está sendo implementado.',
      onClose: () => setAccepting(false),
    });
  }

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.orange} size="large" />
      </View>
    );
  }

  if (loadError || !delivery) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.inkSoft} />
        <Text style={styles.errorText}>{loadError || 'Entrega não encontrada.'}</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { store, origem, destino, package: pkg, distancia, riderPayout } = delivery;
  // package traz os dados de pagamento (payment/amountDue/cashChange) —
  // desestruturado abaixo para deixar o JSX mais legível.
  const {
    description,
    category,
    quantity,
    weight,
    notes,
    payment: paymentMethod,
    amountDue,
    cashChange,
  } = pkg ?? {};
  const showAmountDue = paymentMethod && paymentMethod !== 'Pago' && paymentMethod !== 'Nada a Pagar' && amountDue > 0;
  const showCashChange = paymentMethod === 'Dinheiro' && cashChange > 0;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da entrega</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.storeRow}>
          {store?.avatar ? (
            <NetworkImage source={store.avatar} width={48} height={48} radius={radius.md} />
          ) : (
            <View style={styles.storeIconWrap}>
              <Ionicons name="storefront-outline" size={22} color={colors.inkSoft} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.storeName} numberOfLines={1}>
              {store?.name}
            </Text>
            {store?.address?.district && (
              <Text style={styles.storeDistrict}>{store.address.district}</Text>
            )}
          </View>
        </View>

        <View style={styles.payoutCard}>
          <View>
            <Text style={styles.payoutLabel}>Você recebe</Text>
            <Text style={styles.payoutValue}>{formatCurrency(riderPayout)}</Text>
          </View>
          <View style={styles.payoutDivider} />
          <View>
            <Text style={styles.payoutLabel}>Distância</Text>
            <Text style={styles.payoutSecondary}>{formatDistance(distancia)}</Text>
          </View>
        </View>

        {origem?.latitude != null && destino?.latitude != null && (
          <View style={styles.mapWrap}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              onMapReady={() => fitMapToDelivery(mapRef, origem, destino)}
              initialRegion={{
                latitude: (origem.latitude + destino.latitude) / 2,
                longitude: (origem.longitude + destino.longitude) / 2,
                latitudeDelta: Math.max(Math.abs(origem.latitude - destino.latitude) * 2, 0.02),
                longitudeDelta: Math.max(Math.abs(origem.longitude - destino.longitude) * 2, 0.02),
              }}
            >
              <Marker
                coordinate={{ latitude: origem.latitude, longitude: origem.longitude }}
                title={store?.name || 'Coleta'}
                description={origem.address}
                pinColor={colors.orange}
              />
              <Marker
                coordinate={{ latitude: destino.latitude, longitude: destino.longitude }}
                title="Entrega"
                description={destino.address}
                pinColor={colors.green}
              />
            </MapView>
          </View>
        )}

        <View style={styles.addressBlock}>
          <View style={styles.addressRow}>
            <View style={[styles.addressDot, { backgroundColor: colors.orange }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>Retirar em</Text>
              <Text style={styles.addressText}>{origem?.address}</Text>
            </View>
          </View>
          <View style={styles.addressRow}>
            <View style={[styles.addressDot, { backgroundColor: colors.green }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>Entregar em</Text>
              <Text style={styles.addressText}>{destino?.address}</Text>
              {destino?.nome && <Text style={styles.addressMeta}>{destino.nome}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pacote</Text>
          <Text style={styles.packageDescription}>{description}</Text>
          <View style={styles.tagsRow}>
            {category && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{category}</Text>
              </View>
            )}
            {quantity > 1 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{quantity}x</Text>
              </View>
            )}
            {weight != null && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{weight} kg</Text>
              </View>
            )}
          </View>
          {notes ? <Text style={styles.notes}>{notes}</Text> : null}
        </View>

        {(showAmountDue || showCashChange) && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Pagamento — {paymentMethod}</Text>
            {showAmountDue && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Cobrar do cliente</Text>
                <Text style={styles.paymentValue}>{formatCurrency(amountDue)}</Text>
              </View>
            )}
            {showCashChange && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Levar de troco</Text>
                <Text style={styles.paymentValue}>{formatCurrency(cashChange)}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[styles.acceptButton, accepting && styles.acceptButtonDisabled]}
          onPress={handleAccept}
          disabled={accepting}
          activeOpacity={0.85}
        >
          {accepting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.acceptButtonText}>ACEITAR ENTREGA</Text>
          )}
        </TouchableOpacity>
      </View>

      <AlertModal {...alert.props} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.cream,
  },
  errorText: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  backLink: {
    marginTop: spacing.sm,
  },
  backLinkText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.orangeDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.lg,
    color: colors.ink,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  storeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.line,
  },
  storeName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.lg,
    color: colors.ink,
  },
  storeDistrict: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
    marginTop: 2,
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  payoutDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.line,
  },
  payoutLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  payoutValue: {
    fontFamily: fonts.headingExtraBold,
    fontSize: fontSizes.display,
    color: colors.orangeDark,
  },
  payoutSecondary: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.xl,
    color: colors.ink,
  },
  mapWrap: {
    height: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  map: {
    flex: 1,
  },
  addressBlock: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  addressRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  addressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  addressLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  addressText: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.ink,
    marginTop: 2,
  },
  addressMeta: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  packageDescription: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.base,
    color: colors.ink,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.cream,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  tagText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  notes: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
    fontStyle: 'italic',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
  },
  paymentValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.ink,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  acceptButton: {
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonDisabled: {
    opacity: 0.7,
  },
  acceptButtonText: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.lg,
    color: colors.white,
    letterSpacing: 0.5,
  },
});