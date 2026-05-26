// ─── IPL Player ─────────────────────────────────────────────────────────────

export type BattingStyle =
  | 'Right-hand bat'
  | 'Left-hand bat';

export type BowlingStyle =
  | 'Right-arm fast'
  | 'Right-arm medium'
  | 'Right-arm medium-fast'
  | 'Left-arm fast'
  | 'Left-arm medium'
  | 'Left-arm medium-fast'
  | 'Right-arm offbreak'
  | 'Right-arm legbreak'
  | 'Left-arm orthodox'
  | 'Left-arm chinaman'
  | 'Slow left-arm orthodox'
  | 'None';

export type PlayerRole =
  | 'Batter'
  | 'Bowler'
  | 'All-rounder'
  | 'Wicket-keeper Batter';

export interface IPLPlayer {
  id: string;
  name: string;
  fullName: string;
  nationality: string;
  role: PlayerRole;
  battingStyle: BattingStyle;
  bowlingStyle: BowlingStyle;
  teams: string[];
  isCaptain: boolean;
  hasBeenCaptain: boolean;
  trophies: number;
  yearsActive: string;
  iconicTraits: string[];
  jerseyNumber?: number;
  isMVP?: boolean;
  isOverseas: boolean;
}

// ─── IPL Team ───────────────────────────────────────────────────────────────

export interface IPLTeam {
  id: string;
  name: string;
  shortName: string;
  homeCity: string;
  homeGround: string;
  foundedYear: number;
  titles: number;
  titleYears: number[];
  captains: string[];
  currentCaptain: string;
  iconicPlayers: string[];
  primaryColor: string;
  secondaryColor: string;
  owner: string;
  rivalTeam: string;
  isDefunct: boolean;
}

// ─── IPL Match ──────────────────────────────────────────────────────────────

export interface IPLMatch {
  id: string;
  title: string;
  season: number;
  date: string;
  venue: string;
  team1: string;
  team2: string;
  winner: string;
  marginOfVictory: string;
  playerOfTheMatch: string;
  description: string;
  iconicMoments: string[];
  significance: string;
  matchType: 'league' | 'qualifier' | 'eliminator' | 'final';
}

// ─── IPL Season ─────────────────────────────────────────────────────────────

export interface IPLSeason {
  year: number;
  winner: string;
  runnerUp: string;
  orangeCap: string;
  purpleCap: string;
  playerOfTheTournament: string;
  hostCountry: string;
}
