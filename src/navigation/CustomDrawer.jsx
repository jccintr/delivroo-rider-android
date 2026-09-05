import { StyleSheet, Text, View,Linking } from 'react-native'
import {useContext} from 'react'
import { DrawerContentScrollView,DrawerItem } from '@react-navigation/drawer'
import { MaterialIcons, FontAwesome,Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetworkImage from '../components/reusable/NetworkImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {colors} from '../theme/theme'
import { useAuth } from '../contexts/AuthContext';

const CustomDrawer = ({ navigation }) => {
  //  const {loggedUser,setLoggedUser,setApiToken} = useContext(AuthContext);
    const version = '0.0.5 beta'; 
    const insets = useSafeAreaInsets();
    const { logout, user } = useAuth();

    const isAccountApproved = !!user?.accountApprovedAt;


 const handleLogout = async () => {
  try {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'login' }],
    });
  } catch (err) {
    console.log(err);
  }
};


  return (
    <View style={{flex:1,marginTop:insets.top,marginBottom:insets.bottom,backgroundColor:colors.cream}}>
        <DrawerContentScrollView>
              
              <View style={styles.header}>
                {user?.avatar == null ? (
                  <FontAwesome name="user-circle" size={60} color={colors.inkSoft} />
                ) : (
                  <NetworkImage source={user?.avatar} width={80} height={80} radius={40} />
                )}

                {/* Nome + badge de conta aprovada */}
                <View style={styles.nameRow}>
                  <Text allowFontScaling={false} style={styles.nameText}>
                    {user?.name}
                  </Text>
                  {isAccountApproved && (
                    <View style={styles.approvedBadge}>
                      <MaterialIcons name="verified" size={12} color={colors.white} />
                      <Text allowFontScaling={false} style={styles.approvedBadgeText}>
                        Aprovado
                      </Text>
                    </View>
                  )}
                </View>

                <Text allowFontScaling={false} style={{ color: colors.inkSoft }}>
                  {user?.email}
                </Text>
              </View>
              
              <DrawerItem
                icon={()=><FontAwesome name="home" size={24} color={colors.inkSoft} />}
                label="Tela Principal"
                labelStyle={{color:colors.inkSoft}}
                onPress={() => navigation.navigate('homeDrawer', { screen: 'home' })}
                allowFontScaling={false}
            />
            <DrawerItem
                icon={()=><Feather name="package" size={24} color={colors.inkSoft} />}
                label="Minhas Entregas"
                labelStyle={{color:colors.inkSoft}}
                onPress={() => navigation.navigate('deliveries')}
                allowFontScaling={false}
            />
            <DrawerItem
                icon={()=><MaterialIcons name="attach-money" size={24} color={colors.inkSoft} />}
                label="Meus Ganhos"
                labelStyle={{color:colors.inkSoft}}
                onPress={() => navigation.navigate('myEarnings')}
                allowFontScaling={false}
            />
             <DrawerItem
                icon={()=><FontAwesome name="user-circle" size={24} color={colors.inkSoft} />}
                label="Meu Perfil"
                labelStyle={{color:colors.inkSoft}}
                onPress={() => navigation.navigate('profile')}
                allowFontScaling={false}
            />
            <DrawerItem
                icon={()=><MaterialIcons name="delivery-dining" size={24} color={colors.inkSoft} />}
                label="Meu Veículo"
                labelStyle={{color:colors.inkSoft}}
                onPress={() => navigation.navigate('vehicleDetails')}
                allowFontScaling={false}
            />
            {!isAccountApproved && (
              <DrawerItem
                  icon={()=><FontAwesome name="photo" size={24} color={colors.inkSoft} />}
                  label="Enviar Documento"
                  labelStyle={{color:colors.inkSoft}}
                  onPress={() => navigation.navigate('documentUpload')}
                  allowFontScaling={false}
              />
            )}
            
            <DrawerItem
                icon={()=><MaterialIcons name="logout" size={24} color={'#ff0000'} />}
                label="Sair"
                labelStyle={{color: '#ff0000'}}
                onPress={handleLogout}
                allowFontScaling={false}
            />
                  
        </DrawerContentScrollView>
    <Text allowFontScaling={false} style={styles.versionText}>Versão: {version}</Text>
 </View>
  )
}

export default CustomDrawer



const styles = StyleSheet.create({
    container:{
     flex:1,
    },
    header:{
        padding: 10,
        flexDirection:'column',
        alignItems: 'center',
    },
    nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  nameText: {
    fontWeight: 'bold',
    color: colors.inkSoft,
  },
    approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    gap: 4,
  },
  approvedBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
    versionText:{
      marginBottom:10,
      textAlign:'center',
      color:colors.ink
    }
})