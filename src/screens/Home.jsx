import { StyleSheet, Text, View,Button } from 'react-native'
import React from 'react'

const Home = ({navigation}) => {
  return (
     <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text>Home</Text>
              <Button title='Sair' onPress={() => navigation.navigate('login')}/>
            
      </View>
  )
}

export default Home

const styles = StyleSheet.create({})