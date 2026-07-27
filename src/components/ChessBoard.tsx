import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme/theme';

const BOARD_SIZE = Dimensions.get('window').width - 4;
const SQ = Math.floor(BOARD_SIZE / 8);

const PIECES: Record<string, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

const FILES = 'abcdefgh';

type ChessBoardProps = {
  fen: string;
  selectedSquare: string | null;
  possibleMoves: string[];
  lastMove: { from: string; to: string } | null;
  hintMove?: { from: string; to: string } | null;
  checkSquare?: string | null;
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

export function ChessBoard({ fen, selectedSquare, possibleMoves, lastMove, hintMove, checkSquare, onSquarePress, flipped }: ChessBoardProps) {
  const boardScale = useRef(new Animated.Value(0.84)).current;
  const boardOpacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastAnimatedMoveRef = useRef<string | null>(null);
  const [animatingSquare, setAnimatingSquare] = useState<string | null>(null);

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
    slideAnim.setValue({ x: (fromGrid.col - toGrid.col) * SQ, y: (fromGrid.row - toGrid.row) * SQ });
    setAnimatingSquare(lastMove.to);

    Animated.spring(slideAnim, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      damping: 16,
      stiffness: 210,
      mass: 0.8,
    }).start(() => setAnimatingSquare(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMove, flipped]);

  const rows = parseBoardFromFen(fen);
  const orderedRows = flipped ? [...rows].reverse() : rows;
  const animatingPiece = animatingSquare
    ? rows.flat().find((cell) => cell.square === animatingSquare)?.piece ?? null
    : null;
  const animatingGrid = animatingSquare ? squareToGrid(animatingSquare, flipped) : null;

  const getSquareBg = (light: boolean, square: string) => {
    if (square === selectedSquare) return light ? colors.boardSelectedLight : colors.boardSelectedDark;
    if (square === checkSquare) return light ? colors.boardCheckLight : colors.boardCheckDark;
    if (square === hintMove?.from || square === hintMove?.to) return light ? colors.boardHintLight : colors.boardHintDark;
    if (square === lastMove?.from || square === lastMove?.to) return light ? colors.boardLastMoveLight : colors.boardLastMoveDark;
    return light ? colors.boardLight : colors.boardDark;
  };

  return (
    <Animated.View
      style={[
        styles.board,
        { width: SQ * 8, height: SQ * 8, transform: [{ scale: boardScale }], opacity: boardOpacity },
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
                  style={[styles.square, { width: SQ, height: SQ, backgroundColor: getSquareBg(light, cell.square) }]}
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

                  {piece && cell.square !== animatingSquare && (
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
                          width: piece ? SQ * 0.85 : SQ * 0.28,
                          height: piece ? SQ * 0.85 : SQ * 0.28,
                          borderRadius: SQ,
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
              width: SQ,
              height: SQ,
              left: animatingGrid.col * SQ,
              top: animatingGrid.row * SQ,
              transform: [{ translateX: slideAnim.x }, { translateY: slideAnim.y }],
            },
          ]}
        >
          <Text style={[styles.piece, animatingPiece.startsWith('w') ? styles.pieceWhite : styles.pieceBlack]}>
            {PIECES[animatingPiece]}
          </Text>
        </Animated.View>
      )}
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
});
