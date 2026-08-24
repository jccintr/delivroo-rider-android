// app.config.js — versão dinâmica do app.json, para poder injetar valores
// sensíveis (como a chave do Google Maps para Android) via variável de
// ambiente em vez de deixá-los hardcoded e comitados no repositório.
//
// Local: crie um arquivo `.env` na raiz (veja `.env.example`) com
//   ANDROID_GOOGLE_MAPS_API_KEY=sua_chave_aqui
// O Expo CLI carrega o `.env` automaticamente e o deixa disponível em
// process.env durante a avaliação deste arquivo — não precisa de prefixo
// EXPO_PUBLIC_ aqui, já que essa chave não é lida em runtime pelo JS, só
// é usada para gerar o AndroidManifest.xml no momento do build.
//
// EAS Build (nuvem): configure o mesmo nome de variável como EAS secret,
// para que fique disponível no ambiente de build remoto sem precisar
// comitar nada. Veja o README para o passo a passo completo.
require('dotenv').config({ quiet: true });

module.exports = {
  expo: {
    name: 'Delivroo Entregador',
    slug: 'delivroo-rider',
    version: '1.0.1',
    orientation: 'portrait',
    icon: './src/assets/delivroo-icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './src/assets/delivroo-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './src/assets/delivroo-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.jccintr.delivroorider',
      config: {
        googleMaps: {
          apiKey: process.env.ANDROID_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      favicon: './src/assets/favicon.png',
    },
    plugins: ['expo-font'],
    extra: {
      eas: {
        projectId: '9129f113-aa30-4415-8840-5f9b183f6c45',
      },
    },
  },
};