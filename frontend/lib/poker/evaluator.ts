import type { Card } from './types';

// Simple hand evaluator: ranks hands using categories then kickers
// Not fully optimized; sufficient for basic gameplay.

const RANK_ORDER = '23456789TJQKA';

function rankValue(r: string): number { return RANK_ORDER.indexOf(r); }

function parse(card: Card) {
  return { r: card[0], s: card[1] } as { r: string; s: string };
}

function combinations<T>(arr: T[], k: number): T[][] {
  const res: T[][] = [];
  const track: T[] = [];
  function backtrack(start: number) {
    if (track.length === k) { res.push(track.slice()); return; }
    for (let i = start; i < arr.length; i++) { track.push(arr[i]); backtrack(i + 1); track.pop(); }
  }
  backtrack(0);
  return res;
}

function evaluate5(cards: Card[]): { score: number; description: string } {
  // score: higher is better. Encodes category then ranks.
  const ranks = cards.map(c => parse(c).r).sort((a, b) => rankValue(a) - rankValue(b));
  const suits = cards.map(c => parse(c).s);
  const counts: Record<string, number> = {};
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1;
  const unique = Object.keys(counts).sort((a,b)=> (counts[b]-counts[a]) || (rankValue(b)-rankValue(a)));
  const isFlush = suits.every(s => s === suits[0]);
  const values = ranks.map(rankValue).sort((a,b)=>a-b);
  const isWheel = ranks.join('') === '2345A';
  const straight = (() => {
    let v = values.slice();
    if (isWheel) v = [0,1,2,3,12];
    for (let i = 1; i < v.length; i++) if (v[i] !== v[i-1] + 1) return -1;
    return v[v.length-1];
  })();

  const encode = (cat: number, kickers: number[]) => {
    let score = cat << 20;
    let shift = 16;
    for (const k of kickers) { score |= (k & 0x1F) << shift; shift -= 4; }
    return score;
  };

  if (straight >= 0 && isFlush) return { score: encode(8, [straight]), description: 'Straight Flush' };
  if (counts[unique[0]] === 4) return { score: encode(7, [rankValue(unique[0]), rankValue(unique[1])]), description: 'Four of a Kind' };
  if (counts[unique[0]] === 3 && counts[unique[1]] === 2) return { score: encode(6, [rankValue(unique[0]), rankValue(unique[1])]), description: 'Full House' };
  if (isFlush) return { score: encode(5, values.slice().reverse()), description: 'Flush' };
  if (straight >= 0) return { score: encode(4, [straight]), description: 'Straight' };
  if (counts[unique[0]] === 3) {
    const kickers = ranks.filter(r => r !== unique[0]).map(rankValue).sort((a,b)=>b-a);
    return { score: encode(3, [rankValue(unique[0]), ...kickers]), description: 'Three of a Kind' };
  }
  if (counts[unique[0]] === 2 && counts[unique[1]] === 2) {
    const pair1 = rankValue(unique[0]);
    const pair2 = rankValue(unique[1]);
    const kicker = rankValue(unique[2]);
    return { score: encode(2, [pair1, pair2, kicker]), description: 'Two Pair' };
  }
  if (counts[unique[0]] === 2) {
    const pair = rankValue(unique[0]);
    const kickers = ranks.filter(r => r !== unique[0]).map(rankValue).sort((a,b)=>b-a);
    return { score: encode(1, [pair, ...kickers]), description: 'One Pair' };
  }
  return { score: encode(0, ranks.map(rankValue).sort((a,b)=>b-a)), description: 'High Card' };
}

export function bestHand(cards7: Card[]): { score: number; hand: Card[]; description: string } {
  let best = { score: -1, hand: [] as Card[], description: '' };
  for (const combo of combinations(cards7, 5)) {
    const r = evaluate5(combo);
    if (r.score > best.score) best = { score: r.score, hand: combo, description: r.description };
  }
  return best;
}


