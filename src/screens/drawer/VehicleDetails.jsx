import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {useStatusBar} from '../../hooks/useStatusBar';
import { colors, fonts, fontSizes, radius, spacing } from '../../theme/theme';

const VehicleDetails = () => {
    useStatusBar(colors.white, 'dark-content');
  return (
    <View>
      <Text>VehicleDetails</Text>
    </View>
  )
}

export default VehicleDetails

const styles = StyleSheet.create({})