import { useAuth } from '../../contexts/AuthContext'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {colors, fonts, fontSizes, radius, spacing} from '../../theme/theme';
import DeliveryCard from '../../components/cards/DeliveryCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {useStatusBar} from '../../hooks/useStatusBar';
import AlertModal from '../../components/modals/AlertModal';
import useAlertModal from '../../hooks/useAlertModal';
import { deliveryService } from '../../services/deliveryService';

// Intervalo de atualização automática da lista de entregas disponíveis.
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
  const insets = useSafeAreaInsets();
  const alert = useAlertModal();
  useStatusBar(colors.orange, 'light-content');

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

  // Só busca/atualiza a lista enquanto o rider está online — offline não
  // tem sentido mostrar (nem consultar) entregas disponíveis.
  useEffect(() => {
    if (!isOnline) {
      setDeliveries([]);
      return;
    }

    fetchDeliveries();

    const intervalId = setInterval(() => {
      fetchDeliveries({ silent: true });
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isOnline, fetchDeliveries]);

  function handleRefresh() {
    setRefreshing(true);
    fetchDeliveries({ silent: true });
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

  
  const stats = {
    earningsToday: 84,
    deliveriesToday: 6,
    rating: 4.9,
  };
 
  function handleOpenDelivery(deliveryId) {
    navigation.navigate('DeliveryDetails', { deliveryId });
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
        </View>

        <View style={styles.statusToggle}>
          <Text style={styles.statusText}>
            {isOnline ? 'Você está online' : 'Você está offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            disabled={requestLoading}
            trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(255,255,255,0.3)' }}
            thumbColor={isOnline ? colors.green : colors.white}
          />
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>R$ {stats.earningsToday}</Text>
          <Text style={styles.statLabel}>Hoje</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{stats.deliveriesToday}</Text>
          <Text style={styles.statLabel}>Entregas</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{stats.rating}</Text>
          <Text style={styles.statLabel}>Avaliação</Text>
        </View>
      </View>

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

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={isOnline ? deliveries : []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <DeliveryCard
            delivery={item}
            onPress={() => handleOpenDelivery(item._id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        refreshing={refreshing}
        onRefresh={isOnline ? handleRefresh : undefined}
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
  statusToggle: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
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