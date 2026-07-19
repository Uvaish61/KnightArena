import { Chess, Move } from 'chess.js';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type AIMove = { from: string; to: string; promotion: string };

const PIECE_VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

const SEARCH_DEPTH: Record<AIDifficulty, number> = { easy: 0, medium: 1, hard: 3 };

function evaluateBoard(chess: Chess): number {
  let score = 0;
  for (const row of chess.board()) {
    for (const cell of row) {
      if (!cell) continue;
      const value = PIECE_VALUES[cell.type];
      score += cell.color === 'w' ? value : -value;
    }
  }
  return score;
}

function negamax(chess: Chess, depth: number, alpha: number, beta: number): number {
  if (depth === 0 || chess.isGameOver()) {
    const perspective = chess.turn() === 'w' ? 1 : -1;
    return perspective * evaluateBoard(chess);
  }

  let best = -Infinity;
  const moves = chess.moves({ verbose: true }) as Move[];
  for (const move of moves) {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion ?? 'q' });
    const score = -negamax(chess, depth - 1, -beta, -alpha);
    chess.undo();

    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

export function pickAIMove(fen: string, difficulty: AIDifficulty): AIMove | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true }) as Move[];
  if (moves.length === 0) return null;

  if (difficulty === 'easy') {
    const move = moves[Math.floor(Math.random() * moves.length)];
    return { from: move.from, to: move.to, promotion: move.promotion ?? 'q' };
  }

  const depth = SEARCH_DEPTH[difficulty];
  let bestScore = -Infinity;
  let bestMoves: Move[] = [];

  for (const move of moves) {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion ?? 'q' });
    const score = -negamax(chess, depth - 1, -Infinity, Infinity);
    chess.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  const chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  return { from: chosen.from, to: chosen.to, promotion: chosen.promotion ?? 'q' };
}
