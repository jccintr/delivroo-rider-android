import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStatusBar } from '../../hooks/useStatusBar';
import { colors, fonts, fontSizes, radius, spacing } from '../../theme/theme';
import { deliveryService } from '../../services/deliveryService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatMoney(value) {
  return `R$ ${(value ?? 0).toFixed(2).replace('.', ',')}`;
}

function pluralDeliveries(count) {
  return count === 1 ? 'entrega' : 'entregas';
}

const MyEarnings = () => {
  useStatusBar(colors.white, 'dark-content');
  const insets = useSafeAreaInsets();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Evita setState depois do componente desmontar, mesmo padrão usado em
  // Home.jsx e Deliveries.jsx.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchSummary = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);

    try {
      const data = await deliveryService.earningsSummary();
      if (isMountedRef.current) {
        setSummary(data);
        setError(null);
      }
    } catch (err) {
      console.log('Erro ao buscar resumo de ganhos:', err);
      if (isMountedRef.current) {
        setError(err?.data?.error || err?.message || 'Não foi possível carregar seus ganhos.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Busca ao montar e sempre que a tela ganha foco de novo não é necessário
  // aqui como é em Home (mini-dashboard) — o rider normalmente só entra
  // nesta tela via menu, então um refresh manual (pull-to-refresh) já cobre
  // o caso de "acabei de concluir uma entrega e quero ver atualizado".
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  function handleRefresh() {
    setRefreshing(true);
    fetchSummary({ silent: true });
  }

  if (loading && !summary) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator color={colors.orange} size="large" />
      </View>
    );
  }

  if (error && !summary) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.inkSoft} />
        <Text style={styles.emptyText}>{error}</Text>
      </View>
    );
  }

  const today = summary?.today ?? { earnings: 0, deliveries: 0 };
  const week = summary?.week ?? { earnings: 0, deliveries: 0 };
  const month = summary?.month ?? { earnings: 0, deliveries: 0 };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.orange]}
          tintColor={colors.orange}
        />
      }
    >
      {/* Card em destaque: ganhos de hoje — o número que mais importa pro
          rider no dia a dia, por isso ganha o tratamento visual principal. */}
      <View style={styles.featuredCard}>
        <View style={styles.featuredIconWrap}>
          <Ionicons name="wallet-outline" size={22} color={colors.white} />
        </View>
        <Text style={styles.featuredLabel}>Faturado hoje</Text>
        <Text style={styles.featuredValue}>{formatMoney(today.earnings)}</Text>
        <Text style={styles.featuredSubtitle}>
          {today.deliveries} {pluralDeliveries(today.deliveries)} concluída{today.deliveries === 1 ? '' : 's'}
        </Text>
      </View>

      {/* Semana e mês, lado a lado — mesma hierarquia visual dos cards do
          mini-dashboard da Home, um degrau abaixo do card em destaque. */}
      <View style={styles.row}>
        <View style={styles.periodCard}>
          <View style={styles.periodIconWrap}>
            <Ionicons name="calendar-outline" size={18} color={colors.orangeDark} />
          </View>
          <Text style={styles.periodLabel}>Esta semana</Text>
          <Text style={styles.periodValue}>{formatMoney(week.earnings)}</Text>
          <Text style={styles.periodSubtitle}>
            {week.deliveries} {pluralDeliveries(week.deliveries)}
          </Text>
        </View>

        <View style={styles.periodCard}>
          <View style={styles.periodIconWrap}>
            <Ionicons name="calendar-number-outline" size={18} color={colors.orangeDark} />
          </View>
          <Text style={styles.periodLabel}>Este mês</Text>
          <Text style={styles.periodValue}>{formatMoney(month.earnings)}</Text>
          <Text style={styles.periodSubtitle}>
            {month.deliveries} {pluralDeliveries(month.deliveries)}
          </Text>
        </View>
      </View>

      <Text style={styles.footnote}>
        Considera apenas entregas concluídas. Os períodos seguem o horário de Brasília — a semana começa
        na segunda-feira.
      </Text>
    </ScrollView>
  );
};

export default MyEarnings;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  emptyText: {
    color: colors.inkSoft,
    fontSize: fontSizes.sm,
    fontFamily: fonts.bodyRegular,
    textAlign: 'center',
  },
  featuredCard: {
    backgroundColor: colors.orange,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  featuredIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  featuredLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.base,
    color: 'rgba(255,255,255,0.9)',
  },
  featuredValue: {
    fontFamily: fonts.headingExtraBold,
    fontSize: fontSizes.display,
    color: colors.white,
    marginTop: spacing.xs,
  },
  featuredSubtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  periodCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    alignItems: 'center',
  },
  periodIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  periodLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  periodValue: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.xl,
    color: colors.orangeDark,
    marginTop: spacing.xs,
  },
  periodSubtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
    marginTop: 2,
  },
  footnote: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});