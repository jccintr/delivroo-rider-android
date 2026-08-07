import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing } from '../theme/theme';
import AssetImage from '../components/reusable/AssetImage';
import rider from '../assets/rider-cream.png';
import {useStatusBar} from '../hooks/useStatusBar';


const Preload = ({ navigation }) => {
  const { isAuthenticated, loading, user } = useAuth();
  useStatusBar(colors.orange, 'dark-content');

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      const route = user?.emailVerifiedAt ? 'homeDrawer' : 'accountActivation';
      navigation.reset({
        index: 0,
        routes: [{ name: route }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'login' }],
      });
    }
  }, [isAuthenticated, loading, user, navigation]);

  return (
    <View style={styles.container}>
       <View style={{alignSelf: 'center'}}>
          <AssetImage radius={0} height={120} width={120} source={rider} mode={'contain'} />
       </View>
      <Text style={styles.h1}>Delivroo Express</Text>
      <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.cream} />
    </View>
  );
};

export default Preload;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xxl,
    justifyContent: 'center',
    backgroundColor: colors.orange,
  },
  h1: {
    fontFamily: 'Baloo2_700Bold',
    color: colors.cream,
    fontSize: 34,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
});