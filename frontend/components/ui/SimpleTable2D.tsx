import React from 'react';
import type { Card, Player } from '../../lib/poker/types';

type Props = {
  players: Player[];
  dealerIndex: number;
  board?: Card[];
  pot?: number;
};

function positionLabel(pos: Player['position']): string {
  switch (pos) {
    case 'BTN': return 'Button';
    case 'SB': return 'Small Blind';
    case 'BB': return 'Big Blind';
    case 'UTG': return 'Under the Gun';
    case 'HJ': return 'Hijack';
    case 'CO': return 'Cutoff';
    default: return pos;
  }
}

export function SimpleTable2D({ players, dealerIndex, board = [], pot = 0 }: Props) {
  const rx = 300; // table radius x
  const ry = 200; // table radius y
  const seatRadiusX = rx + 50;
  const seatRadiusY = ry + 40;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg viewBox="-400 -300 800 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>
        <g filter="url(#shadow)">
          <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="#2e7d32" stroke="#1b5e20" strokeWidth={8} />
        </g>

        {/* Community cards placeholder */}
        <g transform={`translate(0, -20)`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={i} x={-150 + i * 60} y={-30} width={50} height={70} rx={6} fill={i < board.length ? '#fff' : '#ccc'} stroke="#333" />
          ))}
        </g>

        {/* Pot amount */}
        <text x={0} y={80} textAnchor="middle" fontSize={18} fill="#000">{`Pot: ${pot}`}</text>

        {/* Seats */}
        {players.map((p, i) => {
          const angle = (Math.PI * 2 * i) / 6 + Math.PI;
          const x = Math.cos(angle) * seatRadiusX;
          const y = Math.sin(angle) * seatRadiusY;
          const isDealer = i === dealerIndex;
          return (
            <g key={p.id} transform={`translate(${x}, ${y})`}>
              <circle r={28} fill="#424242" stroke="#212121" strokeWidth={2} />
              {isDealer && (
                <circle r={10} fill="#fff" stroke="#555" strokeWidth={1} cx={-38} cy={-22} />
              )}
              <text x={0} y={42} textAnchor="middle" fontSize={14} fill="#000">{positionLabel(p.position)}</text>
              {/* Stack and current bet */}
              <text x={0} y={60} textAnchor="middle" fontSize={12} fill="#000">{`Stack: ${p.stack}`}</text>
              <text x={0} y={74} textAnchor="middle" fontSize={12} fill="#000">{`Bet: ${p.contributedThisStreet}`}</text>

              {/* Hole cards near each seat */}
              <g transform={`translate(0, -50)`}>
                {[0, 1].map((idx) => (
                  <g key={idx} transform={`translate(${idx === 0 ? -18 : 18}, 0)`}>
                    <rect x={-15} y={-20} width={30} height={40} rx={4} fill={p.isHero ? '#fff' : '#ccc'} stroke="#333" />
                    {p.isHero && p.hole && (
                      <text x={0} y={5} textAnchor="middle" fontSize={12} fill="#000">{p.hole[idx]}</text>
                    )}
                  </g>
                ))}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}


