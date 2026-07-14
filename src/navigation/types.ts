export type RootStackParamList = {
  Splash: undefined;
  GameSetup: undefined;
  Game: {
    mode: 'pvp' | 'ai';
    player1: string;
    player2: string;
    timer: number | null;
    aiDifficulty?: 'easy' | 'medium' | 'hard';
  };
  Result: {
    winner: 'w' | 'b' | 'draw' | null;
    player1: string;
    player2: string;
    moveCount: number;
    pgn: string;
    durationMs: number;
    captureCount: number;
  };
  GameHistory: undefined;
  Settings: undefined;
};
