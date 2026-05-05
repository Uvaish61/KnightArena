import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '../components/PrimaryButton';
import { Surface } from '../components/Surface';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GameSetup'>;

export function GameSetupScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Surface style={styles.card}>
        <Text style={styles.title}>Game Setup</Text>
        <Text style={styles.copy}>
          This screen is the next implementation step. We will add player names, game mode, timers, AI difficulty, and theme selection here.
        </Text>

        <View style={styles.list}>
          <Text style={styles.item}>Player vs Player</Text>
          <Text style={styles.item}>Player vs AI</Text>
          <Text style={styles.item}>Timer presets and custom time</Text>
          <Text style={styles.item}>Move suggestions and theme selection</Text>
        </View>

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
  list: {
    marginTop: spacing.lg,
    gap: 10,
  },
  item: {
    color: colors.text,
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.md,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  button: {
    marginTop: spacing.xl,
  },
});
