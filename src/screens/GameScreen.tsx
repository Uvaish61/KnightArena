import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Flag, Handshake, Lightbulb, MoreHorizontal, RotateCcw } from 'lucide-react-native';

import { ChessBoard } from '../components/ChessBoard';
import { PlayerStrip } from '../components/PlayerStrip';
import { PromotionModal } from '../components/modals/PromotionModal';
import { GameMenuSheet } from '../components/modals/GameMenuSheet';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { CheckAlert } from '../components/game/CheckAlert';
import { pickAIMove, shouldAIAcceptDraw } from '../ai/chessAI';
import { hapticTap } from '../haptics/haptics';
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
  const endReason = useGameStore((s) => s.endReason);
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
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
  } | null>(null);
  const [hintMove, setHintMove] = useState<{ from: string; to: string } | null>(null);
  const matchStartedAt = useRef(Date.now());
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useChessTimer(!!timer && status === 'playing');

  useEffect(() => {
    startGame(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== 'ended') return;
    navigation.replace('Result', {
      winner,
      reason: endReason,
      mode,
      aiDifficulty: mode === 'ai' ? aiDifficulty ?? 'medium' : undefined,
      player1,
      player2,
      moveCount: moveHistory.length,
      pgn: chess.pgn(),
      durationMs: Date.now() - matchStartedAt.current,
      captureCount: capturedByWhite.length + capturedByBlack.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedByBlack.length, capturedByWhite.length, chess, endReason, moveHistory.length, navigation, player1, player2, status, winner]);

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

  const confirmLeave = useCallback(() => {
    if (status !== 'playing') {
      navigation.goBack();
      return true;
    }
    setConfirmModal({
      title: 'Leave match?',
      message: 'Your current game progress will be lost.',
      confirmLabel: 'Leave',
      cancelLabel: 'Cancel',
      destructive: true,
      onConfirm: () => navigation.goBack(),
    });
    return true;
  }, [status, navigation]);

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

  // Stable identity so CheckAlert's auto-dismiss timer isn't reset on every
  // parent re-render (the timer ticks re-render this screen every 100ms).
  const dismissCheck = useCallback(() => setShowCheck(false), []);

  // Independent of the dismissible toast above, so the board keeps marking
  // the king in check until the position actually changes.
  const checkSquare = useMemo(() => {
    if (status !== 'playing' || !chess.inCheck()) return null;
    for (const boardRow of chess.board()) {
      for (const square of boardRow) {
        if (square && square.type === 'k' && square.color === turn) {
          return square.square;
        }
      }
    }
    return null;
  }, [chess, fen, status, turn]);

  useEffect(() => {
    if (mode !== 'ai' || status !== 'playing' || turn !== 'b') return undefined;

    const timeout = setTimeout(() => {
      const move = pickAIMove(fen, aiDifficulty ?? 'medium');
      if (move) makeMove(move.from, move.to, move.promotion);
    }, 500);

    return () => clearTimeout(timeout);
  }, [mode, status, turn, fen, aiDifficulty, makeMove]);

  const handleResign = () => {
    setConfirmModal({
      title: 'Resign?',
      message: 'Are you sure you want to resign this match?',
      confirmLabel: 'Resign',
      cancelLabel: 'Cancel',
      destructive: true,
      onConfirm: () => resignGame(turn),
    });
  };

  const handleOfferDraw = () => {
    if (mode === 'ai') {
      if (shouldAIAcceptDraw(fen)) {
        offerDraw();
      } else {
        setConfirmModal({
          title: 'Draw declined',
          message: 'The AI declined your draw offer and plays on.',
          confirmLabel: 'OK',
          onConfirm: () => {},
        });
      }
      return;
    }
    offerDraw();
  };

  const handleHint = () => {
    if (status !== 'playing') return;
    if (mode === 'ai' && turn === 'b') return;

    const move = pickAIMove(fen, 'hard');
    if (!move) return;

    hapticTap();
    setHintMove({ from: move.from, to: move.to });
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHintMove(null), 3000);
  };

  // Clear any active hint once the position changes (a move was made).
  useEffect(() => {
    setHintMove(null);
  }, [fen]);

  useEffect(() => () => {
    if (hintTimer.current) clearTimeout(hintTimer.current);
  }, []);

  const handleUndo = () => {
    const undone = chess.undo();
    if (!undone) return;

    hapticTap();

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
  const hintDisabled = status !== 'playing' || (mode === 'ai' && turn === 'b');
  const undoDisabled = moveHistory.length === 0;

  // The side to move is the one in check. Word the alert for whose king it is.
  const checkSub =
    mode === 'ai'
      ? turn === 'w'
        ? 'Your king is under attack'
        : `${player2} is in check`
      : `${turn === 'w' ? player1 : player2}'s king is under attack`;

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
        isThinking={mode === 'ai' && status === 'playing' && turn === 'b'}
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
          hintMove={hintMove}
          checkSquare={checkSquare}
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
        <Pressable
          style={[styles.actionButton, hintDisabled && styles.actionButtonDisabled]}
          onPress={handleHint}
          disabled={hintDisabled}
        >
          <Lightbulb size={18} color={hintDisabled ? colors.textTertiary : colors.textSecondary} />
          <Text style={[styles.actionLabel, hintDisabled && styles.actionLabelDisabled]}>HINT</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, undoDisabled && styles.actionButtonDisabled]}
          onPress={handleUndo}
          disabled={undoDisabled}
        >
          <RotateCcw size={18} color={undoDisabled ? colors.textTertiary : colors.textSecondary} />
          <Text style={[styles.actionLabel, undoDisabled && styles.actionLabelDisabled]}>UNDO</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={handleOfferDraw}>
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
          handleOfferDraw();
        }}
        onUndo={() => {
          setShowMenu(false);
          handleUndo();
        }}
        onResign={() => {
          setShowMenu(false);
          handleResign();
        }}
        onQuitHome={() => {
          setShowMenu(false);
          quitToHome();
        }}
      />
      <CheckAlert visible={showCheck} sub={checkSub} onDismiss={dismissCheck} />
      <ConfirmModal
        visible={!!confirmModal}
        title={confirmModal?.title ?? ''}
        message={confirmModal?.message ?? ''}
        confirmLabel={confirmModal?.confirmLabel ?? 'OK'}
        cancelLabel={confirmModal?.cancelLabel}
        destructive={confirmModal?.destructive}
        onConfirm={() => {
          confirmModal?.onConfirm();
          setConfirmModal(null);
        }}
        onCancel={confirmModal?.cancelLabel ? () => setConfirmModal(null) : undefined}
      />
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
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.textSecondary,
  },
  actionLabelResign: {
    color: colors.accent,
  },
  actionLabelDisabled: {
    color: colors.textTertiary,
  },
  // modal styles replaced by dedicated components
});
