import { StyleSheet, Image } from 'react-native';


const NetworkImage = ({ source, width, height, radius }) => {
  return (
    <Image
      source={{ uri: source }}
      style={[
        styles.image, 
        { width, height, borderRadius: radius }
      ]}
    />
  );
};

export default NetworkImage;

const styles = StyleSheet.create({

  image: {
    resizeMode: 'cover',
  },
  
});