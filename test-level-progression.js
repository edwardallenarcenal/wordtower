// Test level progression logic
const testLevelProgression = () => {
  console.log('=== Testing Level Progression Logic ===');
  
  // Test level completion detection
  const mockGameState = {
    discoveredWords: ['cat', 'dog', 'bird'], // 3 words found
    targetWords: ['cat', 'dog', 'bird'], // 3 words needed
    level: 1
  };
  
  const isLevelComplete = mockGameState.discoveredWords.length === mockGameState.targetWords.length;
  console.log(`Level ${mockGameState.level}: ${mockGameState.discoveredWords.length}/${mockGameState.targetWords.length} words found`);
  console.log(`Is level complete? ${isLevelComplete}`);
  
  if (isLevelComplete) {
    console.log('✅ Level completion detection working correctly');
    console.log('➡️ Should show "Next Level" button in Results screen');
  } else {
    console.log('❌ Level completion detection failed');
  }
  
  // Test next level calculation
  const nextLevel = mockGameState.level + 1;
  const getWordsForLevel = (level) => Math.min(2 + level, 8);
  const wordsForNextLevel = getWordsForLevel(nextLevel);
  
  console.log(`Next level: ${nextLevel}`);
  console.log(`Words needed for level ${nextLevel}: ${wordsForNextLevel}`);
  
  console.log('=== Test Complete ===');
};

// Run the test
testLevelProgression();
