import { Chess, Move } from 'chess.js';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type AIMove = { from: string; to: string; promotion: string };

const PIECE_VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

const SEARCH_DEPTH: Record<AIDifficulty, number> = { easy: 0, medium: 1, hard: 3 };

// Well above any achievable material score, so a forced mate always outranks
// material gains. Kept finite so alpha-beta comparisons stay well-behaved.
const MATE_SCORE = 1_000_000;

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
  if (chess.isGameOver()) {
    // The side to move is checkmated — worst outcome for it. The `+ depth` term
    // means a mate found sooner (more depth remaining) scores higher, so the AI
    // prefers the fastest forced mate.
    if (chess.isCheckmate()) return -(MATE_SCORE + depth);
    // Stalemate, threefold, insufficient material, or 50-move → draw.
    return 0;
  }

  if (depth === 0) {
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

// The AI plays Black. `evaluateBoard` is white-positive, so a negative score
// means Black is ahead. The AI accepts a draw unless Black is clearly winning
// (more than ~1 pawn up), in which case it plays on for the win.
export function shouldAIAcceptDraw(fen: string): boolean {
  const chess = new Chess(fen);
  return evaluateBoard(chess) >= -100;
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
