import { createDrawerNavigator } from '@react-navigation/drawer';
import Home from '../screens/drawer/Home';
import Profile from '../screens/drawer/Profile';
import Deliveries from '../screens/drawer/Deliveries';
import VehicleDetails from '../screens/drawer/VehicleDetails';
import MyEarnings from '../screens/drawer/MyEarnings';
import DocumentUpload from '../screens/drawer/DocumentUpload';
import CustomDrawer from './CustomDrawer';

import { colors } from '../theme/theme';




const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    
    <Drawer.Navigator drawerContent={ props => <CustomDrawer {...props}/> }>
       
       <Drawer.Screen name='home' component={Home} options={{headerShown:false}}/>
       <Drawer.Screen name="profile" component={Profile} options={{headerTitle:'Meu Perfil'}} />
       <Drawer.Screen name="deliveries" component={Deliveries} options={{headerTitle:'Minhas Entregas'}} />
        <Drawer.Screen name="myEarnings" component={MyEarnings} options={{headerTitle:'Meus Ganhos'}} />
       <Drawer.Screen name="vehicleDetails" component={VehicleDetails} options={{headerTitle:'Meu Veículo'}} />
       <Drawer.Screen name="documentUpload" component={DocumentUpload} options={{headerTitle:'Enviar Documento'}} />
      
  </Drawer.Navigator>
 
  )
}

export default DrawerNavigator
