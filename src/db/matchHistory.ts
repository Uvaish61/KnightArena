import AsyncStorage from '@react-native-async-storage/async-storage';

export type MatchWinner = 'w' | 'b' | 'draw';

export interface MatchRecord {
  id: number;
  winner: MatchWinner;
  player1: string;
  player2: string;
  moveCount: number;
  durationMs: number;
  captureCount: number;
  pgn: string;
  playedAt: string;
}

export type NewMatchRecord = Omit<MatchRecord, 'id'>;

const STORAGE_KEY = 'knight-arena-match-history';

async function readMatches() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [] as MatchRecord[];
  }

  try {
    const parsed = JSON.parse(raw) as MatchRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as MatchRecord[];
  }
}

async function writeMatches(matches: MatchRecord[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

export async function saveMatch(match: NewMatchRecord) {
  const matches = await readMatches();
  const nextId = matches.length > 0 ? Math.max(...matches.map((entry) => entry.id)) + 1 : 1;
  const nextMatch: MatchRecord = { id: nextId, ...match };
  await writeMatches([nextMatch, ...matches]);
  return nextMatch;
}

export async function getAllMatches() {
  return readMatches();
}

export async function deleteMatch(id: number) {
  const matches = await readMatches();
  const nextMatches = matches.filter((match) => match.id !== id);
  await writeMatches(nextMatches);
  return nextMatches;
}

export async function clearAll() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}