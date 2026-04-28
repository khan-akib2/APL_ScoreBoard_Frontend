/** Pure utility functions for cricket calculations — no React, no side effects */

import { BALLS_PER_OVER } from '@/constants/cricket';

/**
 * Calculate current run rate.
 * @param {number} runs
 * @param {number} overs  - completed overs
 * @param {number} balls  - balls in current over
 * @returns {string} formatted to 2 decimal places
 */
export function calcRunRate(runs, overs, balls) {
  const totalBalls = overs * BALLS_PER_OVER + balls;
  if (totalBalls === 0) return '0.00';
  return ((runs / totalBalls) * BALLS_PER_OVER).toFixed(2);
}

/**
 * Calculate required run rate.
 * @param {number} runsNeeded
 * @param {number} ballsRemaining
 * @returns {string}
 */
export function calcRequiredRunRate(runsNeeded, ballsRemaining) {
  if (ballsRemaining <= 0 || runsNeeded <= 0) return '0.0';
  return ((runsNeeded / ballsRemaining) * BALLS_PER_OVER).toFixed(1);
}

/**
 * Balls remaining in the innings.
 */
export function ballsLeft(totalOvers, overs, balls) {
  return Math.max(0, totalOvers * BALLS_PER_OVER - (overs * BALLS_PER_OVER + balls));
}

/**
 * Display overs as "X.Y"
 */
export function oversDisplay(overs, balls) {
  return `${overs}.${balls}`;
}

/**
 * Batsman strike rate
 */
export function strikeRate(runs, balls) {
  if (balls === 0) return '—';
  return ((runs / balls) * 100).toFixed(0);
}

/**
 * Bowler economy rate
 */
export function economyRate(runs, overs, balls) {
  const totalBalls = overs * BALLS_PER_OVER + balls;
  if (totalBalls === 0) return '0.0';
  return ((runs / totalBalls) * BALLS_PER_OVER).toFixed(1);
}

/**
 * Label for a ball badge in the over timeline.
 */
export function ballLabel(ball) {
  if (!ball) return '·';
  if (ball.isWicket) return 'W';
  if (ball.extras === 'wd') return 'Wd';
  if (ball.extras === 'nb' || ball.extras?.startsWith('nb-')) return 'Nb';
  if (ball.extras === 'b')  return `B${ball.runs > 1 ? ball.runs : ''}`;
  if (ball.extras === 'lb') return `Lb${ball.runs > 1 ? ball.runs : ''}`;
  if (ball.extras?.startsWith('ot')) return `${ball.runs}+${ball.extras.replace('ot', '')}`;
  return String(ball.runs);
}

/**
 * Inline style for a ball badge.
 */
export function ballStyle(ball) {
  if (!ball) return { background: '#0a1628', color: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.05)' };
  if (ball.isWicket) return { background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)' };
  if (ball.runs >= 6 || ball.extras?.startsWith('ot')) return { background: 'rgba(243,197,112,0.2)', color: '#F3C570', border: '1px solid rgba(243,197,112,0.4)' };
  if (ball.runs === 4) return { background: 'rgba(161,189,203,0.2)', color: '#8aacbf', border: '1px solid rgba(161,189,203,0.4)' };
  if (ball.extras === 'wd' || ball.extras?.startsWith('nb')) return { background: 'rgba(255,165,0,0.15)', color: '#ffa500', border: '1px solid rgba(255,165,0,0.3)' };
  return { background: '#0a1628', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' };
}

/**
 * Build commentary string for a delivery.
 */
export function buildCommentary(runs, isWicket, dismissalType, extras, extraRuns) {
  if (isWicket) return `WICKET! ${dismissalType}`;
  if (extras === 'wd')  return `Wide${runs > 0 ? ` +${runs}` : ''}`;
  if (extras?.startsWith('nb')) return `No Ball${runs > 0 ? ` +${runs}` : ''}`;
  if (extras === 'b')   return `Bye ${runs}`;
  if (extras === 'lb')  return `Leg Bye ${runs}`;
  if (extras?.startsWith('ot')) return `${runs} + ${extraRuns} Overthrow`;
  return `${runs} run${runs !== 1 ? 's' : ''}`;
}

/**
 * Extract player ID string from a player field (may be object or string).
 */
export function playerId(player) {
  if (!player) return '';
  return typeof player === 'object' ? player._id : player;
}
