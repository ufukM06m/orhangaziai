export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  mode?: 'gemini' | 'fallback';
}

export interface HistoricalMilestone {
  id: string;
  year: number;
  title: string;
  subtitle: string;
  description: string;
  details: string;
  iconName: string;
  badge: string;
  quote: string;
  location?: string;
  keyFigures?: string[];
  region?: string;
}

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
