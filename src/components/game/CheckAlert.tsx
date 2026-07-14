import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

import { colors, fonts } from '../../theme/theme';

interface CheckAlertProps {
  visible: boolean;
  sub?: string;
  onDismiss: () => void;
}

export function CheckAlert({ visible, sub = 'Your king is under attack', onDismiss }: CheckAlertProps) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, damping: 14, stiffness: 150, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(iconScale, { toValue: 1.15, duration: 300, useNativeDriver: true }),
        Animated.timing(iconScale, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      { iterations: 3 },
    ).start();

    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => onDismiss());
    }, 2500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [iconScale, onDismiss, opacity, translateY, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.wrap, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.card}>
        <Animated.View style={[styles.iconBubble, { transform: [{ scale: iconScale }] }]}>
          <AlertTriangle size={20} color="#fff" />
        </Animated.View>
        <View style={styles.copy}>
          <Text style={styles.title}>Check!</Text>
          <Text style={styles.sub}>{sub}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 160,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(255,100,100,0.2)',
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.3,
  },
  sub: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
});