import React, { useMemo, useState } from 'react';
import type { Card, Player } from '../../lib/poker/types';
import { createDeck } from '../../lib/poker/cards';
import { bestHand } from '../../lib/poker/evaluator';

type Props = {
  players: Player[];
  board: Card[];
  pot: number;
  currentBet: number;
  bigBlind?: number;
};

function removeCards(deck: Card[], used: Card[]): Card[] {
  const usedSet = new Set(used);
  return deck.filter(c => !usedSet.has(c));
}

function countBetterHands(heroBestScore: number, usedCards: Card[]): { count: number; total: number; pct: number } {
  const deck = removeCards(createDeck(), usedCards);
  // Enumerate all distinct 2-card combinations for opponents
  let total = 0;
  let better = 0;
  for (let i = 0; i < deck.length; i++) {
    for (let j = i + 1; j < deck.length; j++) {
      const oppHole = [deck[i], deck[j]] as [Card, Card];
      const oppBest = bestHand([...board, ...oppHole] as Card[]);
      total++;
      if (oppBest.score > heroBestScore) better++;
    }
  }
  return { count: better, total, pct: total ? better / total : 0 };
}

// Simple pot odds and implied odds helpers
function computePotOdds(toCall: number, pot: number) {
  if (toCall <= 0) return { ratio: 'N/A', requiredEquity: 0 };
  const requiredEquity = toCall / (pot + toCall);
  const a = (pot / toCall).toFixed(2);
  return { ratio: `${a}:1`, requiredEquity };
}

export function HandAnalysis({ players, board, pot, currentBet, bigBlind = 2 }: Props) {
  const hero = players.find(p => p.isHero);
  const heroHole = hero?.hole;

  const [open, setOpen] = useState<{ [k: string]: boolean }>({});
  const toggle = (k: string) => setOpen(o => ({ ...o, [k]: !o[k] }));

  const data = useMemo(() => {
    if (!heroHole) return null;
    const used = [...board, ...heroHole];
    const heroCards = [...board, ...heroHole] as Card[];
    const haveFive = heroCards.length >= 5;
    const heroBest = haveFive ? bestHand(heroCards) : { score: -1, hand: [], description: board.length === 0 ? 'Preflop' : 'In progress' };

    // Percentile approximation by enumerating random subset or full set of all 5-card boards from deck with hero's hand.
    // Here we compute rank among all 7-card combos containing heroHole against random opponent 2-card hands on current street.
    // For simplicity now: ranking vs random single opponent hole.
    const canCompareOppNow = board.length >= 3; // need board+oppHole to make 5 cards
    const better = canCompareOppNow ? countBetterHands(heroBest.score, [...board, ...heroHole] as Card[]) : { count: 0, total: 0, pct: 0 };
    const rankVsRandom = canCompareOppNow ? (1 - better.pct) : NaN;

    // Draws and outs (basic): if flop/turn, count board-completions that improve hero category by at least one tier
    let drawChances: { label: string; outs: number; roll: 'turn' | 'river' | 'turn+river'; pct: number }[] = [];
    const deck = removeCards(createDeck(), used);
    const street = board.length;
    const baselineScore = heroBest.score;
    const consider = (cardsLeft: number) => {
      const total = deck.length;
      return cardsLeft / total;
    };
    if (street === 3 && haveFive) { // flop -> one-card turn improvement chance
      let outs = 0;
      for (const c of deck) {
        const turnBest = bestHand([...(board as Card[]), c, ...heroHole] as Card[]);
        if (turnBest.score > baselineScore) outs++;
      }
      drawChances.push({ label: 'Any improvement on turn', outs, roll: 'turn', pct: deck.length ? outs / deck.length : 0 });
    } else if (street === 4 && haveFive) { // turn -> river improvement
      let outs = 0;
      for (const c of deck) {
        const riverBest = bestHand([...(board as Card[]), c, ...heroHole] as Card[]);
        if (riverBest.score > baselineScore) outs++;
      }
      drawChances.push({ label: 'Any improvement on river', outs, roll: 'river', pct: deck.length ? outs / deck.length : 0 });
    }

    // Pot odds (approximate toCall as difference between currentBet and hero contributedThisStreet)
    const toCall = Math.max(0, currentBet - (hero?.contributedThisStreet ?? 0));
    const potOdds = computePotOdds(toCall, pot);

    // SPR as simple stack-to-pot ratio (effective hero stack vs pot)
    const effective = Math.min(
      hero?.stack ?? 0,
      ...players.filter(p => p !== hero && p.inHand).map(p => p.stack)
    );
    const spr = pot > 0 ? (effective / pot) : 0;
    const impliedMaxRatio = toCall > 0 ? ((pot + toCall + Math.max(0, effective - toCall)) / toCall - 1) : 0;

    return {
      description: heroBest.description,
      score: heroBest.score,
      rankVsRandom,
      betterNow: better,
      drawChances,
      potOdds,
      spr,
      impliedMaxRatio,
    };
  }, [players, board, pot, currentBet, bigBlind, heroHole]);

  if (!heroHole || !data) return (
    <div style={{ fontSize: 12, color: '#666' }}>Waiting for hand...</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div><strong>Current Hand</strong>: {data.description}</div>

      <details open={open.rank ?? true} onToggle={() => toggle('rank')}>
        <summary>My hand strength vs random</summary>
        <div style={{ paddingTop: 6 }}>
          {Number.isNaN(data.rankVsRandom) ? (
            <div>Available from the flop onward.</div>
          ) : (
            <div>Percentile estimate: {(data.rankVsRandom * 100).toFixed(1)}%</div>
          )}
        </div>
      </details>

      <details>
        <summary>Hands that beat me (now)</summary>
        <div style={{ paddingTop: 6 }}>
          {data.betterNow.total === 0 ? (
            <div>N/A before the flop.</div>
          ) : (
            <>
              <div>Count: {data.betterNow.count} of {data.betterNow.total} combos</div>
              <div>Prevalence: {(data.betterNow.pct * 100).toFixed(2)}%</div>
            </>
          )}
        </div>
      </details>

      <details>
        <summary>Draws and improvement chances</summary>
        <div style={{ paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {data.drawChances.length === 0 ? (
            <div>No immediate draws to improve on this street.</div>
          ) : data.drawChances.map((d, i) => (
            <div key={i}>{d.label}: {d.outs} outs, { (d.pct * 100).toFixed(1) }% on {d.roll}</div>
          ))}
        </div>
      </details>

      <details>
        <summary>Pot odds and SPR</summary>
        <div style={{ paddingTop: 6 }}>
          <div>Pot odds: {data.potOdds.ratio} (need {(data.potOdds.requiredEquity * 100).toFixed(1)}% equity)</div>
          <div>SPR: {data.spr.toFixed(2)}</div>
          {Number.isFinite(data.impliedMaxRatio) && (
            <div>Implied odds (upper bound): {data.impliedMaxRatio.toFixed(2)}:1</div>
          )}
        </div>
      </details>
    </div>
  );
}

export default HandAnalysis;


