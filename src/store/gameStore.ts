import { create } from 'zustand';
import { Chess } from 'chess.js';

import { playSound } from '../audio/sounds';

type GameStatus = 'idle' | 'playing' | 'paused' | 'ended';
type Winner = 'w' | 'b' | 'draw' | null;
type EndReason = 'checkmate' | 'resignation' | 'timeout' | 'stalemate' | 'draw' | null;

interface GameStore {
  chess: Chess;
  fen: string;
  turn: 'w' | 'b';
  selectedSquare: string | null;
  possibleMoves: string[];
  lastMove: { from: string; to: string } | null;
  capturedByWhite: string[];
  capturedByBlack: string[];
  moveHistory: string[];
  status: GameStatus;
  winner: Winner;
  endReason: EndReason;
  whiteTimeMs: number;
  blackTimeMs: number;

  startGame: (timerMinutes: number | null) => void;
  selectSquare: (square: string) => void;
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  resetGame: () => void;
  tickTimer: (color: 'w' | 'b', deltaMs: number) => void;
  resignGame: (color: 'w' | 'b') => void;
  offerDraw: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
}

const createFreshChess = () => new Chess();

export const useGameStore = create<GameStore>((set, get) => ({
  chess: createFreshChess(),
  fen: createFreshChess().fen(),
  turn: 'w',
  selectedSquare: null,
  possibleMoves: [],
  lastMove: null,
  capturedByWhite: [],
  capturedByBlack: [],
  moveHistory: [],
  status: 'idle',
  winner: null,
  endReason: null,
  whiteTimeMs: 5 * 60 * 1000,
  blackTimeMs: 5 * 60 * 1000,

  startGame: (timerMinutes) => {
    const chess = createFreshChess();
    const ms = timerMinutes ? timerMinutes * 60 * 1000 : 0;
    set({
      chess,
      fen: chess.fen(),
      turn: 'w',
      selectedSquare: null,
      possibleMoves: [],
      lastMove: null,
      capturedByWhite: [],
      capturedByBlack: [],
      moveHistory: [],
      status: 'playing',
      winner: null,
      endReason: null,
      whiteTimeMs: ms,
      blackTimeMs: ms,
    });
  },

  selectSquare: (square) => {
    const { chess, selectedSquare, possibleMoves } = get();
    if (selectedSquare && possibleMoves.includes(square)) {
      get().makeMove(selectedSquare, square);
      return;
    }
    const piece = chess.get(square as any);
    if (piece && piece.color === chess.turn()) {
      const moves = chess.moves({ square: square as any, verbose: true });
      playSound('select');
      set({ selectedSquare: square, possibleMoves: moves.map((m: any) => m.to) });
    } else {
      set({ selectedSquare: null, possibleMoves: [] });
    }
  },

  makeMove: (from, to, promotion = 'q') => {
    const { chess, capturedByWhite, capturedByBlack, moveHistory } = get();
    try {
      const move = chess.move({ from, to, promotion } as any);
      if (!move) return false;

      const nextCapturedByWhite = capturedByWhite.slice();
      const nextCapturedByBlack = capturedByBlack.slice();
      if (move.captured) {
        if (move.color === 'w') nextCapturedByWhite.push(move.captured);
        else nextCapturedByBlack.push(move.captured);
        playSound('capture');
      } else {
        playSound('move');
      }

      const isCheckmate = chess.isCheckmate();
      const isStalemate = chess.isStalemate();
      const isOver = chess.isGameOver();

      set({
        fen: chess.fen(),
        turn: chess.turn(),
        selectedSquare: null,
        possibleMoves: [],
        lastMove: { from, to },
        capturedByWhite: nextCapturedByWhite,
        capturedByBlack: nextCapturedByBlack,
        moveHistory: [...moveHistory, move.san],
        status: isOver ? 'ended' : 'playing',
        winner: isCheckmate
          ? (chess.turn() === 'w' ? 'b' : 'w')
          : isOver ? 'draw' : null,
        endReason: isCheckmate
          ? 'checkmate'
          : isStalemate ? 'stalemate' : isOver ? 'draw' : null,
      });
      return true;
    } catch {
      return false;
    }
  },

  tickTimer: (color, deltaMs) => {
    if (color === 'w') {
      const next = Math.max(0, get().whiteTimeMs - deltaMs);
      set({ whiteTimeMs: next });
      if (next === 0) set({ status: 'ended', winner: 'b', endReason: 'timeout' });
    } else {
      const next = Math.max(0, get().blackTimeMs - deltaMs);
      set({ blackTimeMs: next });
      if (next === 0) set({ status: 'ended', winner: 'w', endReason: 'timeout' });
    }
  },

  resetGame: () => {
    const chess = createFreshChess();
    set({
      chess,
      fen: chess.fen(),
      turn: 'w',
      selectedSquare: null,
      possibleMoves: [],
      lastMove: null,
      capturedByWhite: [],
      capturedByBlack: [],
      moveHistory: [],
      status: 'playing',
      winner: null,
      endReason: null,
    });
  },

  resignGame: (color) => set({ status: 'ended', winner: color === 'w' ? 'b' : 'w', endReason: 'resignation' }),
  offerDraw: () => set({ status: 'ended', winner: 'draw', endReason: 'draw' }),
  pauseGame: () => set((state) => (state.status === 'playing' ? { status: 'paused' } : {})),
  resumeGame: () => set((state) => (state.status === 'paused' ? { status: 'playing' } : {})),
}));
