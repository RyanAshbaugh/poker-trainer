import type { Card, Rank, Suit } from './types';

const RANKS: Rank[] = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
const SUITS: Suit[] = ['c','d','h','s'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const r of RANKS) {
    for (const s of SUITS) {
      deck.push(`${r}${s}` as Card);
    }
  }
  return deck;
}

// Mulberry32 PRNG for deterministic shuffles
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(deck: Card[], seed?: number): Card[] {
  const out = deck.slice();
  const rand = seed === undefined ? Math.random : mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}


