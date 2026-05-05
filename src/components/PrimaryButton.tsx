import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, radii, shadows, spacing } from '../theme/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, style, variant = 'primary', disabled }: PrimaryButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.buttonBase, variantStyles[variant], pressed && !disabled && styles.pressed, disabled && styles.disabled, style]}>
      <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>{label}</Text>
      <View style={[styles.glow, variant === 'secondary' && styles.secondaryGlow]} />
    </Pressable>
  );
}

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceElevated,
  },
});

const styles = StyleSheet.create({
  buttonBase: {
    minHeight: 56,
    borderRadius: radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
    ...shadows.button,
  },
  label: {
    color: '#11131A',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  secondaryLabel: {
    color: colors.text,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
  glow: {
    position: 'absolute',
    right: -16,
    top: -16,
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  secondaryGlow: {
    backgroundColor: 'rgba(216, 180, 90, 0.08)',
  },
});
