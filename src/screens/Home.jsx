import { StyleSheet, Text, View,Button } from 'react-native'
import React from 'react'
import { useAuth } from '../contexts/AuthContext'



const Home = ({navigation}) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    console.log('HandleLogout');
    try {

      await logout();
      navigation.navigate('login');
    } catch (err) {
      console.log(err);
    }
}




  return (
     <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text>Delivro Express Home</Text>
              <Button title='Sair' onPress={handleLogout}/>
            
      </View>
  )
}

export default Home

const styles = StyleSheet.create({})