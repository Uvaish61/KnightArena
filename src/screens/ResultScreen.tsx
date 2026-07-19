import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Handshake, Trophy } from 'lucide-react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { Surface } from '../components/Surface';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export function ResultScreen({ navigation, route }: Props) {
  const { winner, player1, player2, moveCount, pgn } = route.params;

  const isDraw = winner === 'draw';
  const winnerName = winner === 'w' ? player1 : winner === 'b' ? player2 : null;

  const title = useMemo(() => {
    if (isDraw) return 'Draw';
    if (winnerName) return `${winnerName} Wins!`;
    return 'Game Over';
  }, [isDraw, winnerName]);

  const subtitle = useMemo(() => {
    if (isDraw) return 'The game ended in a draw.';
    if (winnerName) return `${winnerName} won the match.`;
    return 'The match has ended.';
  }, [isDraw, winnerName]);

  return (
    <View style={styles.container}>
      <Surface style={styles.card}>
        <View style={styles.iconWrap}>
          {isDraw ? (
            <Handshake size={40} color={colors.primary} />
          ) : (
            <Trophy size={40} color={colors.primary} />
          )}
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.copy}>{subtitle}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{moveCount}</Text>
            <Text style={styles.statLabel}>Moves</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue} numberOfLines={1}>{player1}</Text>
            <Text style={styles.statLabel}>White</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue} numberOfLines={1}>{player2}</Text>
            <Text style={styles.statLabel}>Black</Text>
          </View>
        </View>

        <Text style={styles.pgnLabel}>Move record</Text>
        <ScrollView style={styles.pgnBox} nestedScrollEnabled>
          <Text style={styles.pgnText}>{pgn || 'No moves recorded.'}</Text>
        </ScrollView>

        <PrimaryButton label="Back to Home" variant="secondary" onPress={() => navigation.popToTop()} style={styles.button} />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    paddingVertical: spacing.xl,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(216, 180, 90, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  copy: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 4,
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '600',
  },
  pgnLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  pgnBox: {
    maxHeight: 120,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    padding: 12,
  },
  pgnText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.xl,
  },
});
