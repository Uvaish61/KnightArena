import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export function useChessTimer(enabled: boolean) {
  const lastTick = useRef<number>(Date.now());
  const turn = useGameStore((s) => s.turn);
  const status = useGameStore((s) => s.status);
  const tickTimer = useGameStore((s) => s.tickTimer);

  useEffect(() => {
    lastTick.current = Date.now();
  }, [turn]);

  useEffect(() => {
    if (!enabled || status !== 'playing') return undefined;

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTick.current;
      lastTick.current = now;
      tickTimer(turn, delta);
    }, 100);

    return () => clearInterval(interval);
  }, [enabled, status, turn, tickTimer]);
}

export const formatTime = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
