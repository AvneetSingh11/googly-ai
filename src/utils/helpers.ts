import { v4 as uuidv4 } from 'uuid';

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 90) return 'Almost certain';
  if (confidence >= 75) return 'Very confident';
  if (confidence >= 60) return 'Getting warmer';
  if (confidence >= 40) return 'Narrowing down';
  if (confidence >= 20) return 'Still exploring';
  return 'Just starting';
}

export function getPersonaDisplayName(mode: string): string {
  const personas: Record<string, string> = {
    analyst: 'The Analyst',
    entertainer: 'The Entertainer',
    cocky: 'The Showman',
    panicked: 'Under Pressure',
    dramatic: 'The Dramatist',
  };
  return personas[mode] || 'Googly AI';
}

export function getPersonaColor(mode: string): string {
  const colors: Record<string, string> = {
    analyst: '#39FF14',
    entertainer: '#5E0ED7',
    cocky: '#FFD700',
    panicked: '#FF3B3B',
    dramatic: '#FFFFFF',
  };
  return colors[mode] || '#39FF14';
}

export function generateGameId(): string {
  return uuidv4();
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
