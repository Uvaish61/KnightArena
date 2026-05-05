import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { Easing, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../theme/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const progress = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 850,
      easing: Easing.out(Easing.cubic),
    });

    pulse.value = withDelay(
      150,
      withRepeat(
        withTiming(1, {
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );

    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigation, progress, pulse]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.1, 1]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [24, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.92, 1]) },
    ],
  }));

  const auraStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.18, 0.45]),
    transform: [
      { scale: interpolate(pulse.value, [0, 1], [1, 1.16]) },
    ],
    backgroundColor: interpolateColor(pulse.value, [0, 1], ['rgba(216, 180, 90, 0.16)', 'rgba(92, 225, 230, 0.16)']),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />
      <AnimatedView style={[styles.card, cardStyle]}>
        <Animated.View style={[styles.aura, auraStyle]} />
        <View style={styles.logoShell}>
          <Text style={styles.logoMark}>KA</Text>
        </View>
        <Text style={styles.title}>KnightArena</Text>
        <Text style={styles.subtitle}>Premium chess, tuned for fast offline play.</Text>
        <View style={styles.pillRow}>
          <View style={styles.pill}><Text style={styles.pillText}>Offline-first</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>AI ready</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>Timer aware</Text></View>
        </View>
        <View style={styles.loadingTrack}>
          <View style={styles.loadingFill} />
        </View>
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.xl,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  aura: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 280,
    top: -120,
  },
  logoShell: {
    width: 110,
    height: 110,
    borderRadius: 110,
    backgroundColor: colors.surfaceElevated,
    borderColor: 'rgba(216, 180, 90, 0.22)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  logoMark: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  loadingTrack: {
    marginTop: spacing.xl,
    width: '100%',
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  loadingFill: {
    width: '45%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  orbTop: {
    position: 'absolute',
    top: -90,
    right: -50,
    width: 190,
    height: 190,
    borderRadius: 190,
    backgroundColor: 'rgba(92, 225, 230, 0.08)',
  },
  orbBottom: {
    position: 'absolute',
    bottom: -70,
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(216, 180, 90, 0.09)',
  },
});
