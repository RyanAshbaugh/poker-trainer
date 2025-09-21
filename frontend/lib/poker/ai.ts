import type { Action, GameState } from './types';
import { legalActions } from './engine';

export function decideSimpleAI(state: GameState): Action | null {
  const idx = state.toActIndex;
  const actions = legalActions(state);
  if (actions.length === 0) return null;
  const toCall = state.currentBet - state.players[idx].contributedThisStreet;
  if (actions.includes('check')) return { playerIndex: idx, type: 'check' };
  if (toCall <= Math.min(2, state.players[idx].stack) && actions.includes('call')) return { playerIndex: idx, type: 'call' };
  return { playerIndex: idx, type: 'fold' };
}


