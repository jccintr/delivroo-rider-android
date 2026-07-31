import { Button, StyleSheet, Text, View } from 'react-native'
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'

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
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Preload</Text>
      <Button title='ir para Login' onPress={() => navigation.navigate('login')}/>
    </View>
  )
}

export default Preload

const styles = StyleSheet.create({})