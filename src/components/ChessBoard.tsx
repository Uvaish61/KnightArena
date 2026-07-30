import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { colors, fonts } from '../theme/theme';

const PIECES: Record<string, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

const FILES = 'abcdefgh';

type ChessBoardProps = {
  fen: string;
  selectedSquare: string | null;
  possibleMoves: string[];
  lastMove: { from: string; to: string; rookFrom?: string; rookTo?: string } | null;
  hintMove?: { from: string; to: string } | null;
  checkSquare?: string | null;
  thinking?: boolean;
  onSquarePress: (square: string) => void;
  flipped?: boolean;
};

function parseBoardFromFen(fen: string): Array<Array<{ square: string; piece: string | null }>> {
  const [placement] = fen.split(' ');
  const rows = placement.split('/');
  const board: Array<Array<{ square: string; piece: string | null }>> = [];

  rows.forEach((row, rankIndex) => {
    const rank = 8 - rankIndex;
    const cells: Array<{ square: string; piece: string | null }> = [];
    let file = 0;
    for (const char of row) {
      if (/\d/.test(char)) {
        const empty = parseInt(char, 10);
        for (let i = 0; i < empty; i += 1) {
          cells.push({ square: `${FILES[file]}${rank}`, piece: null });
          file += 1;
        }
      } else {
        const color = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toUpperCase();
        cells.push({ square: `${FILES[file]}${rank}`, piece: `${color}${type}` });
        file += 1;
      }
    }
    board.push(cells);
  });

  return board;
}

// Converts a chess square to its rendered grid column/row, mirroring the
// file/rank -> fileIndex/rankIndex mapping used when laying out the board.
function squareToGrid(square: string, flipped: boolean | undefined) {
  const file = FILES.indexOf(square[0]);
  const rank = parseInt(square[1], 10);
  const col = flipped ? 7 - file : file;
  const row = flipped ? rank - 1 : 8 - rank;
  return { col, row };
}

export function ChessBoard({ fen, selectedSquare, possibleMoves, lastMove, hintMove, checkSquare, thinking, onSquarePress, flipped }: ChessBoardProps) {
  const { width } = useWindowDimensions();
  const sq = Math.floor((width - 4) / 8);
  const boardScale = useRef(new Animated.Value(0.84)).current;
  const boardOpacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const rookSlideAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const thinkingOpacity = useRef(new Animated.Value(0)).current;
  const lastAnimatedMoveRef = useRef<string | null>(null);
  const [animatingSquare, setAnimatingSquare] = useState<string | null>(null);
  const [animatingRookSquare, setAnimatingRookSquare] = useState<string | null>(null);

  useEffect(() => {
    Animated.timing(thinkingOpacity, {
      toValue: thinking ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [thinking, thinkingOpacity]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(boardScale, { toValue: 1, damping: 12, stiffness: 120, useNativeDriver: true }),
      Animated.timing(boardOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [boardScale, boardOpacity]);

  // Slide the moved piece in from its origin square instead of snapping
  // straight to the destination whenever a new lastMove comes in.
  useEffect(() => {
    if (!lastMove) {
      lastAnimatedMoveRef.current = null;
      return;
    }

    const moveKey = `${lastMove.from}->${lastMove.to}`;
    if (lastAnimatedMoveRef.current === moveKey) return;
    lastAnimatedMoveRef.current = moveKey;

    const fromGrid = squareToGrid(lastMove.from, flipped);
    const toGrid = squareToGrid(lastMove.to, flipped);
    slideAnim.setValue({ x: (fromGrid.col - toGrid.col) * sq, y: (fromGrid.row - toGrid.row) * sq });
    setAnimatingSquare(lastMove.to);

    Animated.spring(slideAnim, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      damping: 16,
      stiffness: 210,
      mass: 0.8,
    }).start(() => setAnimatingSquare(null));

    if (lastMove.rookFrom && lastMove.rookTo) {
      const rookFromGrid = squareToGrid(lastMove.rookFrom, flipped);
      const rookToGrid = squareToGrid(lastMove.rookTo, flipped);
      rookSlideAnim.setValue({ x: (rookFromGrid.col - rookToGrid.col) * sq, y: (rookFromGrid.row - rookToGrid.row) * sq });
      setAnimatingRookSquare(lastMove.rookTo);

      Animated.spring(rookSlideAnim, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        damping: 16,
        stiffness: 210,
        mass: 0.8,
      }).start(() => setAnimatingRookSquare(null));
    } else {
      setAnimatingRookSquare(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMove, flipped]);

  const rows = parseBoardFromFen(fen);
  const orderedRows = flipped ? [...rows].reverse() : rows;
  const animatingPiece = animatingSquare
    ? rows.flat().find((cell) => cell.square === animatingSquare)?.piece ?? null
    : null;
  const animatingGrid = animatingSquare ? squareToGrid(animatingSquare, flipped) : null;
  const animatingRookPiece = animatingRookSquare
    ? rows.flat().find((cell) => cell.square === animatingRookSquare)?.piece ?? null
    : null;
  const animatingRookGrid = animatingRookSquare ? squareToGrid(animatingRookSquare, flipped) : null;

  const getSquareBg = (light: boolean, square: string) => {
    if (square === selectedSquare) return light ? colors.boardSelectedLight : colors.boardSelectedDark;
    if (square === checkSquare) return light ? colors.boardCheckLight : colors.boardCheckDark;
    if (square === hintMove?.from || square === hintMove?.to) return light ? colors.boardHintLight : colors.boardHintDark;
    if (
      square === lastMove?.from ||
      square === lastMove?.to ||
      square === lastMove?.rookFrom ||
      square === lastMove?.rookTo
    )
      return light ? colors.boardLastMoveLight : colors.boardLastMoveDark;
    return light ? colors.boardLight : colors.boardDark;
  };

  return (
    <Animated.View
      style={[
        styles.board,
        { width: sq * 8, height: sq * 8, transform: [{ scale: boardScale }], opacity: boardOpacity },
      ]}
    >
      {orderedRows.map((row, rankIndex) => {
        const orderedCells = flipped ? [...row].reverse() : row;
        return (
          <View key={rankIndex} style={styles.row}>
            {orderedCells.map((cell, fileIndex) => {
              const file = flipped ? 7 - fileIndex : fileIndex;
              const rank = flipped ? rankIndex + 1 : 8 - rankIndex;
              const light = (file + rank) % 2 === 1;
              const piece = cell.piece;
              const isPossible = possibleMoves.includes(cell.square);

              return (
                <Pressable
                  key={cell.square}
                  style={[styles.square, { width: sq, height: sq, backgroundColor: getSquareBg(light, cell.square) }]}
                  onPress={() => onSquarePress(cell.square)}
                >
                  {fileIndex === 0 && (
                    <Text style={[styles.coordLabel, styles.rankLabel, { color: light ? 'rgba(92,20,20,0.5)' : 'rgba(240,213,168,0.45)' }]}>
                      {rank}
                    </Text>
                  )}
                  {rankIndex === 7 && (
                    <Text style={[styles.coordLabel, styles.fileLabel, { color: light ? 'rgba(92,20,20,0.5)' : 'rgba(240,213,168,0.45)' }]}>
                      {FILES[file]}
                    </Text>
                  )}

                  {piece && cell.square !== animatingSquare && cell.square !== animatingRookSquare && (
                    <Text
                      style={[
                        styles.piece,
                        piece.startsWith('w') ? styles.pieceWhite : styles.pieceBlack,
                      ]}
                    >
                      {PIECES[piece]}
                    </Text>
                  )}

                  {isPossible && (
                    <View
                      style={[
                        styles.moveDot,
                        {
                          width: piece ? sq * 0.85 : sq * 0.28,
                          height: piece ? sq * 0.85 : sq * 0.28,
                          borderRadius: sq,
                          backgroundColor: piece ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.18)',
                          borderWidth: piece ? 3 : 0,
                          borderColor: 'rgba(0,0,0,0.18)',
                        },
                      ]}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        );
      })}

      {animatingPiece && animatingGrid && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.slidingPiece,
            {
              width: sq,
              height: sq,
              left: animatingGrid.col * sq,
              top: animatingGrid.row * sq,
              transform: [{ translateX: slideAnim.x }, { translateY: slideAnim.y }],
            },
          ]}
        >
          <Text style={[styles.piece, animatingPiece.startsWith('w') ? styles.pieceWhite : styles.pieceBlack]}>
            {PIECES[animatingPiece]}
          </Text>
        </Animated.View>
      )}

      {animatingRookPiece && animatingRookGrid && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.slidingPiece,
            {
              width: sq,
              height: sq,
              left: animatingRookGrid.col * sq,
              top: animatingRookGrid.row * sq,
              transform: [{ translateX: rookSlideAnim.x }, { translateY: rookSlideAnim.y }],
            },
          ]}
        >
          <Text style={[styles.piece, animatingRookPiece.startsWith('w') ? styles.pieceWhite : styles.pieceBlack]}>
            {PIECES[animatingRookPiece]}
          </Text>
        </Animated.View>
      )}

      <Animated.View pointerEvents="none" style={[styles.thinkingOverlay, { opacity: thinkingOpacity }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  board: {
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coordLabel: {
    position: 'absolute',
    fontFamily: fonts.bodyBold,
    fontSize: 7,
  },
  rankLabel: {
    top: 2,
    left: 2,
  },
  fileLabel: {
    bottom: 2,
    right: 2,
  },
  piece: {
    fontSize: 23,
  },
  pieceWhite: {
    color: '#faf3ea',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  pieceBlack: {
    color: '#120404',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  moveDot: {
    position: 'absolute',
  },
  slidingPiece: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  thinkingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,8,8,0.28)',
    borderRadius: 4,
  },
});
