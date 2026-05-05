import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { PrimaryButton } from '../components/PrimaryButton';
import { Surface } from '../components/Surface';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />

      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>KnightArena</Text>
          <Text style={styles.headerSubtitle}>A premium offline chess experience.</Text>
        </View>

        <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.iconLabel}>Settings</Text>
        </Pressable>
      </View>

      <Animated.View entering={FadeInUp.duration(650)} style={styles.heroCardWrap}>
        <Surface style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Welcome back</Text>
          <Text style={styles.heroTitle}>Ready to open the board?</Text>
          <Text style={styles.heroCopy}>
            Start a local match now and continue building out AI, timers, and match history in the next screens.
          </Text>

          <PrimaryButton label="Start Game" onPress={() => navigation.navigate('GameSetup')} style={styles.primaryButton} />

          <View style={styles.quickStatsRow}>
            <View style={styles.statChip}><Text style={styles.statChipText}>Offline-first</Text></View>
            <View style={styles.statChip}><Text style={styles.statChipText}>Dark mode ready</Text></View>
            <View style={styles.statChip}><Text style={styles.statChipText}>AI pipeline ready</Text></View>
          </View>
        </Surface>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(650)}>
        <Surface style={styles.resultCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Last Match Result</Text>
            <Text style={styles.sectionBadge}>No match yet</Text>
          </View>

          <Text style={styles.resultTitle}>Your first game will appear here.</Text>
          <Text style={styles.resultCopy}>
            We will store match history, turns, and outcomes locally so the app stays fast even when offline.
          </Text>
        </Surface>
      </Animated.View>

      <View style={styles.footerRow}>
        <Pressable style={styles.footerButton} onPress={() => navigation.navigate('GameHistory')}>
          <Text style={styles.footerButtonLabel}>Game History</Text>
        </Pressable>
        <Pressable style={styles.footerButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.footerButtonLabel}>Settings</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  backgroundGlowTop: {
    position: 'absolute',
    top: -110,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(92, 225, 230, 0.07)',
  },
  backgroundGlowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(216, 180, 90, 0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  brand: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  headerSubtitle: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
  },
  iconButton: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  heroCardWrap: {
    marginBottom: spacing.lg,
  },
  heroCard: {
    paddingVertical: spacing.xl,
  },
  heroEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
  },
  heroCopy: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: spacing.lg,
  },
  quickStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.lg,
  },
  statChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.pill,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statChipText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  resultCard: {
    marginBottom: spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionBadge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(216, 180, 90, 0.12)',
  },
  resultTitle: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  resultCopy: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerButtonLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
});
