import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Clock3, FlipHorizontal, Lightbulb, RotateCcw, Swords, Volume2, VolumeX } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Surface } from '../components/Surface';
import { useSettingsStore } from '../store/settingsStore';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, radii, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

function ToggleRow({
  icon,
  label,
  description,
  value,
  onValueChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <Pressable style={styles.settingRow} onPress={() => onValueChange(!value)}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingCopy}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.surfaceBorder, true: colors.accentMuted }} thumbColor={value ? colors.accent : '#d0d0d0'} />
    </Pressable>
  );
}

function PillGroup<T extends string | number | null>({
  label,
  icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.settingCard}>
      <View style={styles.settingRowTop}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={styles.settingCopy}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingDescription}>Choose the default value used when starting a game.</Text>
        </View>
      </View>
      <View style={styles.pillRow}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable key={String(option.value)} onPress={() => onChange(option.value)} style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}>
              <Text style={[styles.pillLabel, active ? styles.pillLabelActive : styles.pillLabelInactive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    moveSuggestions,
    soundEffects,
    autoFlipBoard,
    defaultTimer,
    aiDifficulty,
    setMoveSuggestions,
    setSoundEffects,
    setAutoFlipBoard,
    setDefaultTimer,
    setAiDifficulty,
    resetSettings,
  } = useSettingsStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.md }]}>
      <View style={styles.headerRow}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <ArrowLeft size={18} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <Text style={styles.title}>Settings</Text>
        </View>
        <Pressable style={styles.headerIcon} onPress={resetSettings}>
          <RotateCcw size={18} color={colors.accent} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.sectionCard}>
          <ToggleRow
            icon={<Lightbulb size={18} color={colors.accent} />}
            label="Move Suggestions"
            description="Highlight helpful moves during play."
            value={moveSuggestions}
            onValueChange={setMoveSuggestions}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon={soundEffects ? <Volume2 size={18} color={colors.accent} /> : <VolumeX size={18} color={colors.accent} />}
            label="Sound Effects"
            description="Play tap and move feedback sounds."
            value={soundEffects}
            onValueChange={setSoundEffects}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon={<FlipHorizontal size={18} color={colors.accent} />}
            label="Auto Flip Board"
            description="Flip the board automatically after each move."
            value={autoFlipBoard}
            onValueChange={setAutoFlipBoard}
          />
        </Surface>

        <PillGroup
          label="Default Timer"
          icon={<Clock3 size={18} color={colors.accent} />}
          value={defaultTimer}
          onChange={setDefaultTimer}
          options={[
            { label: 'Off', value: null },
            { label: '3m', value: 3 },
            { label: '5m', value: 5 },
            { label: '10m', value: 10 },
          ]}
        />

        <PillGroup
          label="AI Difficulty"
          icon={<Swords size={18} color={colors.accent} />}
          value={aiDifficulty}
          onChange={setAiDifficulty}
          options={[
            { label: 'Easy', value: 'easy' },
            { label: 'Medium', value: 'medium' },
            { label: 'Hard', value: 'hard' },
          ]}
        />

        <Pressable style={styles.resetButton} onPress={resetSettings}>
          <RotateCcw size={18} color={colors.textPrimary} />
          <Text style={styles.resetLabel}>Reset to Defaults</Text>
        </Pressable>
      </ScrollView>
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
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: StyleSheet.hairlineWidth,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  settingRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentBorder,
  },
  settingCopy: {
    flex: 1,
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  settingDescription: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 10,
  },
  settingCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accentBorder,
  },
  pillInactive: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.surfaceBorder,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  pillLabelActive: {
    color: colors.textPrimary,
  },
  pillLabelInactive: {
    color: colors.textSecondary,
  },
  resetButton: {
    minHeight: 54,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentMuted,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.xs,
  },
  resetLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});