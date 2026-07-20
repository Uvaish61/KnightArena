import { Chess, Move } from 'chess.js';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type AIMove = { from: string; to: string; promotion: string };

const PIECE_VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

// medium searches 2 plies so it sees the opponent's recapture and stops hanging
// pieces (depth 1 only grabs immediate material). hard goes deeper for tactics.
const SEARCH_DEPTH: Record<AIDifficulty, number> = { easy: 0, medium: 2, hard: 3 };

// Well above any achievable material score, so a forced mate always outranks
// material gains. Kept finite so alpha-beta comparisons stay well-behaved.
const MATE_SCORE = 1_000_000;

// Search captures (and promotions) first so alpha-beta prunes more branches.
// MVV-LVA: prefer capturing a high-value victim with a low-value attacker.
function moveHeuristic(move: Move): number {
  let score = 0;
  if (move.captured) {
    score += 10 * (PIECE_VALUES[move.captured] ?? 0) - (PIECE_VALUES[move.piece] ?? 0);
  }
  if (move.promotion) {
    score += PIECE_VALUES[move.promotion] ?? 0;
  }
  return score;
}

function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => moveHeuristic(b) - moveHeuristic(a));
}

// Piece-square tables (centipawns) from White's view, rank 8 first (index 0 = a8).
// They reward central control, development and king safety so play isn't aimless.
// For a black piece the table is mirrored vertically (row 7 - r).
const PIECE_SQUARE_TABLES: Record<string, number[]> = {
  p: [
      0,  0,  0,  0,  0,  0,  0,  0,
     50, 50, 50, 50, 50, 50, 50, 50,
     10, 10, 20, 30, 30, 20, 10, 10,
      5,  5, 10, 25, 25, 10,  5,  5,
      0,  0,  0, 20, 20,  0,  0,  0,
      5, -5,-10,  0,  0,-10, -5,  5,
      5, 10, 10,-20,-20, 10, 10,  5,
      0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
      0,  0,  0,  0,  0,  0,  0,  0,
      5, 10, 10, 10, 10, 10, 10,  5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
      0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
};

function evaluateBoard(chess: Chess): number {
  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const cell = board[r][c];
      if (!cell) continue;
      const material = PIECE_VALUES[cell.type] ?? 0;
      const table = PIECE_SQUARE_TABLES[cell.type];
      // Mirror the table vertically for Black.
      const positional = table ? table[(cell.color === 'w' ? r : 7 - r) * 8 + c] : 0;
      const total = material + positional;
      score += cell.color === 'w' ? total : -total;
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
  const moves = orderMoves(chess.moves({ verbose: true }) as Move[]);
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
