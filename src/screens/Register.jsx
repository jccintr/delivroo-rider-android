import { StyleSheet, Text, View,Button } from 'react-native'
import React from 'react'

const Register = ({navigation}) => {
  return (
     <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text>Cadastro</Text>
              <Button title='Ir para Login' onPress={() => navigation.navigate('login')}/>
             
      </View>
  )
}

export default Register

const styles = StyleSheet.create({})