import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Preload from '../screens/Preload';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/Home';
import AccountActivation from '../screens/AccountActivation';
import { StatusBar } from 'react-native';
import {colors} from '../theme/theme'



const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <>
    <StatusBar 
        backgroundColor={colors.orange} 
        barStyle="dark-content" 
        translucent={false} 
      />
    <Stack.Navigator initialRouteName='preload'>

        <Stack.Screen name='preload' component={Preload} options={{headerShown:false}}/>
        <Stack.Screen name='login' component={Login} options={{headerShown:false}}/>
        <Stack.Screen name='register' component={Register} options={{headerShown:false}}/>
        <Stack.Screen name='accountActivation' component={AccountActivation} options={{headerShown:false}}/>
        <Stack.Screen name='home' component={Home} options={{headerShown:false}}/>
      

    </Stack.Navigator>
    </>
  )
}

export default StackNavigator