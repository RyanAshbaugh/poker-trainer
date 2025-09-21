import { useCallback, useMemo, useReducer } from 'react';
import type { Action, GameState, TableConfig } from '../lib/poker/types';
import { initHand, applyAction } from '../lib/poker/engine';
import { decideSimpleAI } from '../lib/poker/ai';

type Internal = { type: 'NEW_HAND'; seed?: number } | { type: 'APPLY'; action: Action } | { type: 'AUTO' };

function reducer(state: GameState | null, action: Internal): GameState | null {
  switch (action.type) {
    case 'NEW_HAND':
      return initHand(state ?? undefined, { rngSeed: action.seed });
    case 'APPLY':
      return state ? applyAction(state, action.action) : state;
    case 'AUTO': {
      // advance AI until hero's turn or street advances
      if (!state) return state;
      let curr = state;
      let safety = 50;
      while (safety-- > 0) {
        if (curr.toActIndex === 0) break;
        const ai = decideSimpleAI(curr);
        if (!ai) break;
        const next = applyAction(curr, ai);
        if (next.street !== curr.street) {
          curr = next;
          continue;
        }
        curr = next;
        if (curr.toActIndex === 0) break;
      }
      return curr;
    }
    default:
      return state;
  }
}

export function useGame(initial?: { config?: Partial<TableConfig> }) {
  const [state, dispatch] = useReducer(reducer, null);

  const startNewHand = useCallback((seed?: number) => {
    dispatch({ type: 'NEW_HAND', seed });
    setTimeout(() => dispatch({ type: 'AUTO' }), 0);
  }, []);

  const act = useCallback((a: Action) => {
    dispatch({ type: 'APPLY', action: a });
    setTimeout(() => dispatch({ type: 'AUTO' }), 0);
  }, []);

  return useMemo(() => ({ state, startNewHand, act }), [state, startNewHand, act]);
}


