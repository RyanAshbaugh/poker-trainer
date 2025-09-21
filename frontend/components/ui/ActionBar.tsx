import React, { useMemo, useState } from 'react';
import type { GameState, Action } from '../../lib/poker/types';
import { legalActions } from '../../lib/poker/engine';

type Props = {
  state: GameState | null;
  onAct: (a: Action) => void;
};

export function ActionBar({ state, onAct }: Props) {
  const [raiseTo, setRaiseTo] = useState<number>(0);

  const heroIndex = 0;
  const isHeroTurn = !!state && state.toActIndex === heroIndex && state.players[heroIndex].inHand && !state.players[heroIndex].allIn;
  const actions = useMemo(() => (state && isHeroTurn ? legalActions(state) : []), [state, isHeroTurn]);
  const toCall = state ? Math.max(0, state.currentBet - state.players[heroIndex].contributedThisStreet) : 0;

  if (!state) return null;

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <div><strong>Stage:</strong> {state.street} | <strong>Pot:</strong> {state.pot}</div>
      {isHeroTurn ? (
        <>
          {actions.includes('fold') && (
            <button onClick={() => onAct({ playerIndex: heroIndex, type: 'fold' })}>Fold</button>
          )}
          {actions.includes('check') && (
            <button onClick={() => onAct({ playerIndex: heroIndex, type: 'check' })}>Check</button>
          )}
          {actions.includes('call') && (
            <button onClick={() => onAct({ playerIndex: heroIndex, type: 'call' })}>Call {toCall}</button>
          )}
          {actions.includes('raise') && (
            <>
              <input type="number" value={raiseTo || state.minRaiseTo} min={state.minRaiseTo} onChange={(e) => setRaiseTo(parseInt(e.target.value || '0', 10))} style={{ width: 80 }} />
              <button onClick={() => onAct({ playerIndex: heroIndex, type: 'raise', amount: raiseTo || state.minRaiseTo })}>Raise</button>
            </>
          )}
        </>
      ) : (
        <div>Waiting for opponents…</div>
      )}
    </div>
  );
}


