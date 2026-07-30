import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DELIVROO EXPRESS</Text>
      <Text style={styles.subtitle}>Entregas na palma da mão</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title:{
    color: '#fff',
    fontSize: 30,
    marginBottom: 20,
    fontWeight: 'bold'
  },
  subtitle: {
    color: '#fff',
    fontSize: 18
  }
});
