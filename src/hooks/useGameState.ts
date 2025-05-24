import { useState } from 'react';
import { GameState, Word, Block } from '../types';

const GAME_TIME = 180; // 3 minutes in seconds

const INITIAL_STATE: GameState = {
  category: '',
  targetWords: [],
  discoveredWords: [],
  timeRemaining: GAME_TIME,
  player: {
    id: 'player1',
    name: 'Player',
    words: []
  },
  availableBlocks: [],
  gameStatus: 'waiting',
  currentWord: {
    blocks: [],
    isValid: false
  }
};

export const useGameState = (category: string) => {
  const [gameState, setGameState] = useState<GameState>({
    ...INITIAL_STATE,
    category,
    timeRemaining: GAME_TIME,
    player: {
      id: 'player1',
      name: 'Player',
      words: []
    }
  });

  const addWord = (wordBlocks: Block[]) => {
    const word = wordBlocks.map(b => b.letter).join('');
    const newWord: Word = {
      id: Date.now().toString(),
      word,
      playerId: gameState.player.id,
      blocks: wordBlocks,
      isValid: true
    };

    setGameState(prev => {
      return {
        ...prev,
        player: {
          ...prev.player,
          words: [...prev.player.words, newWord]
        },
        discoveredWords: [...prev.discoveredWords, word],
        currentWord: { blocks: [], isValid: false }
      };
    });
  };

  const updateCurrentWord = (blocks: Block[]) => {
    setGameState(prev => ({
      ...prev,
      currentWord: {
        blocks,
        isValid: false // Validation should be done elsewhere
      }
    }));
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...INITIAL_STATE,
      category: prev.category,
      timeRemaining: GAME_TIME,
      player: {
        ...prev.player,
        words: []
      }
    }));
  };

  return {
    gameState,
    addWord,
    updateCurrentWord,
    resetGame,
  };
};
