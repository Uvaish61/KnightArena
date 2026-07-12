import React, { useEffect, useRef } from 'react';
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

export function ChessBoard({ fen, selectedSquare, possibleMoves, lastMove, onSquarePress, flipped }: ChessBoardProps) {
  const boardScale = useRef(new Animated.Value(0.84)).current;
  const boardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(boardScale, { toValue: 1, damping: 12, stiffness: 120, useNativeDriver: true }),
      Animated.timing(boardOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [boardScale, boardOpacity]);

  const rows = parseBoardFromFen(fen);
  const orderedRows = flipped ? [...rows].reverse() : rows;

  const getSquareBg = (light: boolean, square: string) => {
    if (square === selectedSquare) return light ? colors.boardSelectedLight : colors.boardSelectedDark;
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
                <View
                  key={cell.square}
                  style={[styles.square, { width: SQ, height: SQ, backgroundColor: getSquareBg(light, cell.square) }]}
                  onTouchEnd={() => onSquarePress(cell.square)}
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

                  {piece && (
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
                </View>
              );
            })}
          </View>
        );
      })}
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
});
