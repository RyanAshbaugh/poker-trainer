import { useCallback, useMemo, useReducer } from 'react';
import type { GameState, TableConfig } from '../lib/poker/types';
import { initHand } from '../lib/poker/engine';

type Action = { type: 'NEW_HAND'; seed?: number };

function reducer(state: GameState | null, action: Action): GameState | null {
  switch (action.type) {
    case 'NEW_HAND':
      return initHand(state ?? undefined, { rngSeed: action.seed });
    default:
      return state;
  }
}

export function useGame(initial?: { config?: Partial<TableConfig> }) {
  const [state, dispatch] = useReducer(reducer, null);

  const startNewHand = useCallback((seed?: number) => {
    dispatch({ type: 'NEW_HAND', seed });
  }, []);

  return useMemo(() => ({ state, startNewHand }), [state, startNewHand]);
}


