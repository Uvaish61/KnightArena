import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Cpu } from 'lucide-react-native';

import { formatTime } from '../hooks/useChessTimer';
import { colors, fonts } from '../theme/theme';

type PlayerStripProps = {
  name: string;
  piece: 'w' | 'b';
  timeMs: number;
  isActive: boolean;
  isAI?: boolean;
  hasTimer: boolean;
};

export function PlayerStrip({ name, piece, timeMs, isActive, isAI, hasTimer }: PlayerStripProps) {
  const ringWidth = useRef(new Animated.Value(1.5)).current;
  const timerScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) {
      ringWidth.setValue(1.5);
      timerScale.setValue(1);
      return undefined;
    }

    const ringLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ringWidth, { toValue: 3, duration: 700, useNativeDriver: false }),
        Animated.timing(ringWidth, { toValue: 1.5, duration: 700, useNativeDriver: false }),
      ]),
    );
    const timerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(timerScale, { toValue: 1.022, duration: 500, useNativeDriver: true }),
        Animated.timing(timerScale, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );

    ringLoop.start();
    timerLoop.start();

    return () => {
      ringLoop.stop();
      timerLoop.stop();
    };
  }, [isActive, ringWidth, timerScale]);

  return (
    <View style={styles.row}>
      <Animated.View
        style={[
          styles.avatar,
          isActive ? styles.avatarActive : styles.avatarInactive,
          { borderWidth: ringWidth },
        ]}
      >
        {isAI ? (
          <Cpu size={18} color={isActive ? colors.textPrimary : colors.textSecondary} />
        ) : (
          <Text style={styles.avatarGlyph}>{piece === 'w' ? '♙' : '♟'}</Text>
        )}
      </Animated.View>

      <Text style={[styles.name, isActive ? styles.nameActive : styles.nameInactive]} numberOfLines={1}>
        {name}
      </Text>

      {hasTimer && (
        <Animated.View
          style={[
            styles.timerPill,
            isActive ? styles.timerPillActive : styles.timerPillInactive,
            { transform: [{ scale: timerScale }] },
          ]}
        >
          <Text style={[styles.timerText, isActive ? styles.timerTextActive : styles.timerTextInactive]}>
            {formatTime(timeMs)}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 54,
    gap: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  avatarInactive: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatarGlyph: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  nameActive: {
    color: colors.textPrimary,
  },
  nameInactive: {
    color: colors.textSecondary,
  },
  timerPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 64,
    alignItems: 'center',
  },
  timerPillActive: {
    backgroundColor: colors.accent,
  },
  timerPillInactive: {
    backgroundColor: colors.surfaceGlass,
  },
  timerText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  timerTextActive: {
    color: colors.textPrimary,
  },
  timerTextInactive: {
    color: 'rgba(255,255,255,0.22)',
  },
});
