import { StyleSheet, Text, View } from 'react-native'
import { colors, fonts, fontSizes, radius, spacing } from '../../theme/theme';

const MyEarnings = () => {
  return (
    <View style={styles.container}>
      <Text>My Earnings</Text>
    </View>
  )
}

export default MyEarnings

const styles = StyleSheet.create({
     container: {
        flexGrow: 1,
        padding: spacing.xxl,
      },
})