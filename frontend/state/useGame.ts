import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { Action, GameState, TableConfig } from '../lib/poker/types';
import { initHand, applyAction } from '../lib/poker/engine';
import { decideSimpleAI } from '../lib/poker/ai';

type Internal = { type: 'NEW_HAND'; seed?: number } | { type: 'APPLY'; action: Action };

function reducer(state: GameState | null, action: Internal): GameState | null {
  switch (action.type) {
    case 'NEW_HAND':
      return initHand(state ?? undefined, { rngSeed: action.seed });
    case 'APPLY': {
      if (!state) return state;
      const next = applyAction(state, action.action);
      return next;
    }
    default:
      return state;
  }
}

export function useGame(initial?: { config?: Partial<TableConfig> }) {
  const [state, dispatch] = useReducer(reducer, null);

  const startNewHand = useCallback((seed?: number) => {
    dispatch({ type: 'NEW_HAND', seed });
  }, []);

  const act = useCallback((a: Action) => {
    dispatch({ type: 'APPLY', action: a });
  }, []);

  // Auto-play opponents with a short delay between actions so UI updates between streets
  useEffect(() => {
    if (!state) return;
    // Reset globals each state change
    (window as any).__POKER_THINKING_INDEX__ = -1;
    (window as any).__POKER_THINKING_START__ = 0;
    (window as any).__POKER_THINKING_UNTIL__ = 0;
    (window as any).__POKER_HOLD_INDEX__ = -1;
    (window as any).__POKER_HOLD_UNTIL__ = 0;
    (window as any).__POKER_LAST_ACTION__ = undefined;

    // Expose minimal read-only hints for UI highlights/last action in 2D view
    (window as any).__POKER_STATE_TOACT__ = state.toActIndex;
    const last = (state as any)._lastAction as { playerIndex: number } | undefined;
    if (last) {
      (window as any).__POKER_LAST_ACTION__ = last;
      // Hold highlight on the actor that just acted for a brief post-action pause
      (window as any).__POKER_HOLD_INDEX__ = last.playerIndex;
      (window as any).__POKER_HOLD_UNTIL__ = performance.now() + 800;
    }
    if (state.street === 'showdown') return;
    if (state.toActIndex === 0) return; // hero's turn
    const thinkMs = 2000;
    const holdMs = last && last.playerIndex !== state.toActIndex ? 800 : 0;
    const startAt = performance.now() + holdMs;
    (window as any).__POKER_THINKING_INDEX__ = state.toActIndex;
    (window as any).__POKER_THINKING_START__ = startAt;
    (window as any).__POKER_THINKING_UNTIL__ = startAt + thinkMs;
    const timer = setTimeout(() => {
      const ai = decideSimpleAI(state);
      if (ai) {
        dispatch({ type: 'APPLY', action: ai });
      }
    }, holdMs + thinkMs);
    return () => clearTimeout(timer);
  }, [state]);

  return useMemo(() => ({ state, startNewHand, act }), [state, startNewHand, act]);
}


