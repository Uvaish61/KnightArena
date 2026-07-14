import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChessPattern } from '../components/ChessPattern';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Game', {
        mode: 'pvp',
        player1: 'White',
        player2: 'Black',
        timer: null,
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={[styles.patternWrap, { top: insets.top }]}>
        <ChessPattern size={160} color={colors.textPrimary} opacity={0.04} />
      </View>

      <View style={styles.glowWrap} pointerEvents="none">
        <View style={styles.glow} />
      </View>

      <View style={styles.center}>
        <Text style={styles.knight}>♞</Text>

        <View style={styles.ruleRow}>
          <View style={styles.ruleLine} />
          <Text style={styles.ruleLabel}>KNIGHT ARENA</Text>
          <View style={styles.ruleLine} />
        </View>

        <Text style={styles.heading}>{'Premium\nChess.'}</Text>
        <Text style={styles.subtitle}>Offline-first · AI-powered</Text>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotFade1]} />
          <View style={[styles.dot, styles.dotFade2]} />
        </View>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternWrap: {
    position: 'absolute',
    right: 0,
  },
  glowWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(232,64,64,0.18)',
  },
  center: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  knight: {
    fontSize: 96,
    color: colors.accent,
    textShadowColor: 'rgba(232,64,64,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 32,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  ruleLine: {
    width: 24,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(232,64,64,0.8)',
  },
  ruleLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 3,
    color: 'rgba(232,64,64,0.8)',
  },
  heading: {
    marginTop: 18,
    fontFamily: fonts.heading,
    fontSize: 38,
    lineHeight: 44,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textTertiary,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  dotFade1: {
    backgroundColor: 'rgba(232,64,64,0.4)',
  },
  dotFade2: {
    backgroundColor: 'rgba(232,64,64,0.2)',
  },
  homeIndicator: {
    width: 100,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});
