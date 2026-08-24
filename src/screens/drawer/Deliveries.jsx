import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {useStatusBar} from '../../hooks/useStatusBar';
import { colors, fonts, fontSizes, radius, spacing } from '../../theme/theme';

const Deliveries = () => {
    useStatusBar(colors.white, 'dark-content');
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text style={{color: colors.inkSoft, fontSize: fontSizes.lg, fontFamily: fonts.bold,marginBottom: spacing.sm}}>Minhas Entregas</Text>
      <Text style={{color: colors.inkSoft, fontSize: fontSizes.sm, fontFamily: fonts.bodyRegular}}>Suas entregas aparecerão aqui</Text>
    </View>
  )
}

export default Deliveries

const styles = StyleSheet.create({})