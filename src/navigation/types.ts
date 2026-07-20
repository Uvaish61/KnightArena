import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
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
    reason?: 'checkmate' | 'resignation' | 'timeout' | 'stalemate' | 'draw' | null;
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

export type SplashNavProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;
export type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export type GameSetupNavProp = NativeStackNavigationProp<RootStackParamList, 'GameSetup'>;
export type GameNavProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;
export type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;
export type ResultNavProp = NativeStackNavigationProp<RootStackParamList, 'Result'>;
export type ResultRouteProp = RouteProp<RootStackParamList, 'Result'>;
export type GameHistoryNavProp = NativeStackNavigationProp<RootStackParamList, 'GameHistory'>;
export type SettingsNavProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;
