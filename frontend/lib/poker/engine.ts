import type { Action, Card, GameState, Player, Position, TableConfig } from './types';
import { DEFAULT_CONFIG } from './types';
import { createDeck, shuffle } from './cards';

function seatPositions(numSeats: number, dealerIndex: number): Position[] {
  // 6-max: BTN, SB, BB, UTG, HJ, CO (clockwise)
  const ring: Position[] = ['BTN','SB','BB','UTG','HJ','CO'];
  const ordered: Position[] = new Array(numSeats) as Position[];
  for (let i = 0; i < numSeats; i++) {
    const idx = (dealerIndex + i) % numSeats;
    ordered[idx] = ring[i];
  }
  return ordered;
}

function createPlayers(numSeats: number, startingStack: number): Player[] {
  const players: Player[] = [];
  for (let i = 0; i < numSeats; i++) {
    players.push({
      id: `P${i+1}`,
      name: i === 0 ? 'Hero' : `Villain ${i}`,
      seatIndex: i,
      position: 'BTN', // placeholder, set later
      stack: startingStack,
      inHand: true,
      allIn: false,
      isHero: i === 0,
      contributedThisStreet: 0,
      contributedTotal: 0,
    });
  }
  return players;
}

export function initHand(prev?: Partial<GameState>, cfg?: Partial<TableConfig> & { rngSeed?: number }): GameState {
  const config: TableConfig = { ...DEFAULT_CONFIG, ...cfg } as TableConfig;
  const handId = (prev?.handId ?? 0) + 1;
  const dealerIndex = prev?.dealerIndex !== undefined ? (prev!.dealerIndex + 1) % config.numSeats : 0;
  const deck = shuffle(createDeck(), config.rngSeed);
  const players = createPlayers(config.numSeats, config.startingStack);
  const pos = seatPositions(config.numSeats, dealerIndex);
  for (let i = 0; i < players.length; i++) players[i].position = pos[i];

  // Deal two hole cards, starting SB clockwise one at a time (common live dealing)
  // Here, start from SB seatIndex (dealerIndex + 1)
  const start = (dealerIndex + 1) % config.numSeats;
  let deckIndex = 0;
  for (let round = 0; round < 2; round++) {
    for (let offset = 0; offset < config.numSeats; offset++) {
      const idx = (start + offset) % config.numSeats;
      const card = deck[deckIndex++] as Card;
      const p = players[idx];
      p.hole = p.hole ? [p.hole[0], card] : [card, undefined as unknown as Card];
    }
  }
  // Clean undefined from tuple second pass
  for (const p of players) {
    if (p.hole && (p.hole as any)[1] === undefined) {
      (p.hole as any)[1] = deck[deckIndex++] as Card;
    }
  }

  // Post blinds
  const sbIndex = (dealerIndex + 1) % config.numSeats;
  const bbIndex = (dealerIndex + 2) % config.numSeats;
  players[sbIndex].stack -= config.smallBlind;
  players[sbIndex].contributedThisStreet += config.smallBlind;
  players[sbIndex].contributedTotal += config.smallBlind;
  players[bbIndex].stack -= config.bigBlind;
  players[bbIndex].contributedThisStreet += config.bigBlind;
  players[bbIndex].contributedTotal += config.bigBlind;

  const currentBet = config.bigBlind;
  const minRaiseTo = config.bigBlind * 2;
  const pot = config.smallBlind + config.bigBlind;
  const toActIndex = (dealerIndex + 3) % config.numSeats; // UTG preflop

  return {
    handId,
    dealerIndex,
    street: 'preflop',
    deck: deck.slice(deckIndex),
    board: [],
    players,
    toActIndex,
    currentBet,
    minRaiseTo,
    pot,
    remainingToAct: players.filter(p => p.inHand && !p.allIn).length,
  };
}

export function legalActions(state: GameState): ('fold'|'check'|'call'|'raise')[] {
  const p = state.players[state.toActIndex];
  if (!p.inHand || p.allIn) return [];
  const toCall = state.currentBet - p.contributedThisStreet;
  const actions: ('fold'|'check'|'call'|'raise')[] = [];
  if (toCall <= 0) {
    actions.push('check');
    if (p.stack > 0) actions.push('raise');
  } else {
    actions.push('fold');
    actions.push('call');
    if (p.stack + Math.min(0, toCall) > toCall) actions.push('raise');
  }
  return actions;
}

function nextToActIndex(state: GameState): number {
  const n = state.players.length;
  for (let i = 1; i <= n; i++) {
    const idx = (state.toActIndex + i) % n;
    const p = state.players[idx];
    if (p.inHand && !p.allIn) return idx;
  }
  return state.toActIndex;
}

function firstActiveFrom(state: GameState, startIdx: number): number {
  const n = state.players.length;
  for (let i = 0; i < n; i++) {
    const idx = (startIdx + i) % n;
    const p = state.players[idx];
    if (p.inHand && !p.allIn) return idx;
  }
  return startIdx;
}

function isBettingRoundClosed(state: GameState): boolean {
  // Closed if remainingToAct cycles back to 0 and all contributions are equal to currentBet OR only one remains
  const active = state.players.filter(p => p.inHand && !p.allIn);
  if (active.length <= 1) return true;
  const everyoneCaughtUp = active.every(p => p.contributedThisStreet === state.currentBet);
  return everyoneCaughtUp && state.remainingToAct <= 0;
}

export function applyAction(state: GameState, action: Action): GameState {
  const s: GameState = JSON.parse(JSON.stringify(state));
  const p = s.players[action.playerIndex];
  if (!p.inHand || p.allIn) return s;
  const toCall = s.currentBet - p.contributedThisStreet;

  switch (action.type) {
    case 'fold':
      p.inHand = false;
      s.remainingToAct -= 1;
      break;
    case 'check':
      s.remainingToAct -= 1;
      break;
    case 'call': {
      const amt = Math.min(toCall, p.stack);
      p.stack -= amt;
      p.contributedThisStreet += amt;
      p.contributedTotal += amt;
      s.pot += amt;
      if (p.stack === 0) p.allIn = true;
      s.remainingToAct -= 1;
      break;
    }
    case 'raise': {
      const raiseTo = Math.max(action.amount ?? s.minRaiseTo, s.minRaiseTo);
      const need = raiseTo - p.contributedThisStreet;
      const amt = Math.min(need, p.stack + Math.max(0, toCall));
      const newTo = p.contributedThisStreet + amt;
      const raiseSize = raiseTo - s.currentBet;
      p.stack -= amt;
      p.contributedThisStreet += amt;
      p.contributedTotal += amt;
      s.pot += amt;
      s.minRaiseTo = raiseTo + raiseSize; // next min raise-to
      s.currentBet = Math.max(s.currentBet, newTo);
      if (p.stack === 0) p.allIn = true;
      // On a raise, reset remainingToAct to number of other active players
      s.remainingToAct = s.players.filter(x => x.inHand && !x.allIn && x !== p).length;
      break;
    }
  }

  if (isBettingRoundClosed(s)) {
    return advance(s);
  }
  s.toActIndex = nextToActIndex(s);
  return s;
}

export function advance(state: GameState): GameState {
  const s: GameState = JSON.parse(JSON.stringify(state));
  // Reset contributed this street
  for (const p of s.players) p.contributedThisStreet = 0;

  if (s.street === 'preflop') {
    // Deal flop
    s.board.push(s.deck[0], s.deck[1], s.deck[2]);
    s.deck = s.deck.slice(3);
    s.street = 'flop';
  } else if (s.street === 'flop') {
    s.board.push(s.deck[0]);
    s.deck = s.deck.slice(1);
    s.street = 'turn';
  } else if (s.street === 'turn') {
    s.board.push(s.deck[0]);
    s.deck = s.deck.slice(1);
    s.street = 'river';
  } else if (s.street === 'river') {
    s.street = 'showdown';
  }

  // New street betting variables
  s.currentBet = 0;
  s.minRaiseTo = 0;
  // Postflop first to act is first active player left of dealer
  s.toActIndex = firstActiveFrom(s, (s.dealerIndex + 1) % s.players.length);
  s.remainingToAct = s.players.filter(p => p.inHand && !p.allIn).length;
  return s;
}


