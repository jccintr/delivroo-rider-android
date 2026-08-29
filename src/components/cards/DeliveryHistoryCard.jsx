// DeliveryHistoryCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radius, spacing } from '../../theme/theme';
import NetworkImage from '../reusable/NetworkImage';

function formatCurrency(value) {
  return typeof value === 'number' ? `R$ ${value.toFixed(2).replace('.', ',')}` : '—';
}

function formatDistance(km) {
  return typeof km === 'number' ? `${km.toFixed(1).replace('.', ',')} km` : '—';
}

// Sem Intl/toLocaleString de propósito (mesma linha das outras formatações
// deste componente) — usa os getters locais do Date, então mostra o
// horário no fuso do próprio aparelho do rider.
function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} ${hh}:${min}`;
}

// Mesma tabela de status do modelo Delivery no backend (models/delivery.js),
// restrita aos 3 estados finais que essa tela mostra.
const STATUS_INFO = {
  4: { text: 'Entregue', color: colors.green },
  5: { text: 'Devolvida', color: colors.amber },
  6: { text: 'Cancelada', color: colors.red },
};

// Card só de leitura (sem onPress) — diferente do DeliveryCard usado em
// Home, aqui não há nenhuma ação a tomar sobre uma entrega já finalizada.
export default function DeliveryHistoryCard({ delivery }) {
  const { store, destino, package: pkg, distancia, riderPayout, status, createdAt, cancelReason } = delivery;
  const statusInfo = STATUS_INFO[status] ?? { text: 'Status desconhecido', color: colors.inkSoft };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.statusPill, { backgroundColor: `${statusInfo.color}1A` }]}>
          <Text style={[styles.statusPillText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
        </View>
        <Text style={styles.date}>{formatDateTime(createdAt)}</Text>
      </View>

      <View style={styles.storeRow}>
        {store?.avatar ? (
          <NetworkImage source={store.avatar} width={32} height={32} radius={radius.sm} />
        ) : (
          <View style={styles.iconWrap}>
            <Ionicons name="storefront-outline" size={14} color={colors.inkSoft} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.storeName} numberOfLines={1}>
            {store?.name}
          </Text>
          <Text style={styles.packageDescription} numberOfLines={1}>
            {pkg?.description}
          </Text>
        </View>
      </View>

      {destino?.address && (
        <Text style={styles.address} numberOfLines={1}>
          {destino.address}
        </Text>
      )}

      {cancelReason && (
        <Text style={styles.cancelReason} numberOfLines={2}>
          Motivo: {cancelReason}
        </Text>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.meta}>{formatDistance(distancia)}</Text>
        <Text style={styles.payout}>{formatCurrency(riderPayout)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  date: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.line,
  },
  storeName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.ink,
  },
  packageDescription: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
    marginTop: 1,
  },
  address: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  cancelReason: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  meta: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  payout: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.orangeDark,
  },
});