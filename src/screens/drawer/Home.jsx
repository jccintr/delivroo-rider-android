
import { useAuth } from '../../contexts/AuthContext'
import React, { useState, useEffect} from 'react';
import { View, Text, StyleSheet, ScrollView, Switch,TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {colors, fonts, fontSizes, radius, spacing} from '../../theme/theme';
import DeliveryCard from '../../components/cards/DeliveryCard';
import NetworkImage from '../../components/reusable/NetworkImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {useStatusBar} from '../../hooks/useStatusBar';
import AlertModal from '../../components/modals/AlertModal';
import useAlertModal from '../../hooks/useAlertModal';

// mock das entregas - remover depois
const AVAILABLE_DELIVERIES = [
  {
    id: '1',
    storeName: 'Pizzaria Bella Napoli',
    distanceKm: 2.3,
    price: 12.5,
    category: 'pizza',
  },
  {
    id: '2',
    storeName: 'Burger House',
    distanceKm: 1.1,
    price: 9.0,
    category: 'burger',
  },
];



const Home = ({navigation}) => {
  const { logout, user, toggleOnline, requestLoading, documentPromptShown,markDocumentPromptShown } = useAuth();
  const [isOnline, setIsOnline] = useState(user?.online);
  const insets = useSafeAreaInsets();
  //const documentAlertShown = useRef(false);
  const alert = useAlertModal();
   useStatusBar(colors.orange, 'light-content');
  
    //const isOnline = !!user?.online;

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
    <ScrollView style={styles.screen} contentContainerStyle={{  paddingBottom: spacing.xxl }}>
       
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

      <View style={styles.list}>
        {AVAILABLE_DELIVERIES.map((delivery) => (
          <DeliveryCard
            key={delivery.id}
            storeName={delivery.storeName}
            distanceKm={delivery.distanceKm}
            price={delivery.price}
            category={delivery.category}
            onPress={() => handleOpenDelivery(delivery.id)}
          />
        ))}
      </View>
      <AlertModal {...alert.props} />
    </ScrollView>
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
   // paddingTop: spacing.xxl,
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
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
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
  list: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
});