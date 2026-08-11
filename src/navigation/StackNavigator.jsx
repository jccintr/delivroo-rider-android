import { createNativeStackNavigator } from '@react-navigation/native-stack'
import DrawerNavigator from './DrawerNavigator';
import Preload from '../screens/Preload';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/drawer/Home';
import AccountActivation from '../screens/AccountActivation';
import VerifyPasswordCode from '../screens/VerifyPasswordCode';
import ResetPassword from '../screens/ResetPassword';
import RequestPasswordCode from '../screens/RequestPasswordCode';

import {colors} from '../theme/theme'



const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
       
    <Stack.Navigator initialRouteName='preload'>

        <Stack.Screen name='preload' component={Preload} options={{headerShown:false}}/>
        
        <Stack.Screen name='login' component={Login} options={{headerShown:false}}/>
        <Stack.Screen name='register' component={Register} options={{headerShown:false}}/>
        <Stack.Screen name='accountActivation' component={AccountActivation} options={{headerShown:false}}/>
        
        <Stack.Screen name='requestPasswordCode' component={RequestPasswordCode} options={{headerShown:false}}/>
        <Stack.Screen name='verifyPasswordCode' component={VerifyPasswordCode} options={{headerShown:false}}/>
        <Stack.Screen name='resetPassword' component={ResetPassword} options={{headerShown:false}}/>

       
        <Stack.Screen name="homeDrawer" component={DrawerNavigator} options={{headerShown:false}}/>
      

    </Stack.Navigator>
   
  )
}

export default StackNavigator