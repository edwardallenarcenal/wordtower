export type RootStackParamList = {
  Home: undefined;
  Game: {
    category: string;
    startLevel?: number; // Optional parameter to start at a specific level
  };
  Settings: undefined;
  Results: {
    player: Player;
    category: string;
    wordsFound: number;
    totalWords: number;
    timeLeft: number;
    level: number;
    isLevelComplete: boolean; // true if level completed, false if time ran out
  };
};

export interface Block {
  id: string;
  letter: string;
  isUsed: boolean;
  position: {
    x: number;
    y: number;
  };
}

export interface Word {
  id: string;
  word: string;
  playerId: string;
  blocks: Block[];
  isValid: boolean;
}

export interface Player {
  id: string;
  name: string;
  words: Word[];
}

export interface GameState {
  timeRemaining: number; // Time remaining in seconds
  category: string;
  targetWords: string[];
  discoveredWords: string[];
  player: Player;
  availableBlocks: Block[];
  gameStatus: 'waiting' | 'playing' | 'finished';
  currentWord: {
    blocks: Block[];
    isValid: boolean;
  };
  level: number; // Current level (starts at 1)
  wordsPerLevel: number; // Number of words for current level
}
