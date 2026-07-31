export const colors = {
  // marca
  orange: '#FF6B35',
  orangeDark: '#E0551F',
  cream: '#FAF7F1',
 
  // texto / base
  ink: '#26211C',
  inkSoft: '#6B655D',
  line: '#E8E2D6',
  white: '#FFFFFF',
 
  // estados
  green: '#2E9E5B',
  greenBg: '#E7F5EC',
  red: '#E24B4A',
  redBg: '#FCEBEB',
  amber: '#BA7517',
  amberBg: '#FAEEDA',
};

export const fonts = {
  // Baloo 2 — títulos e destaques (family names batem com os pacotes @expo-google-fonts)
  headingMedium: 'Baloo2_500Medium',
  headingBold: 'Baloo2_700Bold',
  headingExtraBold: 'Baloo2_800ExtraBold',
 
  // Inter — corpo de texto e UI
  bodyRegular: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
 
  // IBM Plex Mono — códigos, valores monoespaçados (ex: código de ativação)
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemiBold: 'IBMPlexMono_600SemiBold',
};
 
export const fontSizes = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  title: 20,
  heading: 22,
  display: 26,
};
 
export const radius = {
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  pill: 999,
};
 
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
 
// Estilos de texto prontos, para usar direto em StyleSheet.create({ ...text })
export const textStyles = {
  h1: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.heading,
    color: colors.ink,
  },
  h2: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.xl,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.ink,
  },
  bodySecondary: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  button: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.white,
  },
  mono: {
    fontFamily: fonts.monoMedium,
    fontSize: fontSizes.lg,
    color: colors.orangeDark,
  },
};
 
const theme = { colors, fonts, fontSizes, radius, spacing, textStyles };
 
export default theme;

