# Audio Assets for Word Tower Game

This directory contains all audio files used in the Word Tower game. The audio files are integrated with the AudioService class to provide background music and sound effects throughout the game.

## Current Audio Files

All audio files are now populated with temporary sound effects from freesound.org:

- **background-music.mp3** - Background music that plays during gameplay (currently a short success sound, should be replaced with proper looping music)
- **block-select.mp3** - Sound when selecting a letter block
- **block-deselect.mp3** - Sound when deselecting a letter block  
- **word-complete.mp3** - Sound when successfully completing a word
- **group-complete.mp3** - Sound when completing a word group/category
- **game-complete.mp3** - Sound when completing the entire game
- **button-click.mp3** - Sound for UI button interactions
- **hint.mp3** - Sound when using a hint
- **error.mp3** - Sound for invalid actions or errors

## Integration

These audio files are loaded and managed by the AudioService (`src/services/audioService.ts`) which provides:

- Background music control with volume adjustment
- Sound effects playback with volume control
- Settings persistence for audio preferences
- Proper cleanup and memory management

## Usage

The audio files are automatically loaded when the AudioService initializes and are played through various game interactions:

- Game logic hooks (`useGameLogic.ts`)
- Screen components (HomeScreen, GameScreen, SettingsScreen, ResultsScreen)
- User interface interactions

## Future Improvements

- Replace temporary audio files with proper game-specific sound effects
- Add longer background music tracks suitable for looping
- Consider adding multiple music tracks for variety
- Add ambient sounds or additional feedback sounds

## Technical Details

- Format: MP3 (compatible with both iOS and Android)
- Current files: Downloaded from freesound.org as temporary placeholders
- Integration: Fully integrated with expo-av and AudioService
- Controls: Volume settings and enable/disable options available in Settings screen
