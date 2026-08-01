// DeliveryCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radius, spacing } from '../../theme/theme';

// Ícone/cor por categoria de estabelecimento. Adicione novas categorias aqui
// conforme o cadastro de lojas do app for crescendo.
const CATEGORY_STYLES = {
  pizza: { icon: 'pizza-outline', color: colors.amber, bg: colors.amberBg },
  burger: { icon: 'fast-food-outline', color: colors.green, bg: colors.greenBg },
  sushi: { icon: 'restaurant-outline', color: colors.orangeDark, bg: '#FFE7DB' },
  default: { icon: 'storefront-outline', color: colors.inkSoft, bg: colors.line },
};

export default function DeliveryCard({
  storeName,
  distanceKm,
  price,
  category = 'default',
  onPress,
}) {
  const categoryStyle = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.default;
  const formattedPrice =
    typeof price === 'number'
      ? `R$ ${price.toFixed(2).replace('.', ',')}`
      : price;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: categoryStyle.bg }]}>
        <Ionicons name={categoryStyle.icon} size={18} color={categoryStyle.color} />
      </View>

      <View style={styles.info}>
        <Text style={styles.storeName} numberOfLines={1}>
          {storeName}
        </Text>
        <Text style={styles.meta}>
          {distanceKm} km · {formattedPrice}
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
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  storeName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
    marginTop: 2,
  },
});