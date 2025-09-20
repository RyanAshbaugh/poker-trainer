export type Suit = 'c' | 'd' | 'h' | 's';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Card = `${Rank}${Suit}`;

export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
export type Position = 'BTN' | 'SB' | 'BB' | 'UTG' | 'HJ' | 'CO';

export type PlayerId = string;

export type Player = {
  id: PlayerId;
  name: string;
  seatIndex: number;
  position: Position;
  stack: number;
  hole?: [Card, Card];
  inHand: boolean;
  allIn: boolean;
  isHero: boolean;
};

export type TableConfig = {
  numSeats: 6;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  startingStack: number;
  rngSeed?: number;
};

export type GameState = {
  handId: number;
  dealerIndex: number;
  street: Street;
  deck: Card[];
  board: Card[];
  players: Player[];
};

export const DEFAULT_CONFIG: TableConfig = {
  numSeats: 6,
  smallBlind: 1,
  bigBlind: 2,
  ante: 0,
  startingStack: 200,
};


