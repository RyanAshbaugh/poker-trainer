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
  contributedThisStreet: number;
  contributedTotal: number;
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
  toActIndex: number; // absolute seat index
  currentBet: number;
  minRaiseTo: number;
  pot: number;
  remainingToAct: number; // players left to act this round (resets on bet/raise)
  winners?: { playerIndex: number; amount: number; hand: Card[]; description: string }[];
};

export type ActionType = 'fold' | 'check' | 'call' | 'raise';
export type Action = {
  playerIndex: number; // absolute seat index
  type: ActionType;
  amount?: number; // for raise-to only
};

export type LastAction = {
  playerIndex: number;
  type: ActionType;
  paid: number; // chips moved to pot for this action
  toAmount?: number; // for raise-to displayed amount
};

export type HistoryEvent = { street: Street; text: string };

export const DEFAULT_CONFIG: TableConfig = {
  numSeats: 6,
  smallBlind: 1,
  bigBlind: 2,
  ante: 0,
  startingStack: 200,
};


