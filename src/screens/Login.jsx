import { StyleSheet, Text, View,Button,ActivityIndicator, } from 'react-native'
import React from 'react'
import {useAuth} from '../contexts/AuthContext'
import {getRadios} from '../services/loginService'

const Login = ({navigation}) => {

const { login, requestLoading, error } = useAuth();
const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
   console.log('Login Request');
    try {
     const response =  await login("paulinho@gmail.com", '1234');
    const data = await response.json();
     console.log(data);
      // navegação automática (se usar navegação baseada em isAuthenticated)
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

   const handleRadios = async () => {
    setIsLoading(true);
   console.log('Rádios Request');
    try {
   
    const response = await getRadios();
     const data = await response.json();
     console.log(data);
      // navegação automática (se usar navegação baseada em isAuthenticated)
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
     <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Login</Text>
          <Button title='Fazer Login' onPress={handleLogin} />
          <View style={{marginBottom: 30}}/>
          <Button title='Radios' onPress={handleRadios} />
          <View style={{marginBottom: 30}}/>
          <Button title='Cadastrar' onPress={() => navigation.navigate('register')}/>
          <View style={{marginBottom: 50}}/>
          {isLoading && <ActivityIndicator size="large" color="#FF6B35" animating={requestLoading} />}
    </View>
  )
}

export default Login

const styles = StyleSheet.create({})