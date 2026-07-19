import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Swords, User, Users } from 'lucide-react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { Surface } from '../components/Surface';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GameSetup'>;

type Mode = 'pvp' | 'ai';
type Difficulty = 'easy' | 'medium' | 'hard';

const TIMER_OPTIONS: Array<{ label: string; minutes: number | null }> = [
  { label: 'No Timer', minutes: null },
  { label: '3 min', minutes: 3 },
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '15 min', minutes: 15 },
];

const DIFFICULTY_OPTIONS: Array<{ label: string; value: Difficulty }> = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
];

export function GameSetupScreen({ navigation }: Props) {
  const [mode, setMode] = useState<Mode>('pvp');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [timerMinutes, setTimerMinutes] = useState<number | null>(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const resolvedPlayer1 = useMemo(() => player1.trim() || 'Player 1', [player1]);
  const resolvedPlayer2 = useMemo(() => {
    if (mode === 'ai') return `AI (${difficulty})`;
    return player2.trim() || 'Player 2';
  }, [mode, player2, difficulty]);

  const handleStart = () => {
    navigation.navigate('Game', {
      mode,
      player1: resolvedPlayer1,
      player2: resolvedPlayer2,
      timer: timerMinutes,
      aiDifficulty: mode === 'ai' ? difficulty : undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Surface style={styles.card}>
          <Text style={styles.title}>Game Setup</Text>
          <Text style={styles.copy}>Choose how you want to play, then start the match.</Text>

          <Text style={styles.sectionLabel}>Mode</Text>
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeOption, mode === 'pvp' && styles.modeOptionActive]}
              onPress={() => setMode('pvp')}
            >
              <Users size={18} color={mode === 'pvp' ? colors.background : colors.textMuted} />
              <Text style={[styles.modeOptionLabel, mode === 'pvp' && styles.modeOptionLabelActive]}>
                Player vs Player
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeOption, mode === 'ai' && styles.modeOptionActive]}
              onPress={() => setMode('ai')}
            >
              <Swords size={18} color={mode === 'ai' ? colors.background : colors.textMuted} />
              <Text style={[styles.modeOptionLabel, mode === 'ai' && styles.modeOptionLabelActive]}>
                Player vs AI
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Players</Text>
          <View style={styles.inputRow}>
            <User size={16} color={colors.textSoft} />
            <TextInput
              style={styles.input}
              value={player1}
              onChangeText={setPlayer1}
              placeholder="Player 1"
              placeholderTextColor={colors.textSoft}
              maxLength={20}
            />
          </View>
          {mode === 'pvp' && (
            <View style={styles.inputRow}>
              <User size={16} color={colors.textSoft} />
              <TextInput
                style={styles.input}
                value={player2}
                onChangeText={setPlayer2}
                placeholder="Player 2"
                placeholderTextColor={colors.textSoft}
                maxLength={20}
              />
            </View>
          )}

          {mode === 'ai' && (
            <>
              <Text style={styles.sectionLabel}>AI Difficulty</Text>
              <View style={styles.chipRow}>
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[styles.chip, difficulty === opt.value && styles.chipActive]}
                    onPress={() => setDifficulty(opt.value)}
                  >
                    <Text style={[styles.chipLabel, difficulty === opt.value && styles.chipLabelActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <Text style={styles.sectionLabel}>Timer</Text>
          <View style={styles.chipRow}>
            {TIMER_OPTIONS.map((opt) => (
              <Pressable
                key={opt.label}
                style={[styles.chip, timerMinutes === opt.minutes && styles.chipActive]}
                onPress={() => setTimerMinutes(opt.minutes)}
              >
                <Text style={[styles.chipLabel, timerMinutes === opt.minutes && styles.chipLabelActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <PrimaryButton label="Start Game" onPress={handleStart} style={styles.button} />
          <PrimaryButton
            label="Back to Home"
            variant="secondary"
            onPress={() => navigation.popToTop()}
            style={styles.secondaryButton}
          />
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    paddingVertical: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  copy: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  modeOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeOptionLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  modeOptionLabelActive: {
    color: colors.background,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  chipLabelActive: {
    color: colors.background,
  },
  button: {
    marginTop: spacing.xl,
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
});
