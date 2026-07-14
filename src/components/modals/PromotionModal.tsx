import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSharedValue, withSpring, withTiming, useAnimatedStyle } from 'react-native-reanimated';

import { colors, fonts, radii, shadows, spacing } from '../../theme/theme';

export interface PromotionModalProps {
  visible: boolean;
  color: 'w' | 'b';
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
}

const PIECES = [
  { key: 'q', white: '♕', black: '♛', label: 'Queen', sub: 'Most powerful', recommended: true },
  { key: 'r', white: '♖', black: '♜', label: 'Rook', sub: 'Strong & direct', recommended: false },
  { key: 'b', white: '♗', black: '♝', label: 'Bishop', sub: 'Diagonal control', recommended: false },
  { key: 'n', white: '♘', black: '♞', label: 'Knight', sub: 'Tricky L-shape', recommended: false },
] as const;

export function PromotionModal({ visible, color, onSelect, onCancel }: PromotionModalProps) {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 14, stiffness: 160 });
      opacity.value = withTiming(1, { duration: 220 });
    }
  }, [opacity, scale, visible]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.centerWrap}>
          <View style={styles.cardOuter}>
            <View style={styles.cardInner}>
              <Text style={styles.kicker}>PAWN REACHES THE END</Text>
              <Text style={styles.title}>Choose a piece</Text>
              <Text style={styles.subtitle}>Your pawn promoted to rank {color === 'w' ? '8' : '1'}</Text>

              <View style={styles.grid}>
                {PIECES.map((piece) => (
                  <Pressable key={piece.key} style={({ pressed }) => [styles.pieceCard, piece.recommended ? styles.pieceCardRecommended : styles.pieceCardNormal, pressed && styles.pressed]} onPress={() => onSelect(piece.key)}>
                    {piece.recommended ? <Text style={styles.bestBadge}>BEST</Text> : null}
                    <Text style={styles.symbol}>{color === 'w' ? piece.white : piece.black}</Text>
                    <Text style={styles.pieceLabel}>{piece.label}</Text>
                    <Text style={styles.pieceSub}>{piece.sub}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={onCancel} style={styles.cancelWrap}>
                <Text style={styles.cancelText}>Cancel move</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,4,4,0.82)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOuter: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: 'rgba(232,64,64,0.2)',
    ...shadows.card,
  },
  cardInner: {
    padding: 24,
    backgroundColor: colors.modalBg,
    borderRadius: 24,
  },
  kicker: {
    color: 'rgba(232,64,64,0.7)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    marginTop: 4,
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 24,
  },
  subtitle: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 11,
  },
  grid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pieceCard: {
    width: '48%',
    minHeight: 146,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    position: 'relative',
  },
  pieceCardRecommended: {
    backgroundColor: colors.accentMuted,
    borderColor: 'rgba(232,64,64,0.5)',
    borderWidth: 2,
  },
  pieceCardNormal: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  bestBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.accent,
    color: colors.textPrimary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  symbol: {
    marginTop: 14,
    fontSize: 44,
    color: '#f8f0e8',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  pieceLabel: {
    marginTop: 10,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  pieceSub: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 10,
  },
  cancelWrap: {
    marginTop: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});