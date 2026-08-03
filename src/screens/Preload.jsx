import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing } from '../theme/theme';

const Preload = ({ navigation }) => {
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      const route = user?.emailVerifiedAt ? 'home' : 'accountActivation';
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