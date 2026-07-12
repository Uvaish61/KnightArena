export const colors = {
  background: '#07111F',
  backgroundSoft: '#0B1728',
  surface: '#101B2F',
  surfaceElevated: '#162238',
  surfacePressed: '#1D2A42',
  border: 'rgba(255, 255, 255, 0.08)',
  text: '#F4F7FB',
  textMuted: 'rgba(244, 247, 251, 0.72)',
  textSoft: 'rgba(244, 247, 251, 0.52)',
  primary: '#D8B45A',
  primaryDark: '#A8822A',
  accent: '#e84040',
  success: '#4DD08A',
  danger: '#F56C6C',
  warning: '#E6B85C',

  // Redesign tokens (premium red/black chess theme) — used by Splash/Home/GameSetup onward
  bg: '#0a0808',
  bgHero: '#1a0808',
  surfaceBorder: 'rgba(255,255,255,0.07)',
  accentGlow: 'rgba(232,64,64,0.35)',
  accentMuted: 'rgba(232,64,64,0.15)',
  accentBorder: 'rgba(232,64,64,0.25)',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.5)',
  textTertiary: 'rgba(255,255,255,0.28)',
  textLabel: 'rgba(232,64,64,0.9)',

  // Glass surface for HUD/action-bar chrome (translucent, over `bg`) — used from GameScreen onward
  surfaceGlass: 'rgba(255,255,255,0.04)',

  // Chess board squares/highlights — GameScreen
  boardLight: '#f0d5a8',
  boardDark: '#5c1414',
  boardLastMoveLight: '#dace72',
  boardLastMoveDark: '#8a7a1e',
  boardSelectedLight: '#eede58',
  boardSelectedDark: '#a89a18',
};

export const fonts = {
  heading: 'DMSerifDisplay-Regular',
  body: 'SpaceGrotesk-Regular',
  bodyMedium: 'SpaceGrotesk-Medium',
  bodySemiBold: 'SpaceGrotesk-SemiBold',
  bodyBold: 'SpaceGrotesk-Bold',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radii = {
  sm: 14,
  md: 20,
  lg: 28,
  xl: 36,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  button: {
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};
