// DeliveryCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radius, spacing } from '../../theme/theme';
import NetworkImage from '../reusable/NetworkImage';

function formatPrice(value) {
  return typeof value === 'number'
    ? `R$ ${value.toFixed(2).replace('.', ',')}`
    : value;
}

function formatDistance(km) {
  if (typeof km !== 'number') return km;
  return `${km.toFixed(1).replace('.', ',')} km`;
}

// Rótulo (texto + cor) exibido como uma pill, por status — usado quando o
// card representa uma entrega já aceita (em andamento), não uma disponível.
const STATUS_LABELS = {
  1: { text: 'Retirar pacote', color: colors.orange },
  2: { text: 'Retirado', color: colors.orange },
  3: { text: 'A caminho', color: colors.green },
};

// Recebe a entrega inteira (como vem de GET /riders/deliveries/available ou
// /active) e extrai o que precisa exibir — evita ficar arrastando prop por
// prop toda vez que o card precisar de mais um dado da entrega/loja.
export default function DeliveryCard({ delivery, onPress }) {
  const { store, distancia, riderPayout, status } = delivery;
  const statusLabel = STATUS_LABELS[status];

  const metaParts = [
    store?.address?.district,
    formatDistance(distancia),
    formatPrice(riderPayout),
  ].filter(Boolean);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {store?.avatar ? (
        <NetworkImage source={store.avatar} width={40} height={40} radius={radius.md} />
      ) : (
        <View style={styles.iconWrap}>
          <Ionicons name="storefront-outline" size={18} color={colors.inkSoft} />
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.storeName} numberOfLines={1}>
            {store?.name}
          </Text>
          {statusLabel && (
            <View style={[styles.statusPill, { backgroundColor: `${statusLabel.color}1A` }]}>
              <Text style={[styles.statusPillText, { color: statusLabel.color }]}>
                {statusLabel.text}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {metaParts.join(' · ')}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.inkSoft} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.line,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  storeName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.ink,
    flexShrink: 1,
  },
  statusPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
  },
  meta: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
    marginTop: 2,
  },
});