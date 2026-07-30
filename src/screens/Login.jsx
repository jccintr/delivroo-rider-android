import { StyleSheet, Text, View,Button } from 'react-native'
import React from 'react'
import {useAuth} from '../contexts/AuthContext'

const Login = ({navigation}) => {

const { login, requestLoading, error } = useAuth();

  const handleLogin = async () => {
    console.log('handleLogin');
    try {
     const resp =  await login("paulinho@gmail.com", '123456');
     console.log(data);
      // navegação automática (se usar navegação baseada em isAuthenticated)
    } catch (err) {
      // error já está disponível
    }
  };


  return (
     <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Login</Text>
          <Button title='Fazer Loginnnnn' onPress={handleLogin} style={{marginBottom: 30}}/>
          <Button title='Cadastrar' onPress={() => navigation.navigate('register')}/>
        </View>
  )
}

export default Login

const styles = StyleSheet.create({})