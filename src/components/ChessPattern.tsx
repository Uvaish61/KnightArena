import React from 'react';
import Svg, { Rect } from 'react-native-svg';

type ChessPatternProps = {
  size?: number;
  color?: string;
  opacity?: number;
};

export function ChessPattern({ size = 160, color = '#ffffff', opacity = 0.04 }: ChessPatternProps) {
  const cell = size / 8;
  const squares = [];

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if ((row + col) % 2 === 0) {
        squares.push(
          <Rect key={`${row}-${col}`} x={col * cell} y={row * cell} width={cell} height={cell} fill={color} />,
        );
      }
    }
  }

  return (
    <Svg width={size} height={size} style={{ opacity }}>
      {squares}
    </Svg>
  );
}
