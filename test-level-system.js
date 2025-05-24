// Test script to verify level system logic
console.log('Testing level progression system...');

// Function from useGameLogic.ts
const getWordsForLevel = (level) => {
  return Math.min(2 + level, 8); // Start with 3 words (2+1), max 8 words
};

// Test level progression
console.log('\nLevel progression:');
for (let level = 1; level <= 10; level++) {
  const wordsForLevel = getWordsForLevel(level);
  console.log(`Level ${level}: ${wordsForLevel} words`);
}

console.log('\nLevel system test completed!');
