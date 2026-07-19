export const colors = {
  // Base surfaces retuned to the premium red/black system (were legacy teal).
  // Kept under the same names so existing screens/components align automatically.
  background: '#0a0808',
  backgroundSoft: '#140f0f',
  surface: 'rgba(255,255,255,0.04)',
  surfaceElevated: 'rgba(255,255,255,0.08)',
  surfacePressed: 'rgba(255,255,255,0.12)',
  border: 'rgba(255, 255, 255, 0.08)',
  text: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSoft: 'rgba(255, 255, 255, 0.4)',
  primary: '#D8B45A',
  primaryDark: '#A8822A',
  accent: '#e84040',
  success: '#4DD08A',
  danger: '#F56C6C',
  warning: '#E6B85C',

  // Redesign tokens (premium red/black chess theme) — used by Splash and the in-game flow
  bg: '#0a0808',
  bgHero: '#1a0808',
  modalBg: '#140f0f',
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
  full: 999,
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
