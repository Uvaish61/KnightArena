import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '../components/PrimaryButton';
import { Surface } from '../components/Surface';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export function GameScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Surface style={styles.card}>
        <Text style={styles.title}>Game Screen</Text>
        <Text style={styles.copy}>
          Next step: board layout scaffold, then piece rendering, move highlighting, and turn UI.
        </Text>
        <View style={styles.box}>
          <Text style={styles.boxText}>Board placeholder</Text>
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
  box: {
    marginTop: spacing.lg,
    height: 220,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    marginTop: spacing.xl,
  },
});