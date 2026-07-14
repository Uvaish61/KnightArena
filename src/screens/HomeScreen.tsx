import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Clock3, History, Settings as SettingsIcon, Swords } from 'lucide-react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { Surface } from '../components/Surface';
import { getAllMatches, MatchRecord } from '../db/matchHistory';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, radii, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [latestMatch, setLatestMatch] = useState<MatchRecord | null>(null);

  useEffect(() => {
    void getAllMatches().then((matches) => setLatestMatch(matches[0] ?? null));
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md }]}>
      <View style={styles.headerGlow} />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>KnightArena</Text>
          <Text style={styles.subtitle}>Claim the board.</Text>
        </View>
        <Pressable style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
          <SettingsIcon size={16} color={colors.textPrimary} />
          <Text style={styles.settingsLabel}>Settings</Text>
        </Pressable>
      </View>

      <Surface style={styles.heroCard}>
        <Text style={styles.eyebrow}>WELCOME BACK</Text>
        <Text style={styles.title}>Ready to open the board?</Text>
        <Text style={styles.copy}>Start a local match now and continue building out AI, timers, and match history in the next screens.</Text>

        <PrimaryButton label="Start Game" onPress={() => navigation.navigate('GameSetup')} style={styles.startButton} />

        <View style={styles.chipsRow}>
          <View style={styles.chip}><Swords size={12} color={colors.textMuted} /><Text style={styles.chipText}>PvP</Text></View>
          <View style={styles.chip}><Clock3 size={12} color={colors.textMuted} /><Text style={styles.chipText}>Offline-first</Text></View>
          <View style={styles.chip}><History size={12} color={colors.textMuted} /><Text style={styles.chipText}>AI ready</Text></View>
        </View>
      </Surface>

      <Surface style={styles.lastMatchCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Last Match Result</Text>
          <Text style={styles.badge}>{latestMatch ? latestMatch.playedAt.slice(0, 10) : 'No match yet'}</Text>
        </View>
        {latestMatch ? (
          <>
            <Text style={styles.resultTitle}>{latestMatch.player1} vs {latestMatch.player2}</Text>
            <Text style={styles.resultCopy}>{latestMatch.winner === 'draw' ? 'Draw' : latestMatch.winner === 'w' ? `${latestMatch.player1} won` : `${latestMatch.player2} won`} · {latestMatch.moveCount} moves</Text>
          </>
        ) : (
          <>
            <Text style={styles.resultTitle}>Your first game will appear here.</Text>
            <Text style={styles.resultCopy}>We will store match history, turns, and outcomes locally so the app stays fast even when offline.</Text>
          </>
        )}
      </Surface>

      <View style={styles.footerRow}>
        <Pressable style={styles.footerButton} onPress={() => navigation.navigate('GameHistory')}>
          <Text style={styles.footerButtonText}>Game History</Text>
          <ArrowRight size={16} color={colors.textMuted} />
        </Pressable>
        <Pressable style={styles.footerButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.footerButtonText}>Settings</Text>
          <ArrowRight size={16} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.md,
  },
  headerGlow: {
    position: 'absolute',
    top: -120,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(232,64,64,0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brand: {
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 30,
  },
  subtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 13,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  settingsLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  heroCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
  },
  eyebrow: {
    color: colors.textLabel,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  title: {
    marginTop: 8,
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 28,
  },
  copy: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  startButton: {
    marginTop: spacing.lg,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  lastMatchCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radii.xl,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  badge: {
    color: colors.textLabel,
    backgroundColor: colors.accentMuted,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '700',
  },
  resultTitle: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  resultCopy: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  footerButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  footerButtonText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
});