import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {useStatusBar} from '../../hooks/useStatusBar';
import { colors, fonts, fontSizes, radius, spacing } from '../../theme/theme';

const Deliveries = () => {
    useStatusBar(colors.white, 'dark-content');
  return (
    <View>
      <Text>Deliveries</Text>
    </View>
  )
}

export default Deliveries

const styles = StyleSheet.create({})