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
    if (state.street === 'showdown') return;
    if (state.toActIndex === 0) return; // hero's turn
    const timer = setTimeout(() => {
      const ai = decideSimpleAI(state);
      if (ai) {
        dispatch({ type: 'APPLY', action: ai });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [state]);

  return useMemo(() => ({ state, startNewHand, act }), [state, startNewHand, act]);
}


