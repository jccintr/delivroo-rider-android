import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStatusBar } from '../../hooks/useStatusBar';
import { colors, fonts, fontSizes, radius, spacing } from '../../theme/theme';
import { deliveryService } from '../../services/deliveryService';
import DeliveryHistoryCard from '../../components/cards/DeliveryHistoryCard';
import { getPeriodRange } from '../../utils/dateRanges';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PAGE_SIZE = 20;

// Filtro de status exibido como chips — mapeia pro parâmetro que a API
// espera (GET /riders/deliveries/history?status=...). '' = sem filtro,
// traz os 3 status finais de uma vez.
const STATUS_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'delivered', label: 'Entregues' },
  { value: 'returned', label: 'Devolvidas' },
  { value: 'cancelled', label: 'Canceladas' },
];

// Filtro de período — atalhos pré-definidos em vez de um seletor de data
// (o app não tem nenhum date-picker nativo instalado ainda). Os intervalos
// reais são calculados em utils/dateRanges.js. Tocar no chip já selecionado
// desmarca (volta pra "sem filtro de período").
const PERIOD_FILTERS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
];

const Deliveries = () => {
  useStatusBar(colors.white, 'dark-content');
  const insets = useSafeAreaInsets();
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true); // carga inicial / troca de filtro
  const [loadingMore, setLoadingMore] = useState(false); // scroll infinito
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh
  const [error, setError] = useState(null);

  // Evita setState depois do componente desmontar (ex: rider troca de tela
  // no meio de um fetch), mesmo padrão usado em Home.jsx.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchPage = useCallback(
    async (pageToFetch, { replace }) => {
      try {
        const { from, to } = getPeriodRange(periodFilter);
        const result = await deliveryService.listHistory({
          status: statusFilter || undefined,
          from,
          to,
          page: pageToFetch,
          limit: PAGE_SIZE,
        });

        if (!isMountedRef.current) return;

        setItems((prev) => (replace ? result.data : [...prev, ...result.data]));
        setPage(result.page);
        setTotalPages(result.totalPages);
        setError(null);
      } catch (err) {
        console.log('Erro ao buscar histórico de entregas:', err);
        if (isMountedRef.current) {
          setError(err?.data?.error || err?.message || 'Não foi possível carregar seu histórico.');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [statusFilter, periodFilter],
  );

  // Toda vez que algum filtro muda, recomeça do zero (página 1, substitui
  // a lista em vez de acumular).
  useEffect(() => {
    setLoading(true);
    fetchPage(1, { replace: true });
  }, [fetchPage]);

  function handleSelectStatus(value) {
    if (value === statusFilter) return;
    setStatusFilter(value);
  }

  // Tocar no período já selecionado desmarca (toggle) — os chips de status
  // sempre têm um selecionado ("Todas" por padrão), mas período começa sem
  // nenhum ativo, então precisa de um jeito de "desligar" o filtro.
  function handleSelectPeriod(value) {
    setPeriodFilter((prev) => (prev === value ? '' : value));
  }

  function handleRefresh() {
    setRefreshing(true);
    fetchPage(1, { replace: true });
  }

  function handleLoadMore() {
    if (loading || loadingMore || refreshing) return;
    if (page >= totalPages) return;
    setLoadingMore(true);
    fetchPage(page + 1, { replace: false });
  }

  const hasActiveFilters = statusFilter || periodFilter;

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <View style={styles.filtersRow}>
        {STATUS_FILTERS.map((filter) => {
          const selected = filter.value === statusFilter;
          return (
            <TouchableOpacity
              key={filter.value || 'all'}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => handleSelectStatus(filter.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{filter.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.filtersRow, styles.periodFiltersRow]}>
        {PERIOD_FILTERS.map((filter) => {
          const selected = filter.value === periodFilter;
          return (
            <TouchableOpacity
              key={filter.value}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => handleSelectPeriod(filter.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{filter.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading && items.length === 0 ? (
        <ActivityIndicator color={colors.orange} style={{ marginTop: spacing.xxl }} />
      ) : error && items.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.inkSoft} />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Minhas Entregas</Text>
          <Text style={styles.emptyText}>
            {hasActiveFilters
              ? 'Nenhuma entrega encontrada para esses filtros.'
              : 'Suas entregas concluídas, devolvidas ou canceladas aparecerão aqui.'}
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <DeliveryHistoryCard delivery={item} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReachedThreshold={0.4}
          onEndReached={handleLoadMore}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={colors.orange} style={{ marginVertical: spacing.md }} />
            ) : null
          }
        />
      )}
    </View>
  );
};

export default Deliveries;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  periodFiltersRow: {
    paddingTop: 0,
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipSelected: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  chipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  chipTextSelected: {
    color: colors.white,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: {
    color: colors.inkSoft,
    fontSize: fontSizes.lg,
    fontFamily: fonts.headingBold,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.inkSoft,
    fontSize: fontSizes.sm,
    fontFamily: fonts.bodyRegular,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});