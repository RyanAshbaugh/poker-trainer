import React, { useEffect, useRef, useState } from 'react';
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

type ChipAnim = { id: number; x0: number; y0: number; x1: number; y1: number; start: number; dur: number; amount: number };

export function SimpleTable2D({ players, dealerIndex, board = [], pot = 0 }: Props) {
  const rx = 300; // table radius x
  const ry = 200; // table radius y
  const seatRadiusX = rx + 50;
  const seatRadiusY = ry + 40;
  // Determine to-act player by reading a custom global set in reducer side-channel
  const toActIndex = (typeof window !== 'undefined' && (window as any).__POKER_STATE_TOACT__) ?? -1;
  const lastAction = (typeof window !== 'undefined' && (window as any).__POKER_LAST_ACTION__) as { playerIndex: number; type: string; paid: number; toAmount?: number } | undefined;

  const [chips, setChips] = useState<ChipAnim[]>([]);
  const nextId = useRef(1);

  // Trigger chip animation when someone pays chips
  useEffect(() => {
    if (!lastAction || lastAction.paid <= 0) return;
    const i = lastAction.playerIndex;
    const angle = (Math.PI * 2 * i) / 6 + Math.PI / 2;
    const x = Math.cos(angle) * seatRadiusX;
    const y = Math.sin(angle) * seatRadiusY;
    const id = nextId.current++;
    const anim: ChipAnim = { id, x0: x, y0: y, x1: 0, y1: 0, start: performance.now(), dur: 600, amount: lastAction.paid };
    setChips((cs) => [...cs.filter(c => c.start > performance.now() - 1500), anim]);
  }, [lastAction]);

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

        {/* Chip animations */}
        {chips.map((c) => {
          const t = Math.min(1, (performance.now() - c.start) / c.dur);
          const x = c.x0 + (c.x1 - c.x0) * t;
          const y = c.y0 + (c.y1 - c.y0) * t;
          return (
            <g key={c.id} transform={`translate(${x}, ${y})`}>
              <circle r={6} fill="#ffcc80" stroke="#e65100" strokeWidth={1} />
            </g>
          );
        })}

        {/* Community cards */}
        <g transform={`translate(0, -20)`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={i} transform={`translate(${ -150 + i * 60 }, 0)`}>
              <rect x={0} y={-30} width={50} height={70} rx={6} fill={i < board.length ? '#fff' : '#ccc'} stroke="#333" />
              {i < board.length && (
                <text x={25} y={5} textAnchor="middle" fontSize={16} fill="#000">{board[i]}</text>
              )}
            </g>
          ))}
        </g>

        {/* Pot amount */}
        <text x={0} y={80} textAnchor="middle" fontSize={18} fill="#000">{`Pot: ${pot}`}</text>

        {/* Seats */}
        {players.map((p, i) => {
          const angle = (Math.PI * 2 * i) / 6 + Math.PI / 2; // hero seatIndex 0 at bottom
          const x = Math.cos(angle) * seatRadiusX;
          const y = Math.sin(angle) * seatRadiusY;
          const isDealer = i === dealerIndex;
          return (
            <g key={p.id} transform={`translate(${x}, ${y})`}>
              <circle r={28} fill={toActIndex === i ? '#616161' : '#424242'} stroke={toActIndex === i ? '#ffca28' : '#212121'} strokeWidth={toActIndex === i ? 4 : 2} />
              {isDealer && (
                <circle r={10} fill="#fff" stroke="#555" strokeWidth={1} cx={-38} cy={-22} />
              )}
              <text x={0} y={42} textAnchor="middle" fontSize={14} fill="#000">{p.isHero ? 'Hero' : positionLabel(p.position)}</text>
              {/* Stack and current bet */}
              <text x={0} y={60} textAnchor="middle" fontSize={12} fill="#000">{`Stack: ${p.stack}`}</text>
              <text x={0} y={74} textAnchor="middle" fontSize={12} fill="#000">{`Bet: ${p.contributedThisStreet}`}</text>

              {/* Last action bubble */}
              {lastAction && lastAction.playerIndex === i && (
                <g transform="translate(0, 92)">
                  <rect x={-38} y={-14} width={76} height={18} rx={8} fill="#fffde7" stroke="#fdd835" />
                  <text x={0} y={0} textAnchor="middle" fontSize={12} fill="#795548">
                    {lastAction.type}{lastAction.paid ? ` ${lastAction.paid}` : ''}
                  </text>
                </g>
              )}

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

              {/* Last action bubble (reads from non-typed _lastAction on GameState via window store) */}
              {/* For now, we rely on a data-lastaction attribute that pages/index passes on the parent group via DOM is complex; skipping typed wire */}
            </g>
          );
        })}
      </svg>
    </div>
  );
}


