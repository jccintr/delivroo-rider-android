import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Preload = ({navigation}) => {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Preload</Text>
      <Button title='ir para Login' onPress={() => navigation.navigate('login')}/>
    </View>
  )
}

export default Preload

const styles = StyleSheet.create({})