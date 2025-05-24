import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface AudioSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
}

export type SoundEffectName = 
  | 'blockSelect'
  | 'blockDeselect'
  | 'wordComplete'
  | 'groupComplete'
  | 'gameComplete'
  | 'buttonClick'
  | 'hint'
  | 'error';

class AudioService {
  private backgroundMusic: Audio.Sound | null = null;
  private soundEffects: { [key: string]: Audio.Sound } = {};
  private audioEnabled: boolean = true;
  private settings: AudioSettings = {
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.7,
    musicVolume: 0.3,
  };

  async initialize() {
    try {
      // Set audio mode for proper iOS/Android behavior
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Try to preload sound effects, but don't fail if audio files are missing
      await this.preloadSounds();
      console.log('Audio service initialized successfully');
    } catch (error) {
      console.warn('Audio service initialization failed - disabling audio:', error instanceof Error ? error.message : 'Unknown error');
      this.audioEnabled = false;
      // Don't throw error - allow game to continue without audio
    }
  }

  private async preloadSounds() {
    console.log('Loading audio files...');
    
    const sounds = {
      blockSelect: require('../../assets/audio/blockSelect.mp3'),
      blockDeselect: require('../../assets/audio/blockDeselect.mp3'),
      // wordComplete.wav is empty, so we'll skip it for now
      // wordComplete: require('../../assets/audio/wordComplete.wav'),
      groupComplete: require('../../assets/audio/groupComplete.mp3'),
      gameComplete: require('../../assets/audio/gameComplete.mp3'),
      buttonClick: require('../../assets/audio/buttonClick.mp3'),
      hint: require('../../assets/audio/hint.mp3'),
      error: require('../../assets/audio/error.mp3'),
    };

    // Try to preload each sound individually, continue even if some fail
    for (const [key, source] of Object.entries(sounds)) {
      try {
        const { sound } = await Audio.Sound.createAsync(source, {
          shouldPlay: false,
          volume: this.settings.soundVolume,
        });
        this.soundEffects[key] = sound;
        console.log(`✅ Loaded sound effect: ${key}`);
      } catch (error) {
        console.warn(`Failed to load sound effect '${key}':`, error instanceof Error ? error.message : 'Unknown error');
        // Continue loading other sounds even if this one fails
      }
    }
  }

  async playBackgroundMusic() {
    if (!this.audioEnabled || !this.settings.musicEnabled) return;

    console.log('Starting background music...');
    
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.stopAsync();
        await this.backgroundMusic.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/audio/backgroundMusic.mp3'),
        {
          shouldPlay: true,
          isLooping: true,
          volume: this.settings.musicVolume,
        }
      );

      this.backgroundMusic = sound;
      console.log('✅ Background music started successfully');
    } catch (error) {
      console.warn('Failed to play background music:', error instanceof Error ? error.message : 'Unknown error');
      // Don't disable all audio, just log warning so sound effects can still work
    }
  }

  async stopBackgroundMusic() {
    if (this.backgroundMusic) {
      try {
        await this.backgroundMusic.stopAsync();
        await this.backgroundMusic.unloadAsync();
        this.backgroundMusic = null;
      } catch (error) {
        console.error('Failed to stop background music:', error);
      }
    }
  }

  async pauseBackgroundMusic() {
    if (this.backgroundMusic) {
      try {
        await this.backgroundMusic.pauseAsync();
      } catch (error) {
        console.error('Failed to pause background music:', error);
      }
    }
  }

  async resumeBackgroundMusic() {
    if (this.backgroundMusic && this.settings.musicEnabled) {
      try {
        await this.backgroundMusic.playAsync();
      } catch (error) {
        console.error('Failed to resume background music:', error);
      }
    }
  }

  async playSoundEffect(effectName: SoundEffectName) {
    if (!this.audioEnabled || !this.settings.soundEnabled) return;

    // Handle special case for wordComplete - use groupComplete as fallback since wordComplete.wav is empty
    let soundKey = effectName;
    if (effectName === 'wordComplete' && !this.soundEffects['wordComplete']) {
      soundKey = 'groupComplete';
      console.log('Using groupComplete sound as fallback for wordComplete');
    }

    const sound = this.soundEffects[soundKey];
    if (sound) {
      try {
        await sound.replayAsync();
        console.log(`🔊 Played sound effect: ${effectName}`);
      } catch (error) {
        console.warn(`Failed to play sound effect ${effectName}:`, error instanceof Error ? error.message : 'Unknown error');
        // Don't throw error, just log warning so game continues to work
      }
    } else {
      // Sound effect not loaded, silently continue
      console.warn(`Sound effect '${effectName}' not available`);
    }
  }

  updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };

    // Update volumes for existing sounds
    Object.values(this.soundEffects).forEach(async (sound) => {
      try {
        await sound.setVolumeAsync(this.settings.soundVolume);
      } catch (error) {
        console.error('Failed to update sound volume:', error);
      }
    });

    if (this.backgroundMusic) {
      this.backgroundMusic.setVolumeAsync(this.settings.musicVolume);
    }

    // Handle music enable/disable
    if (!this.settings.musicEnabled && this.backgroundMusic) {
      this.pauseBackgroundMusic();
    } else if (this.settings.musicEnabled && this.backgroundMusic) {
      this.resumeBackgroundMusic();
    }
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  async cleanup() {
    try {
      // Stop and unload background music
      if (this.backgroundMusic) {
        await this.backgroundMusic.stopAsync();
        await this.backgroundMusic.unloadAsync();
      }

      // Unload all sound effects
      for (const sound of Object.values(this.soundEffects)) {
        await sound.unloadAsync();
      }

      this.backgroundMusic = null;
      this.soundEffects = {};
    } catch (error) {
      console.error('Audio cleanup failed:', error);
    }
  }
}

export const audioService = new AudioService();
