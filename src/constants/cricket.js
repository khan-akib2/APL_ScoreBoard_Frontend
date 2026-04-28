/** Cricket domain constants shared across the frontend */

export const DISMISSAL_TYPES = [
  'bowled',
  'caught',
  'run out',
  'lbw',
  'stumped',
  'hit wicket',
  'retired out',
];

export const EXTRAS_TYPES = {
  WIDE:           'wd',
  NO_BALL:        'nb',
  NO_BALL_FF:     'nb-ff',   // front foot
  NO_BALL_2B:     'nb-2b',   // 2 bounce
  NO_BALL_WH:     'nb-wh',   // waist high
  BYE:            'b',
  LEG_BYE:        'lb',
};

export const PLAYER_ROLES = ['batsman', 'bowler', 'allrounder', 'wicketkeeper'];

export const MATCH_STAGES = {
  GROUP: 'group',
  SEMI:  'semi',
  FINAL: 'final',
};

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE:      'live',
  COMPLETED: 'completed',
};

export const GROUNDS = ['Ground 1', 'Ground 2'];

export const GROUPS = ['A', 'B'];

export const DEFAULT_OVERS = 5;
export const BALLS_PER_OVER = 6;
