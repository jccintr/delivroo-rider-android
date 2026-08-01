import { Button, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'
import {colors, fonts, fontSizes, radius, spacing} from '../theme/theme';

const Preload = ({navigation}) => {
  const { isAuthenticated } = useAuth();


  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({routes:[{name:'home'}]});
    } else {
      navigation.navigate('login');
    }
  }, [isAuthenticated]);


  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Delivroo Express</Text>
      <ActivityIndicator style={{marginTop: 40}} size="large" color={colors.cream} />
    </View>
  )
}

export default Preload

const styles = StyleSheet.create({
  container: {
      flexGrow: 1,
      padding: spacing.xxl,
      justifyContent: 'center',
      backgroundColor: colors.orange
    },
    illustration: {
      width: '100%',
      height: 150,
      borderRadius: radius.xl,
      backgroundColor: colors.orangeDark,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    h1: {
      fontFamily: 'Baloo2_700Bold',
      color: colors.cream,
      fontSize: 34,
      marginBottom: spacing.xxl,
      textAlign: 'center',
    },
})