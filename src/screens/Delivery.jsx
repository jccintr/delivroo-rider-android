import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, fontSizes, radius, spacing } from '../theme/theme';
import { deliveryService } from '../services/deliveryService';
import NetworkImage from '../components/reusable/NetworkImage';
import AlertModal from '../components/modals/AlertModal';
import ReasonModal from '../components/modals/ReasonModal';
import useAlertModal from '../hooks/useAlertModal';
import { useStatusBar } from '../hooks/useStatusBar';

function formatCurrency(value) {
  return typeof value === 'number' ? `R$ ${value.toFixed(2).replace('.', ',')}` : '—';
}

function formatDistance(km) {
  return typeof km === 'number' ? `${km.toFixed(1).replace('.', ',')} km` : '—';
}

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

// Configuração de cada etapa do fluxo pós-aceite: rótulo da tela, do
// passo no stepper, e do botão de ação principal daquele status.
const STEP_CONFIG = {
  1: { step: 0, screenTitle: 'Retirar pacote', actionLabel: 'Confirmar retirada' },
  2: { step: 1, screenTitle: 'A caminho do cliente', actionLabel: 'Estou a caminho' },
  3: { step: 2, screenTitle: 'Confirmar entrega', actionLabel: 'Confirmar entrega' },
};
const STEPS = ['Retirar', 'A caminho', 'Entregue'];

export default function Delivery({ route, navigation }) {
  const { deliveryId } = route.params ?? {};
  const insets = useSafeAreaInsets();
  const alert = useAlertModal();
  const mapRef = useRef(null);
  useStatusBar(colors.white, 'dark-content');

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 'cancel' | 'return' | null — controla o ReasonModal
  const [reasonAction, setReasonAction] = useState(null);
  const [reasonLoading, setReasonLoading] = useState(false);

  const loadDelivery = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await deliveryService.getById(deliveryId);
      setDelivery(data);
    } catch (err) {
      console.log('Erro ao buscar a entrega:', err);
      setLoadError(err?.data?.error || err?.message || 'Não foi possível carregar esta entrega.');
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    if (deliveryId) {
      loadDelivery();
    } else {
      setLoading(false);
      setLoadError('Entrega inválida.');
    }
  }, [deliveryId, loadDelivery]);

  function goToHome() {
    navigation.reset({ index: 0, routes: [{ name: 'homeDrawer' }] });
  }

  // Avança para a próxima etapa (pickup → en-route → deliver), de acordo
  // com o status atual da entrega. Ao entregar com sucesso, sai da tela —
  // a entrega deixa de ser "ativa" e não faz mais sentido continuar aqui.
  async function handlePrimaryAction() {
    if (!delivery) return;
    setActionLoading(true);

    try {
      if (delivery.status === 1) {
        const updated = await deliveryService.pickup(delivery._id);
        setDelivery(updated);
      } else if (delivery.status === 2) {
        const updated = await deliveryService.enRoute(delivery._id);
        setDelivery(updated);
      } else if (delivery.status === 3) {
        await deliveryService.deliver(delivery._id);
        alert.show({
          type: 'success',
          title: 'Entrega concluída!',
          message: 'Obrigado por mais essa entrega.',
          onClose: goToHome,
        });
        return;
      }
    } catch (err) {
      console.log('Erro ao avançar a entrega:', err);
      alert.show({
        type: 'error',
        title: 'Não foi possível continuar',
        message: err?.data?.error || err?.message || 'Tente novamente em instantes.',
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReasonConfirm(motivo) {
    setReasonLoading(true);
    const action = reasonAction;

    try {
      if (action === 'cancel') {
        await deliveryService.cancel(delivery._id, motivo);
      } else {
        await deliveryService.returnToStore(delivery._id, motivo);
      }

      setReasonAction(null);
      alert.show({
        type: 'success',
        title: action === 'cancel' ? 'Entrega cancelada' : 'Devolução registrada',
        message:
          action === 'cancel'
            ? 'A entrega voltou para a lista de disponíveis.'
            : 'A loja foi notificada sobre a devolução do pacote.',
        onClose: goToHome,
      });
    } catch (err) {
      console.log('Erro ao registrar cancelamento/devolução:', err);
      setReasonAction(null);
      alert.show({
        type: 'error',
        title: 'Não foi possível continuar',
        message: err?.data?.error || err?.message || 'Tente novamente em instantes.',
      });
    } finally {
      setReasonLoading(false);
    }
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
        <TouchableOpacity style={styles.backLink} onPress={goToHome}>
          <Text style={styles.backLinkText}>Voltar para a Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { store, origem, destino, package: pkg, distancia, riderPayout, status } = delivery;
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

  const stepConfig = STEP_CONFIG[status];
  const canCancel = status === 1;
  const canReturn = status === 2 || status === 3;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.headerTitle}>{stepConfig?.screenTitle || 'Entrega'}</Text>
      </View>

      {/* Stepper simples com as 3 etapas do pós-aceite */}
      <View style={styles.stepper}>
        {STEPS.map((label, index) => {
          const isDone = stepConfig && index < stepConfig.step;
          const isCurrent = stepConfig && index === stepConfig.step;
          return (
            <React.Fragment key={label}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    isDone && styles.stepDotDone,
                    isCurrent && styles.stepDotCurrent,
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={12} color={colors.white} />
                  ) : (
                    <Text style={[styles.stepDotText, isCurrent && styles.stepDotTextCurrent]}>
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, isCurrent && styles.stepLabelCurrent]}>{label}</Text>
              </View>
              {index < STEPS.length - 1 && <View style={styles.stepLine} />}
            </React.Fragment>
          );
        })}
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
              <MapViewDirections
                origin={{ latitude: origem.latitude, longitude: origem.longitude }}
                destination={{ latitude: destino.latitude, longitude: destino.longitude }}
                apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}
                strokeWidth={4}
                strokeColor={colors.orange}
                onReady={(result) => {
                  // Reenquadra usando os pontos reais da rota (mais preciso
                  // que só os 2 marcadores, já que a via pode fazer curvas).
                  mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
                    animated: false,
                  });
                }}
                onError={(errorMessage) => {
                  console.log('Erro ao calcular rota:', errorMessage);
                  // Se a rota falhar, ao menos garante os 2 pontos visíveis.
                  fitMapToDelivery(mapRef, origem, destino);
                }}
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
              {destino?.telefone && <Text style={styles.addressMeta}>{destino.telefone}</Text>}
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

        {(canCancel || canReturn) && (
          <TouchableOpacity
            style={styles.destructiveLink}
            onPress={() => setReasonAction(canCancel ? 'cancel' : 'return')}
            disabled={actionLoading}
          >
            <Text style={styles.destructiveLinkText}>
              {canCancel ? 'Cancelar entrega' : 'Devolver pacote à loja'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[styles.actionButton, actionLoading && styles.actionButtonDisabled]}
          onPress={handlePrimaryAction}
          disabled={actionLoading}
          activeOpacity={0.85}
        >
          {actionLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.actionButtonText}>{stepConfig?.actionLabel || 'Continuar'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ReasonModal
        visible={reasonAction != null}
        title={reasonAction === 'cancel' ? 'Cancelar entrega' : 'Devolver à loja'}
        message={
          reasonAction === 'cancel'
            ? 'Conte pra gente o motivo do cancelamento. A entrega volta para a lista de disponíveis.'
            : 'Conte pra gente o motivo da devolução (cliente não encontrado, recusou o pacote, etc).'
        }
        confirmText={reasonAction === 'cancel' ? 'Cancelar entrega' : 'Confirmar devolução'}
        loading={reasonLoading}
        onCancel={() => setReasonAction(null)}
        onConfirm={handleReasonConfirm}
      />

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
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: colors.green,
  },
  stepDotCurrent: {
    backgroundColor: colors.orange,
  },
  stepDotText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  stepDotTextCurrent: {
    color: colors.white,
  },
  stepLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
    marginTop: 4,
  },
  stepLabelCurrent: {
    fontFamily: fonts.bodySemiBold,
    color: colors.ink,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.line,
    marginHorizontal: spacing.xs,
    marginBottom: 18,
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
  destructiveLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  destructiveLinkText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.red,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  actionButton: {
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.lg,
    color: colors.white,
    letterSpacing: 0.5,
  },
});