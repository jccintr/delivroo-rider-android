import { Image } from 'react-native'
import React from 'react'

const AssetImage = ({source,width,height,radius,mode}) => {
  
    return <Image source={source} style={{width:width,height:height,borderRadius:radius,resizeMode:mode}}/>

}

export default AssetImage