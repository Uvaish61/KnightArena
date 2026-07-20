import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Filter as FilterIcon, History, Swords, Trash2 } from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Surface } from '../components/Surface';
import { deleteMatch, getAllMatches, MatchRecord } from '../db/matchHistory';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, radii, shadows, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GameHistory'>;

type Filter = 'all' | 'win' | 'loss' | 'draw';

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }

  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

function formatRelativeTime(playedAt: string) {
  const deltaMs = Date.now() - new Date(playedAt).getTime();
  const minutes = Math.floor(deltaMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function getOutcome(match: MatchRecord, myColor: 'w' | 'b') {
  if (match.winner === 'draw') {
    return 'draw';
  }

  return match.winner === myColor ? 'win' : 'loss';
}

function MatchRow({
  match,
  myColor,
  onDelete,
}: {
  match: MatchRecord;
  myColor: 'w' | 'b';
  onDelete: (id: number) => void;
}) {
  const outcome = getOutcome(match, myColor);
  const isWin = outcome === 'win';
  const modeLabel =
    match.mode === 'ai'
      ? `vs AI${match.aiDifficulty ? ` · ${match.aiDifficulty}` : ''}`
      : match.mode === 'pvp'
      ? 'PvP'
      : null;

  return (
    <Swipeable
      renderRightActions={() => (
        <Pressable style={styles.deleteAction} onPress={() => onDelete(match.id)}>
          <Trash2 size={18} color={colors.textPrimary} />
          <Text style={styles.deleteLabel}>Delete</Text>
        </Pressable>
      )}
    >
      <View style={[styles.matchRow, isWin ? styles.matchRowWin : styles.matchRowNeutral]}>
        <View style={[styles.matchIcon, isWin ? styles.matchIconWin : styles.matchIconNeutral]}>
          <Swords size={18} color={isWin ? colors.accent : colors.textSecondary} />
        </View>

        <View style={styles.matchBody}>
          <Text style={styles.matchTitle} numberOfLines={1}>
            {match.player1} vs {match.player2}
          </Text>
          <Text style={styles.matchMeta}>
            {modeLabel ? `${modeLabel} · ` : ''}
            {formatRelativeTime(match.playedAt)} · {formatDuration(match.durationMs)} · {match.moveCount} moves
          </Text>
        </View>

        <View style={[styles.badge, outcome === 'win' ? styles.badgeWin : outcome === 'draw' ? styles.badgeDraw : styles.badgeLoss]}>
          <Text style={[styles.badgeText, outcome === 'win' ? styles.badgeTextWin : styles.badgeTextMuted]}>
            {outcome === 'win' ? 'WIN' : outcome === 'draw' ? 'DRAW' : 'LOSS'}
          </Text>
        </View>
      </View>
    </Swipeable>
  );
}

export function GameHistoryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  const refreshMatches = useCallback(async () => {
    const nextMatches = await getAllMatches();
    setMatches(nextMatches);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshMatches();
    }, [refreshMatches]),
  );

  const visibleMatches = useMemo(
    () =>
      matches.filter((match) => {
        if (filter === 'all') {
          return true;
        }

        return getOutcome(match, 'w') === filter;
      }),
    [filter, matches],
  );

  const summary = useMemo(
    () => ({
      wins: matches.filter((match) => match.winner === 'w').length,
      draws: matches.filter((match) => match.winner === 'draw').length,
      losses: matches.filter((match) => match.winner === 'b').length,
    }),
    [matches],
  );

  const handleDelete = useCallback(async (id: number) => {
    const nextMatches = await deleteMatch(id);
    setMatches(nextMatches);
  }, []);

  const filterItems: Array<{ key: Filter; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'win', label: 'Wins' },
    { key: 'loss', label: 'Losses' },
    { key: 'draw', label: 'Draws' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.md }]}>
      <View style={styles.headerRow}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <ArrowLeft size={18} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.sectionLabel}>MATCH ARCHIVE</Text>
          <Text style={styles.title}>Game History</Text>
        </View>
        <View style={styles.headerIcon}>
          <History size={18} color={colors.accent} />
        </View>
      </View>

      <View style={styles.accentLine} />

      <Surface style={styles.filtersCard}>
        <View style={styles.filtersHeader}>
          <FilterIcon size={16} color={colors.textSecondary} />
          <Text style={styles.filtersLabel}>Filter results</Text>
        </View>
        <View style={styles.filterRow}>
          {filterItems.map((item) => {
            const active = filter === item.key;
            return (
              <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[styles.filterChip, active ? styles.filterChipActive : styles.filterChipInactive]}>
                <Text style={[styles.filterChipLabel, active ? styles.filterChipLabelActive : styles.filterChipLabelInactive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Surface>

      {visibleMatches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyGlyph}>♟</Text>
          <Text style={styles.emptyText}>No matches yet. Play your first game!</Text>
        </View>
      ) : (
        <FlatList
          data={visibleMatches}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <MatchRow match={item} myColor="w" onDelete={handleDelete} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{summary.wins}</Text>
          <Text style={styles.summaryLabel}>W</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{summary.draws}</Text>
          <Text style={styles.summaryLabel}>D</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{summary.losses}</Text>
          <Text style={styles.summaryLabel}>L</Text>
        </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  headerTitleWrap: {
    flex: 1,
  },
  sectionLabel: {
    color: colors.textLabel,
    fontSize: 9,
    letterSpacing: 1.4,
    fontFamily: fonts.bodyBold,
  },
  title: {
    marginTop: 4,
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 28,
  },
  accentLine: {
    height: 1,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.accentBorder,
  },
  filtersCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filtersLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accentBorder,
  },
  filterChipInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
  },
  filterChipLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipLabelActive: {
    color: colors.textPrimary,
  },
  filterChipLabelInactive: {
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  matchRowWin: {
    backgroundColor: 'rgba(232,64,64,0.10)',
    borderColor: colors.accentBorder,
  },
  matchRowNeutral: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
  },
  matchIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  matchIconWin: {
    backgroundColor: colors.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentBorder,
  },
  matchIconNeutral: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  matchBody: {
    flex: 1,
  },
  matchTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  matchMeta: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 11,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeWin: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accentBorder,
  },
  badgeDraw: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
  },
  badgeLoss: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  badgeTextWin: {
    color: colors.accent,
  },
  badgeTextMuted: {
    color: colors.textMuted,
  },
  deleteAction: {
    width: 88,
    marginLeft: 10,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
  },
  deleteLabel: {
    marginTop: 4,
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.lg,
  },
  emptyGlyph: {
    fontSize: 48,
    opacity: 0.15,
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 13,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadows.card,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  summaryLabel: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.surfaceBorder,
  },
});