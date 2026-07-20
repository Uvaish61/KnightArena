import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Flag, Handshake, Lightbulb, MoreHorizontal, RotateCcw } from 'lucide-react-native';

import { ChessBoard } from '../components/ChessBoard';
import { PlayerStrip } from '../components/PlayerStrip';
import { PromotionModal } from '../components/modals/PromotionModal';
import { GameMenuSheet } from '../components/modals/GameMenuSheet';
import { CheckAlert } from '../components/game/CheckAlert';
import { pickAIMove } from '../ai/chessAI';
import { useChessTimer } from '../hooks/useChessTimer';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const PROMOTION_PIECES: Array<{ code: string; white: string; black: string; label: string }> = [
  { code: 'q', white: '♕', black: '♛', label: 'Queen' },
  { code: 'r', white: '♖', black: '♜', label: 'Rook' },
  { code: 'b', white: '♗', black: '♝', label: 'Bishop' },
  { code: 'n', white: '♘', black: '♞', label: 'Knight' },
];

export function GameScreen({ navigation, route }: Props) {
  const { mode, player1, player2, timer, aiDifficulty } = route.params;
  const insets = useSafeAreaInsets();
  const autoFlipBoard = useSettingsStore((s) => s.autoFlipBoard);
  const moveSuggestions = useSettingsStore((s) => s.moveSuggestions);

  const chess = useGameStore((s) => s.chess);
  const fen = useGameStore((s) => s.fen);
  const turn = useGameStore((s) => s.turn);
  const selectedSquare = useGameStore((s) => s.selectedSquare);
  const possibleMoves = useGameStore((s) => s.possibleMoves);
  const lastMove = useGameStore((s) => s.lastMove);
  const capturedByWhite = useGameStore((s) => s.capturedByWhite);
  const capturedByBlack = useGameStore((s) => s.capturedByBlack);
  const moveHistory = useGameStore((s) => s.moveHistory);
  const status = useGameStore((s) => s.status);
  const winner = useGameStore((s) => s.winner);
  const whiteTimeMs = useGameStore((s) => s.whiteTimeMs);
  const blackTimeMs = useGameStore((s) => s.blackTimeMs);

  const startGame = useGameStore((s) => s.startGame);
  const selectSquare = useGameStore((s) => s.selectSquare);
  const makeMove = useGameStore((s) => s.makeMove);
  const resignGame = useGameStore((s) => s.resignGame);
  const offerDraw = useGameStore((s) => s.offerDraw);
  const pauseGame = useGameStore((s) => s.pauseGame);
  const resumeGame = useGameStore((s) => s.resumeGame);

  const [promotion, setPromotion] = useState<{ from: string; to: string; color: 'w' | 'b' } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const matchStartedAt = useRef(Date.now());

  useChessTimer(!!timer && status === 'playing');

  useEffect(() => {
    startGame(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== 'ended') return;
    navigation.replace('Result', {
      winner,
      player1,
      player2,
      moveCount: moveHistory.length,
      pgn: chess.pgn(),
      durationMs: Date.now() - matchStartedAt.current,
      captureCount: capturedByWhite.length + capturedByBlack.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedByBlack.length, capturedByWhite.length, chess, moveHistory.length, navigation, player1, player2, status, winner]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background' || next === 'inactive') {
        pauseGame();
      } else if (next === 'active') {
        resumeGame();
      }
    });
    return () => sub.remove();
  }, [pauseGame, resumeGame]);

  const confirmLeave = useMemo(
    () => () => {
      if (status !== 'playing') {
        navigation.goBack();
        return true;
      }
      Alert.alert('Leave match?', 'Your current game progress will be lost.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() },
      ]);
      return true;
    },
    [status, navigation],
  );

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', confirmLeave);
    return () => sub.remove();
  }, [confirmLeave]);

  const handleSquarePress = (square: string) => {
    if (status !== 'playing') return;
    if (mode === 'ai' && turn === 'b') return;

    if (selectedSquare && possibleMoves.includes(square)) {
      const piece = chess.get(selectedSquare as any);
      const isPromotion = piece?.type === 'p' && (square[1] === '8' || square[1] === '1');
      if (isPromotion) {
        setPromotion({ from: selectedSquare, to: square, color: piece!.color });
        return;
      }
    }
    selectSquare(square);
  };

  const handlePromotionPick = (code: string) => {
    if (!promotion) return;
    makeMove(promotion.from, promotion.to, code);
    setPromotion(null);
  };

  useEffect(() => {
    setShowCheck(status === 'playing' && chess.inCheck());
  }, [chess, fen, status]);

  useEffect(() => {
    if (mode !== 'ai' || status !== 'playing' || turn !== 'b') return undefined;

    const timeout = setTimeout(() => {
      const move = pickAIMove(fen, aiDifficulty ?? 'medium');
      if (move) makeMove(move.from, move.to, move.promotion);
    }, 500);

    return () => clearTimeout(timeout);
  }, [mode, status, turn, fen, aiDifficulty, makeMove]);

  const handleResign = () => {
    Alert.alert('Resign?', 'Are you sure you want to resign this match?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Resign', style: 'destructive', onPress: () => resignGame(turn) },
    ]);
  };

  const handleUndo = () => {
    const undone = chess.undo();
    if (!undone) return;

    // In AI mode, also take back the human's move so it's the human's turn again;
    // otherwise the AI would immediately replay its move.
    if (mode === 'ai' && chess.turn() === 'b' && chess.history().length > 0) {
      chess.undo();
    }

    const verboseHistory = chess.history({ verbose: true }) as any[];
    const nextCapturedByWhite: string[] = [];
    const nextCapturedByBlack: string[] = [];
    verboseHistory.forEach((move) => {
      if (!move.captured) return;
      if (move.color === 'w') nextCapturedByWhite.push(move.captured);
      else nextCapturedByBlack.push(move.captured);
    });

    useGameStore.setState({
      fen: chess.fen(),
      turn: chess.turn(),
      selectedSquare: null,
      possibleMoves: [],
      lastMove: null,
      capturedByWhite: nextCapturedByWhite,
      capturedByBlack: nextCapturedByBlack,
      moveHistory: chess.history(),
    });
  };

  const quitToHome = () => {
    navigation.navigate('Home');
  };

  const movePairs = useMemo(() => {
    const pairs: Array<{ n: number; white?: string; black?: string }> = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      pairs.push({ n: i / 2 + 1, white: moveHistory[i], black: moveHistory[i + 1] });
    }
    return pairs;
  }, [moveHistory]);

  const { whiteAdvantage, blackAdvantage } = useMemo(() => {
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    const sum = (pieces: string[]) => pieces.reduce((total, p) => total + (values[p] ?? 0), 0);
    const diff = sum(capturedByWhite) - sum(capturedByBlack);
    return { whiteAdvantage: Math.max(0, diff), blackAdvantage: Math.max(0, -diff) };
  }, [capturedByWhite, capturedByBlack]);

  const flipped = mode === 'pvp' && autoFlipBoard && turn === 'b';

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.navIconButton} onPress={confirmLeave}>
          <ChevronLeft size={18} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>MATCH</Text>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>{mode === 'ai' ? `vs AI · ${aiDifficulty ?? 'medium'}` : 'PvP'}</Text>
          </View>
        </View>

        <Pressable style={styles.navIconButton} onPress={() => setShowMenu(true)}>
          <MoreHorizontal size={18} color={colors.textPrimary} />
        </Pressable>
      </View>

      <PlayerStrip
        name={player2}
        piece="b"
        timeMs={blackTimeMs}
        isActive={turn === 'b' && status === 'playing'}
        isAI={mode === 'ai'}
        hasTimer={!!timer}
        captured={capturedByBlack}
        advantage={blackAdvantage}
      />

      <View style={styles.boardWrap}>
        <ChessBoard
          fen={fen}
          selectedSquare={selectedSquare}
          possibleMoves={moveSuggestions ? possibleMoves : []}
          lastMove={lastMove}
          onSquarePress={handleSquarePress}
          flipped={flipped}
        />
      </View>

      <View style={styles.turnStrip}>
        <Text style={styles.turnLabel}>{turn === 'w' ? `${player1} to move` : `${player2} to move`}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
          {movePairs.map((pair) => (
            <Text key={pair.n} style={styles.historyText}>
              {pair.n}. {pair.white ?? ''} {pair.black ?? ''}{'  '}
            </Text>
          ))}
        </ScrollView>
      </View>

      <View style={styles.separator} />

      <PlayerStrip
        name={player1}
        piece="w"
        timeMs={whiteTimeMs}
        isActive={turn === 'w' && status === 'playing'}
        hasTimer={!!timer}
        captured={capturedByWhite}
        advantage={whiteAdvantage}
      />

      <View style={styles.actionBar}>
        <Pressable style={styles.actionButton} onPress={() => Alert.alert('Hint', 'Move suggestions are coming soon.')}>
          <Lightbulb size={18} color={colors.textSecondary} />
          <Text style={styles.actionLabel}>HINT</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={handleUndo}>
          <RotateCcw size={18} color={colors.textSecondary} />
          <Text style={styles.actionLabel}>UNDO</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={offerDraw}>
          <Handshake size={18} color={colors.textSecondary} />
          <Text style={styles.actionLabel}>DRAW</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.actionButtonResign]} onPress={handleResign}>
          <Flag size={18} color={colors.accent} />
          <Text style={[styles.actionLabel, styles.actionLabelResign]}>RESIGN</Text>
        </Pressable>
      </View>

      <PromotionModal visible={!!promotion} color={promotion?.color ?? 'w'} onSelect={handlePromotionPick} onCancel={() => setPromotion(null)} />
      <GameMenuSheet
        visible={showMenu}
        onResume={() => setShowMenu(false)}
        onOfferDraw={() => {
          setShowMenu(false);
          offerDraw();
        }}
        onUndo={() => {
          setShowMenu(false);
          handleUndo();
        }}
        onResign={() => {
          setShowMenu(false);
          resignGame(turn);
        }}
        onQuitHome={() => {
          setShowMenu(false);
          quitToHome();
        }}
      />
      <CheckAlert visible={showCheck} onDismiss={() => setShowCheck(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  navBar: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  navIconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentMuted,
    borderColor: colors.accentBorder,
    borderWidth: StyleSheet.hairlineWidth,
  },
  navCenter: {
    alignItems: 'center',
  },
  navTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.textLabel,
  },
  modeBadge: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.surfaceGlass,
  },
  modeBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.textSecondary,
  },
  boardWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  turnStrip: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  turnLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  historyScroll: {
    marginTop: 4,
  },
  historyText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textTertiary,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surfaceBorder,
  },
  actionBar: {
    flexDirection: 'row',
    height: 62,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.surfaceGlass,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionButtonResign: {
    backgroundColor: colors.accentMuted,
  },
  actionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.textSecondary,
  },
  actionLabelResign: {
    color: colors.accent,
  },
  // modal styles replaced by dedicated components
});
