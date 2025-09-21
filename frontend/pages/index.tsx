import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useGame } from '../state/useGame';
import { PokerTable } from '../components/three/PokerTable';
import { Seat } from '../components/three/Seat';
import { HoleCards } from '../components/three/HoleCards';
import { Lights } from '../components/three/Lights';
import { SimpleTable2D } from '../components/ui/SimpleTable2D';
import { ActionBar } from '../components/ui/ActionBar';

type ChatItem = { role: 'system' | 'user' | 'assistant'; content: string };

export default function HomePage() {
  const { state, startNewHand, act } = useGame();
  const [stage, setStage] = useState<'preflop' | 'flop' | 'turn' | 'river'>('preflop');
  const [action, setAction] = useState('');
  const [chat, setChat] = useState<ChatItem[]>([{ role: 'system', content: 'Welcome to Poker Trainer. Describe your thought, then press Ask Coach.' }]);
  const [ranges, setRanges] = useState<{ hero: string; villain: string } | null>(null);
  const [pending, setPending] = useState(false);
  const default2D = (process.env.NEXT_PUBLIC_SIMPLE_VIEW || '').toLowerCase() === 'true';
  const [simple2D, setSimple2D] = useState<boolean>(default2D);

  useEffect(() => {
    if (!state) {
      startNewHand(Math.floor(Math.random() * 1e9));
    }
  }, [state, startNewHand]);

  async function askCoach() {
    setPending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, action, context: {} })
      });
      const data = await res.json();
      setChat((c) => [...c, { role: 'user', content: action }, { role: 'assistant', content: data.message }]);
      setRanges(data.ranges);
      setAction('');
    } catch (e) {
      setChat((c) => [...c, { role: 'assistant', content: 'Error contacting coach service.' }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="layout">
      <div className="panel" style={{ padding: 0 }}>
        {simple2D || !state ? (
          <div style={{ width: '100%', height: 480 }}>
            {state && (
              <SimpleTable2D players={state.players} dealerIndex={state.dealerIndex} board={state.board} />
            )}
          </div>
        ) : (
          <div style={{ width: '100%', height: 480 }}>
            <Canvas camera={{ position: [0, 4.5, 6], fov: 45 }}>
              <Lights />
              <PokerTable />
              {Array.from({ length: 6 }).map((_, i) => (
                <Seat key={i} index={i} label={`P${i+1}`} />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <HoleCards key={`h${i}`} seatIndex={i} faceUp={i === 0} />
              ))}
              <OrbitControls />
            </Canvas>
          </div>
        )}
        <div style={{ padding: 8 }}>
          <ActionBar state={state} onAct={act} />
        </div>
      </div>
      <div className="right">
        <div className="panel">
          <div className="controls">
            <button onClick={() => startNewHand(Math.floor(Math.random() * 1e9))}>New Hand</button>
            <label style={{ marginLeft: 12 }}>
              <input type="checkbox" checked={simple2D} onChange={(e) => setSimple2D(e.target.checked)} /> Simple 2D view
            </label>
            <label>
              Stage:
              <select value={stage} onChange={(e) => setStage(e.target.value as any)}>
                <option value="preflop">Preflop</option>
                <option value="flop">Flop</option>
                <option value="turn">Turn</option>
                <option value="river">River</option>
              </select>
            </label>
            <button onClick={() => setChat([])}>Clear Chat</button>
          </div>
        </div>

        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chatlog">
            {chat.map((m, i) => (
              <div key={i}><strong>{m.role}:</strong> {m.content}</div>
            ))}
          </div>
          <div className="chat-input">
            <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Describe your thought or action..." style={{ flex: 1 }} />
            <button onClick={askCoach} disabled={pending || !action.trim()}>{pending ? 'Asking…' : 'Ask Coach'}</button>
          </div>
        </div>

        <div className="panel">
          <h3>GTO Ranges (example)</h3>
          {ranges ? (
            <>
              <div><strong>Hero:</strong> {ranges.hero}</div>
              <div><strong>Villain:</strong> {ranges.villain}</div>
            </>
          ) : (
            <div>Interact to load example ranges.</div>
          )}
          <div className="range-grid" style={{ marginTop: 8 }}>
            {Array.from({ length: 13 * 13 }).map((_, i) => (
              <div key={i} className="cell" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


