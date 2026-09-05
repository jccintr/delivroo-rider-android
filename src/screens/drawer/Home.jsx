import { useAuth } from '../../contexts/AuthContext'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {colors, fonts, fontSizes, radius, spacing} from '../../theme/theme';
import DeliveryCard from '../../components/cards/DeliveryCard';
import GoOnlineButton from '../../components/reusable/GoOnlineButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {useStatusBar} from '../../hooks/useStatusBar';
import AlertModal from '../../components/modals/AlertModal';
import useAlertModal from '../../hooks/useAlertModal';
import { deliveryService } from '../../services/deliveryService';

// Intervalo de atualização automática das listas de entregas (disponíveis
// e em andamento).
// TODO: quando o push notification de "nova entrega" existir, este polling
// pode virar só um fallback (aumentar o intervalo ou remover), já que o
// push vai avisar o rider em tempo real.
const POLLING_INTERVAL_MS = 20000;

const Home = ({navigation}) => {
  const { logout, user, toggleOnline, requestLoading, documentPromptShown,markDocumentPromptShown } = useAuth();
  const [isOnline, setIsOnline] = useState(user?.online);
  const [deliveries, setDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [stats, setStats] = useState({ earnings: 0, deliveries: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const insets = useSafeAreaInsets();
  const alert = useAlertModal();
  useStatusBar(colors.orange, 'light-content');

  const hasActiveDelivery = activeDeliveries.length > 0;

  // Evita setState depois do componente desmontar (ex: usuário navega para
  // outra tela durante um fetch em andamento no meio do polling).
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchDeliveries = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoadingDeliveries(true);

    try {
      const data = await deliveryService.listAvailable();
      if (isMountedRef.current) {
        setDeliveries(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.log('Erro ao buscar entregas disponíveis:', err);
    } finally {
      if (isMountedRef.current) {
        setLoadingDeliveries(false);
        setRefreshing(false);
      }
    }
  }, []);

  const fetchActive = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoadingActive(true);

    try {
      const data = await deliveryService.listActive();
      if (isMountedRef.current) {
        setActiveDeliveries(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.log('Erro ao buscar entregas em andamento:', err);
    } finally {
      if (isMountedRef.current) setLoadingActive(false);
    }
  }, []);

  const fetchStats = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoadingStats(true);

    try {
      const data = await deliveryService.statsToday();
      if (isMountedRef.current) {
        setStats({ earnings: data?.earnings ?? 0, deliveries: data?.deliveries ?? 0 });
      }
    } catch (err) {
      console.log('Erro ao buscar estatísticas do dia:', err);
    } finally {
      if (isMountedRef.current) setLoadingStats(false);
    }
  }, []);

  // A entrega em andamento é do próprio rider (ele já se comprometeu com
  // ela), então busca sempre — independente de estar online/offline no
  // momento. Já as disponíveis só fazem sentido buscar quando o rider está
  // online E não tem nada em andamento (ver efeito abaixo).
  useEffect(() => {
    fetchActive();
    const intervalId = setInterval(() => {
      fetchActive({ silent: true });
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fetchActive]);

  // Estatísticas do dia (faturado + quantidade de hoje): busca ao montar,
  // atualiza no mesmo intervalo de polling das demais listas, e também
  // sempre que a tela ganha foco de novo — é assim que o valor reflete uma
  // entrega concluída na tela Delivery assim que o rider volta pra Home.
  useEffect(() => {
    fetchStats();
    const intervalId = setInterval(() => {
      fetchStats({ silent: true });
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fetchStats]);

  useFocusEffect(
    useCallback(() => {
      fetchStats({ silent: true });
    }, [fetchStats])
  );

  // Só busca/atualiza a lista de disponíveis quando o rider está online e
  // não tem nenhuma entrega em andamento — enquanto ele está ocupado com
  // uma entrega, não faz sentido mostrar (nem consultar) novas opções.
  useEffect(() => {
    if (!isOnline || hasActiveDelivery) {
      setDeliveries([]);
      return;
    }

    fetchDeliveries();

    const intervalId = setInterval(() => {
      fetchDeliveries({ silent: true });
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isOnline, hasActiveDelivery, fetchDeliveries]);

  function handleRefresh() {
    setRefreshing(true);
    fetchDeliveries({ silent: true });
    fetchActive({ silent: true });
    fetchStats({ silent: true });
  }

    useEffect(() => {
    if (!user) return;
    if (documentPromptShown) return;
    if (user.accountApprovedAt || user.documentImage) return;

    markDocumentPromptShown();

    alert.show({
      type: 'warning',
      title: 'Documento pendente',
      message:
        'Envie a foto da sua CNH (ou RG, caso bicicleta) para analisarmos e aprovarmos sua conta. Sem isso você não poderá ficar aceitar entregas.',
      confirmText: 'Enviar documento',
      onClose: () => {       
        navigation.navigate('documentUpload'); 
      },
    });
  }, [user,documentPromptShown,markDocumentPromptShown,alert,navigation]);

  
  function handleOpenDelivery(deliveryId) {
    navigation.navigate('DeliveryDetails', { deliveryId });
  }

  function handleOpenActiveDelivery(deliveryId) {
    navigation.navigate('Delivery', { deliveryId });
  }


  const handleLogout = async () => {
  try {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'login' }],
    });
  } catch (err) {
    console.log(err);
  }
};

const handleToggleOnline = async () => {
  try {
   // await toggleOnline();
    const updated = await toggleOnline();
    setIsOnline(!!updated.online);
  } catch (err) {
    console.log(err);
  }
};

  return (
    <View style={[styles.screen,{paddingBottom: insets.bottom}]}>
      <View style={[styles.header,{ paddingTop: insets.top + spacing.xl }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity  onPress={() => navigation.openDrawer()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} >
              <Ionicons name="menu-outline" size={26} color={colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.greeting}>Olá,</Text>
            <Text style={styles.name}>{user?.name}</Text>
          </View>
          <GoOnlineButton
            value={isOnline}
            onValueChange={handleToggleOnline}
            loading={requestLoading}
          />
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          {loadingStats ? (
            <ActivityIndicator color={colors.orangeDark} size="small" />
          ) : (
            <Text style={styles.statValue}>R$ {stats.earnings.toFixed(2).replace('.', ',')}</Text>
          )}
          <Text style={styles.statLabel}>Faturado hoje</Text>
        </View>
        <View style={styles.stat}>
          {loadingStats ? (
            <ActivityIndicator color={colors.orangeDark} size="small" />
          ) : (
            <Text style={styles.statValue}>{stats.deliveries}</Text>
          )}
          <Text style={styles.statLabel}>Entregas hoje</Text>
        </View>
      </View>

      {loadingActive && activeDeliveries.length === 0 ? null : hasActiveDelivery ? (
        <View style={styles.activeSection}>
          <Text style={styles.sectionTitle}>Sua entrega em andamento</Text>
          <View style={{ gap: spacing.sm, paddingHorizontal: spacing.xl }}>
            {activeDeliveries.map((item) => (
              <DeliveryCard
                key={item._id}
                delivery={item}
                onPress={() => handleOpenActiveDelivery(item._id)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {hasActiveDelivery ? (
        <Text style={styles.emptyHint}>
          Finalize a entrega atual para ver novas oportunidades disponíveis.
        </Text>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Novas entregas para você</Text>

          {!isOnline && (
            <Text style={styles.emptyHint}>
              Fique online para ver as entregas disponíveis na sua região.
            </Text>
          )}

          {isOnline && loadingDeliveries && deliveries.length === 0 && (
            <ActivityIndicator color={colors.orange} style={{ marginTop: spacing.md }} />
          )}

          {isOnline && !loadingDeliveries && deliveries.length === 0 && (
            <Text style={styles.emptyHint}>
              Nenhuma entrega disponível no momento. A lista atualiza automaticamente.
            </Text>
          )}
        </>
      )}

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={isOnline && !hasActiveDelivery ? deliveries : []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <DeliveryCard
            delivery={item}
            onPress={() => handleOpenDelivery(item._id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        refreshing={refreshing}
        onRefresh={isOnline && !hasActiveDelivery ? handleRefresh : undefined}
      />

      <AlertModal {...alert.props} />
    </View>
  );
}

export default Home

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
    
  },
  header: {
    backgroundColor: colors.orange,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    padding: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  name: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.lg,
    color: colors.white,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.lg,
    color: colors.orangeDark,
  },
  statLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
    marginTop: 2,
  },
  activeSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.base,
    color: colors.ink,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    textAlign: 'center',
  },
  activeSection: {
    marginTop: spacing.xl,
  },
  // A FlatList é o único elemento com flex:1 — é ela quem ocupa o espaço
  // restante da tela e rola; tudo acima dela fica fixo.
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});