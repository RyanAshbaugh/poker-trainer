import type { Card, GameState, Player, Position, TableConfig } from './types';
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

  return {
    handId,
    dealerIndex,
    street: 'preflop',
    deck: deck.slice(deckIndex),
    board: [],
    players,
  };
}


