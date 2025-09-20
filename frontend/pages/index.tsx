import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import React, { useMemo, useRef, useState } from 'react';

type ChatItem = { role: 'system' | 'user' | 'assistant'; content: string };

function Table() {
  const tableRef = useRef<any>();
  return (
    <mesh ref={tableRef} rotation-x={-Math.PI / 2} position={[0, -0.5, 0]}>
      <cylinderGeometry args={[3.2, 3.2, 0.2, 64]} />
      <meshStandardMaterial color="#2e7d32" />
    </mesh>
  );
}

function Cards() {
  const positions = useMemo(() => [
    [-0.3, 0, 0], [0, 0, 0],
  ], []);
  return (
    <group position={[0, -0.39, 0.4] as any}>
      {positions.map((p, i) => (
        <mesh key={i} position={p as any} rotation-x={-Math.PI / 2}>
          <boxGeometry args={[0.63, 0.88, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

export default function HomePage() {
  const [stage, setStage] = useState<'preflop' | 'flop' | 'turn' | 'river'>('preflop');
  const [action, setAction] = useState('');
  const [chat, setChat] = useState<ChatItem[]>([{ role: 'system', content: 'Welcome to Poker Trainer. Describe your thought, then press Ask Coach.' }]);
  const [ranges, setRanges] = useState<{ hero: string; villain: string } | null>(null);
  const [pending, setPending] = useState(false);

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
        <Canvas camera={{ position: [0, 4.5, 6], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} />
          <Table />
          <Cards />
          <OrbitControls />
        </Canvas>
      </div>
      <div className="right">
        <div className="panel">
          <div className="controls">
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


