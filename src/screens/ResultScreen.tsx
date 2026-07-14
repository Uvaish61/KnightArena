import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Clock3, History, RotateCcw, Swords } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { saveMatch } from '../db/matchHistory';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, radii, shadows, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

const outcomeConfig = {
  w: { label: 'Victory!', sub: 'White wins by checkmate', emoji: '♙' },
  b: { label: 'Victory!', sub: 'Black wins by checkmate', emoji: '♟' },
  draw: { label: 'Draw', sub: 'Game ended in a draw', emoji: '⚖️' },
} as const;

function formatDuration(durationMs: number) {
  const safeMs = Math.max(0, durationMs);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }

  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function ResultScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const savedRef = useRef(false);
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const knightY = useRef(new Animated.Value(-30)).current;
  const knightOpacity = useRef(new Animated.Value(0)).current;
  const { winner, player1, player2, moveCount, durationMs, pgn, captureCount } = route.params;
  const normalizedWinner = winner ?? 'draw';
  const outcome = outcomeConfig[normalizedWinner];

  useEffect(() => {
    if (savedRef.current) {
      return;
    }

    savedRef.current = true;
    void saveMatch({
      winner: normalizedWinner,
      player1,
      player2,
      moveCount,
      durationMs,
      pgn,
      captureCount,
      playedAt: new Date().toISOString(),
    });
  }, [captureCount, durationMs, moveCount, normalizedWinner, pgn, player1, player2]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(ringScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
      Animated.spring(knightY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(knightOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [knightOpacity, knightY, ringScale]);

  const playerCards = useMemo(
    () => [
      { key: 'white', name: player1, piece: 'w', win: normalizedWinner === 'w' },
      { key: 'black', name: player2, piece: 'b', win: normalizedWinner === 'b' },
    ],
    [normalizedWinner, player1, player2],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.md }]}>
      <Pressable style={styles.backButton} onPress={() => navigation.popToTop()}>
        <ArrowLeft size={18} color={colors.textPrimary} />
      </Pressable>

      <View style={styles.hero}>
        <Animated.View style={[styles.ringOuter, { transform: [{ scale: ringScale }] }]} />
        <Animated.View style={[styles.ringMid, { transform: [{ scale: ringScale }] }]} />
        <Animated.View style={[styles.ringInner, { transform: [{ scale: ringScale }] }]} />
        <Animated.Text style={[styles.knight, { opacity: knightOpacity, transform: [{ translateY: knightY }] }]}>♞</Animated.Text>
      </View>

      <View style={styles.centerBlock}>
        <Text style={styles.title}>{outcome.label}</Text>
        <Text style={styles.subtitle}>{outcome.sub}</Text>
      </View>

      <View style={styles.playerRow}>
        {playerCards.map((card) => (
          <View key={card.key} style={[styles.playerCard, card.win ? styles.playerCardWinner : styles.playerCardNeutral]}>
            <Text style={[styles.playerBadge, card.win ? styles.playerBadgeWinner : styles.playerBadgeMuted]}>
              {card.win ? 'WINNER' : normalizedWinner === 'draw' ? 'DRAW' : 'DEFEATED'}
            </Text>
            <Text style={styles.playerPiece}>{card.piece === 'w' ? '♙' : '♟'}</Text>
            <Text style={styles.playerName} numberOfLines={1}>
              {card.name}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.statsRow}>
        <StatCard value={moveCount} label="MOVES" icon={<Swords size={16} color={colors.accent} />} />
        <StatCard value={formatDuration(durationMs)} label="TIME" icon={<Clock3 size={16} color={colors.accent} />} />
        <StatCard value={captureCount} label="CAPTURES" icon={<History size={16} color={colors.accent} />} />
      </View>

      <View style={styles.flexSpacer} />

      <PrimaryButton
        label="Play Again"
        onPress={() =>
          navigation.replace('Game', {
            mode: 'pvp',
            player1: 'White',
            player2: 'Black',
            timer: null,
          })
        }
        style={styles.primaryButton}
      />

      <View style={styles.secondaryRow}>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('GameHistory')}>
          <History size={18} color={colors.textPrimary} />
          <Text style={styles.secondaryLabel}>View History</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.popToTop()}>
          <RotateCcw size={18} color={colors.textPrimary} />
          <Text style={styles.secondaryLabel}>Start</Text>
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
  backButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentBorder,
  },
  hero: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  ringOuter: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(232,64,64,0.07)',
  },
  ringMid: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(232,64,64,0.11)',
  },
  ringInner: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(232,64,64,0.18)',
  },
  knight: {
    fontSize: 44,
    color: colors.accent,
    textShadowColor: colors.accentGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  centerBlock: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 36,
  },
  subtitle: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  playerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  playerCard: {
    flex: 1,
    minHeight: 112,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  playerCardWinner: {
    backgroundColor: 'rgba(232,64,64,0.10)',
    borderColor: colors.accentBorder,
  },
  playerCardNeutral: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
  },
  playerBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 9,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  playerBadgeWinner: {
    color: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  playerBadgeMuted: {
    color: colors.textMuted,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  playerPiece: {
    fontSize: 30,
    color: colors.textPrimary,
    marginTop: 8,
  },
  playerName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    ...shadows.card,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentMuted,
    marginBottom: 8,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1,
  },
  flexSpacer: {
    flex: 1,
    minHeight: 24,
  },
  primaryButton: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});