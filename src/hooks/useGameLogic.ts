import { useState, useCallback, useEffect } from 'react';
import { Block, GameState, Player, Word } from '../types';
import { CATEGORIES, generateBlocksFromWords, isWordPossible } from '../services/categories';
import { audioService } from '../services/audioService';

// Initialize audio service once when the module loads
audioService.initialize();

const GAME_TIME = 180; // 3 minutes in seconds

const generateBlocks = (category: string): { blocks: Block[], targetWords: string[] } => {
  const categoryData = CATEGORIES[category];
  if (!categoryData) throw new Error(`Category ${category} not found`);

  // Select 3 random words from the category
  const selectedWords = [...categoryData.words]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(w => w.word);

  // Generate and shuffle blocks from the selected words
  const letters = generateBlocksFromWords(selectedWords);
  
  // Create Block objects
  const blocks = letters.map((letter, index) => ({
    id: `b${index}`,
    letter,
    isUsed: false,
    position: { x: 0, y: 0 },
  }));

  return { blocks, targetWords: selectedWords };
};

export const useGameLogic = (category: string) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const { blocks, targetWords } = generateBlocks(category);
    return {
      category,
      targetWords,
      discoveredWords: [],
      timeRemaining: GAME_TIME,
      player: {
        id: 'player1',
        name: 'Player',
        words: [],
      },
      availableBlocks: blocks,
      gameStatus: 'waiting',
      currentWord: {
        blocks: [],
        isValid: false,
      },
    };
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.gameStatus === 'playing' && gameState.timeRemaining > 0) {
      interval = setInterval(() => {
        setGameState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          if (newTimeRemaining <= 0) {
            return {
              ...prev,
              timeRemaining: 0,
              gameStatus: 'finished' as GameState['gameStatus'],
            };
          }
          return {
            ...prev,
            timeRemaining: newTimeRemaining,
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState.gameStatus]);

  const validateWord = useCallback((blocks: Block[]): { isValid: boolean; message?: string } => {
    const word = blocks.map(b => b.letter).join('').toLowerCase();
    
    // Check if word is empty
    if (blocks.length === 0) {
      return { isValid: false, message: 'Please select some letters first!' };
    }

    // Check if word is too short
    if (blocks.length < 3) {
      return { isValid: false, message: 'Word must be at least 3 letters long!' };
    }

    // Check if word is one of the target words and hasn't been discovered
    const isValidWord = gameState.targetWords.includes(word);
    const isAlreadyDiscovered = gameState.discoveredWords.includes(word);

    if (!isValidWord) {
      return { isValid: false, message: 'Not a valid word in this category!' };
    }

    if (isAlreadyDiscovered) {
      return { isValid: false, message: 'This word has already been found!' };
    }

    // Check if the word can be formed from available blocks
    try {
      if (!isWordPossible(word, blocks.map(b => b.letter))) {
        return { isValid: false, message: 'Cannot form this word with the selected letters!' };
      }
    } catch (error) {
      console.error('Error checking if word is possible:', error);
      return { isValid: false, message: 'Error validating word. Please try again.' };
    }

    return { isValid: true, message: 'Valid word!' };
  }, [gameState.targetWords, gameState.discoveredWords]);

  const selectBlock = useCallback((block: Block) => {
    if (block.isUsed || gameState.gameStatus !== 'playing' || gameState.timeRemaining <= 0) return;

    // Play block select sound
    audioService.playSoundEffect('blockSelect');

    setGameState(prev => {
      const newBlocks = [...prev.currentWord.blocks, block];
      const validation = validateWord(newBlocks);

      return {
        ...prev,
        currentWord: {
          blocks: newBlocks,
          isValid: validation.isValid,
        },
        availableBlocks: prev.availableBlocks.map(b => 
          b.id === block.id ? { ...b, isUsed: true } : b
        ),
      };
    });
  }, [gameState.gameStatus, gameState.timeRemaining, validateWord]);

  const submitWord = useCallback(async () => {
    try {
      if (gameState.timeRemaining <= 0) {
        audioService.playSoundEffect('error');
        return { success: false, message: 'Time is up!' };
      }

      // Validate the word
      const validation = validateWord(gameState.currentWord.blocks);

      if (!validation.isValid) {
        audioService.playSoundEffect('error');
        return { success: false, message: validation.message };
      }

      // Get the word from the selected blocks
      const word = gameState.currentWord.blocks.map(b => b.letter).join('').toLowerCase();
      
      // Create a new Word object
      const newWord: Word = {
        id: Date.now().toString(),
        word,
        playerId: gameState.player.id,
        blocks: [...gameState.currentWord.blocks],
        isValid: true,
      };

      let newState: GameState;
      
      try {
        // Create a set of current block IDs for faster lookup
        const selectedBlockIds = new Set(gameState.currentWord.blocks.map(block => block.id));
        
        newState = await new Promise<GameState>((resolve, reject) => {
          setGameState(prev => {
            try {
              const newDiscoveredWords = [...prev.discoveredWords, word];
              const isGameFinished = newDiscoveredWords.length === prev.targetWords.length;

              // Update the game state
              const newGameState: GameState = {
                ...prev,
                player: {
                  ...prev.player,
                  words: [...prev.player.words, newWord]
                },
                discoveredWords: newDiscoveredWords,
                currentWord: { blocks: [], isValid: false },
                gameStatus: (isGameFinished ? 'finished' : 'playing') as GameState['gameStatus'],
                // Reset the used status of blocks that were in the submitted word
                availableBlocks: prev.availableBlocks.map(b => 
                  selectedBlockIds.has(b.id)
                    ? { ...b, isUsed: false }  // Reset this block as it was used in the word
                    : { ...b }                 // Leave other blocks unchanged
                ),
              };

              resolve(newGameState);
              return newGameState;
            } catch (error) {
              console.error('Error in game state update:', error);
              reject(error);
              return prev;
            }
          });
        });
      } catch (error) {
        console.error('Error updating game state:', error);
        audioService.playSoundEffect('error');
        return { success: false, message: 'Something went wrong. Please try again.' };
      }

      // Play appropriate sound effect
      if (newState.gameStatus === 'finished') {
        audioService.playSoundEffect('gameComplete');
        audioService.stopBackgroundMusic();
      } else {
        audioService.playSoundEffect('wordComplete');
      }

      return {
        success: true,
        message: 'Word found!',
        isGameFinished: newState.gameStatus === 'finished',
        player: newState.player,
        wordsFound: newState.discoveredWords.length,
        totalWords: newState.targetWords.length,
        timeLeft: newState.timeRemaining
      };
    } catch (error) {
      console.error('Error in submitWord:', error);
      audioService.playSoundEffect('error');
      return { success: false, message: 'Something went wrong. Please try again.' };
    }
  }, [gameState.currentWord.blocks, gameState.player, gameState.discoveredWords, gameState.targetWords.length, validateWord, gameState.timeRemaining]);

  // Function to validate all grouped words
  const validateAllGroupedWords = useCallback((state: GameState) => {
    const invalidWords: string[] = [];
    
    state.player.words.forEach(word => {
      const isValidTargetWord = state.targetWords.includes(word.word);
      if (!isValidTargetWord) {
        invalidWords.push(word.word);
      }
    });

    return {
      allValid: invalidWords.length === 0,
      invalidWords
    };
  }, []);

  // Function to group a word without validation
  const groupWord = useCallback(async () => {
    try {
      if (gameState.timeRemaining <= 0) {
        audioService.playSoundEffect('error');
        return { success: false, message: 'Time is up!' };
      }

      // Check if there are blocks selected
      if (gameState.currentWord.blocks.length === 0) {
        audioService.playSoundEffect('error');
        return { success: false, message: 'Please select some letters first!' };
      }

      // Get the word from the selected blocks
      const word = gameState.currentWord.blocks.map(b => b.letter).join('').toLowerCase();
      
      // Create a new Word object (no validation here)
      const newWord: Word = {
        id: Date.now().toString(),
        word,
        playerId: gameState.player.id,
        blocks: [...gameState.currentWord.blocks],
        isValid: true, // We'll validate later when all blocks are used
      };

      let newState: GameState;
      
      try {
        newState = await new Promise<GameState>((resolve, reject) => {
          setGameState(prev => {
            try {
              const newDiscoveredWords = [...prev.discoveredWords, word];

              // Count blocks that are permanently used (in grouped words)
              const usedBlockIds = new Set(
                prev.player.words.flatMap(w => w.blocks.map(b => b.id))
                  .concat(newWord.blocks.map(b => b.id))
              );
              
              // Check if all blocks are used
              const allBlocksUsed = prev.availableBlocks.every(block => 
                usedBlockIds.has(block.id)
              );
              
              const newGameState: GameState = {
                ...prev,
                player: {
                  ...prev.player,
                  words: [...prev.player.words, newWord]
                },
                discoveredWords: newDiscoveredWords,
                currentWord: { blocks: [], isValid: false },
                // Don't change game status here - we'll validate when all blocks are used
                gameStatus: prev.gameStatus,
                // Mark the blocks in this word as permanently used
                availableBlocks: prev.availableBlocks.map(b => {
                  const isInCurrentWord = newWord.blocks.some(wb => wb.id === b.id);
                  if (isInCurrentWord) {
                    return { ...b, isUsed: true };
                  }
                  return { ...b };
                }),
              };

              // If all blocks are used, validate all grouped words
              if (allBlocksUsed) {
                const validationResult = validateAllGroupedWords(newGameState);
                if (validationResult.allValid) {
                  newGameState.gameStatus = 'finished';
                } else {
                  // Game is not won - user needs to fix invalid words
                  // We don't change the game status, just continue playing
                }
              }

              resolve(newGameState);
              return newGameState;
            } catch (error) {
              console.error('Error in game state update:', error);
              reject(error);
              return prev;
            }
          });
        });
      } catch (error) {
        console.error('Error updating game state:', error);
        audioService.playSoundEffect('error');
        return { success: false, message: 'Something went wrong. Please try again.' };
      }

      // Check if all blocks are used and validate if needed
      const usedBlockIds = new Set(
        newState.player.words.flatMap(w => w.blocks.map(b => b.id))
      );
      const allBlocksUsed = newState.availableBlocks.every(block => 
        usedBlockIds.has(block.id)
      );

      if (allBlocksUsed) {
        const validationResult = validateAllGroupedWords(newState);
        if (!validationResult.allValid) {
          audioService.playSoundEffect('error');
          return {
            success: true,
            message: `All blocks used! However, some words are incorrect: ${validationResult.invalidWords.join(', ')}. Please fix them to win!`,
            isGameFinished: false,
            player: newState.player,
            wordsFound: newState.discoveredWords.length,
            totalWords: newState.targetWords.length,
            timeLeft: newState.timeRemaining,
            needsValidation: true,
            invalidWords: validationResult.invalidWords
          };
        } else {
          audioService.playSoundEffect('gameComplete');
          audioService.stopBackgroundMusic();
          return {
            success: true,
            message: 'Congratulations! All words are correct!',
            isGameFinished: true,
            player: newState.player,
            wordsFound: newState.discoveredWords.length,
            totalWords: newState.targetWords.length,
            timeLeft: newState.timeRemaining
          };
        }
      }

      audioService.playSoundEffect('wordComplete');
      return {
        success: true,
        message: 'Word grouped!',
        isGameFinished: newState.gameStatus === 'finished',
        player: newState.player,
        wordsFound: newState.discoveredWords.length,
        totalWords: newState.targetWords.length,
        timeLeft: newState.timeRemaining
      };
    } catch (error) {
      console.error('Error in groupWord:', error);
      audioService.playSoundEffect('error');
      return { success: false, message: 'Something went wrong. Please try again.' };
    }
  }, [gameState.currentWord.blocks, gameState.player, gameState.discoveredWords, 
      gameState.targetWords, gameState.timeRemaining, gameState.availableBlocks, validateAllGroupedWords]);

  // Function to ungroup a word and return its blocks back to available blocks
  const ungroupWord = useCallback((wordToUngroup: string) => {
    setGameState(prev => {
      try {
        // Find the word in the player's words
        const word = prev.player.words.find(w => w.word === wordToUngroup);
        
        if (!word) {
          console.error('Word not found:', wordToUngroup);
          return prev;
        }
        
        // Create new array of player words without the ungrouped word
        const newPlayerWords = prev.player.words.filter(w => w.word !== wordToUngroup);
        
        // Create new array of discovered words without the ungrouped word
        const newDiscoveredWords = prev.discoveredWords.filter(w => w !== wordToUngroup);
        
        // Mark the blocks from this word as available again
        const updatedBlocks = [...prev.availableBlocks];
        
        // Find each block in the word and mark it as unused
        word.blocks.forEach(wordBlock => {
          const blockIndex = updatedBlocks.findIndex(b => b.id === wordBlock.id);
          if (blockIndex !== -1) {
            updatedBlocks[blockIndex] = {
              ...updatedBlocks[blockIndex],
              isUsed: false
            };
          }
        });
        
        audioService.playSoundEffect('blockDeselect');
        
        return {
          ...prev,
          player: {
            ...prev.player,
            words: newPlayerWords
          },
          discoveredWords: newDiscoveredWords,
          availableBlocks: updatedBlocks
        };
      } catch (error) {
        console.error('Error in ungroupWord:', error);
        return prev;
      }
    });
    
    return { success: true, message: 'Word returned to blocks' };
  }, []);

  const resetWord = useCallback(() => {
    setGameState(prev => {
      if (prev.currentWord.blocks.length > 0) {
        audioService.playSoundEffect('blockDeselect');
      }
      
      // Create a map of block IDs that are in the current word
      const currentWordBlockIds = new Set(prev.currentWord.blocks.map(block => block.id));
      
      return {
        ...prev,
        currentWord: { blocks: [], isValid: false },
        availableBlocks: prev.availableBlocks.map(b => 
          currentWordBlockIds.has(b.id)
            ? { ...b, isUsed: false }
            : b
        ),
      };
    });
  }, []);

  const startGame = useCallback(() => {
    audioService.playBackgroundMusic();
    setGameState(prevState => ({
      ...prevState,
      gameStatus: 'playing',
      timeRemaining: GAME_TIME,
    }));
  }, []);

  // Check if all words have been found
  const checkGameCompletion = useCallback(() => {
    if (gameState.discoveredWords.length === gameState.targetWords.length) {
      audioService.playSoundEffect('gameComplete');
      audioService.stopBackgroundMusic();
      setGameState(prev => ({
        ...prev,
        gameStatus: 'finished'
      }));
      return true;
    }
    return false;
  }, [gameState.discoveredWords.length, gameState.targetWords.length]);

  // Hint function: finds one correct word that can be formed from available blocks
  const getHint = useCallback((): { word: string; blockIds: string[] } | null => {
    // Get available (unused) block letters
    const availableLetters = gameState.availableBlocks
      .filter(block => !block.isUsed)
      .map(block => ({ letter: block.letter.toUpperCase(), id: block.id }));

    console.log('Available letters for hint:', availableLetters.map(l => l.letter).join(''));
    
    // Find target words that haven't been discovered yet
    const undiscoveredWords = gameState.targetWords.filter(
      word => !gameState.discoveredWords.includes(word)
    );
    
    console.log('Undiscovered words:', undiscoveredWords);

    // Check each undiscovered word to see if it can be formed from available blocks
    for (const targetWord of undiscoveredWords) {
      try {
        // Check if this word can be formed with available letters
        const wordLetters = targetWord.toUpperCase().split('');
        const availableLettersCopy = [...availableLetters];
        const requiredBlockIds: string[] = [];

        let canFormWord = true;
        
        console.log(`Checking if word '${targetWord}' can be formed...`);
        
        // Try to match each letter in the word with available blocks
        for (const letter of wordLetters) {
          const blockIndex = availableLettersCopy.findIndex(block => block.letter === letter);
          if (blockIndex === -1) {
            canFormWord = false;
            console.log(`Cannot find letter '${letter}' in available blocks`);
            break;
          }
          
          // Add this block ID to our required list and remove it from available
          requiredBlockIds.push(availableLettersCopy[blockIndex].id);
          availableLettersCopy.splice(blockIndex, 1);
        }

        if (canFormWord) {
          console.log(`Found word that can be formed: ${targetWord}`);
          audioService.playSoundEffect('hint');
          return {
            word: targetWord,
            blockIds: requiredBlockIds
          };
        }
      } catch (error) {
        console.error('Error checking word formation for hint:', error);
        continue;
      }
    }

    console.log('No hint available, no valid words can be formed');
    audioService.playSoundEffect('error');
    return null; // No hint available
  }, [gameState.availableBlocks, gameState.targetWords, gameState.discoveredWords]);

  return {
    gameState,
    selectBlock,
    submitWord,
    groupWord,
    ungroupWord,
    resetWord,
    startGame,
    validateWord,
    validateAllGroupedWords,
    checkGameCompletion,
    getHint
  };
};
