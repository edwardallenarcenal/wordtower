// Ad Integration Service - Specific to Word Tower Game Logic
import { appodealService } from './appodealService';
import { audioService } from './audioService';

export interface AdReward {
  type: 'hints' | 'time' | 'level_unlock';
  amount: number;
}

class AdIntegrationService {
  private gamesSinceLastInterstitial = 0;
  private readonly INTERSTITIAL_FREQUENCY = 3; // Show ad every 3 games
  private readonly MIN_GAME_TIME_FOR_AD = 30; // Only show ads after 30+ seconds of gameplay

  /**
   * Initialize ads when the app starts
   * Call this in your App.tsx or HomeScreen.tsx
   */
  async initializeAds(): Promise<void> {
    try {
      console.log('🚀 Initializing Word Tower ads...');
      const success = await appodealService.initialize();
      
      if (success) {
        console.log('✅ Word Tower ads ready!');
      } else {
        console.log('⚠️ Ads not available, continuing without monetization');
      }
    } catch (error) {
      console.error('❌ Ad initialization error:', error);
    }
  }

  /**
   * Check if ads are available
   */
  isAdsAvailable(): boolean {
    return appodealService.isReady();
  }

  // =============================================================================
  // INTERSTITIAL ADS - Between gameplay sessions
  // =============================================================================

  /**
   * Show interstitial ad after completing a game/level
   * Called from ResultsScreen or when returning to HomeScreen
   */
  async showGameCompletionAd(gameTimeSeconds: number): Promise<boolean> {
    try {
      // Don't show ads for very short games (user might have quit immediately)
      if (gameTimeSeconds < this.MIN_GAME_TIME_FOR_AD) {
        console.log('⏱️ Game too short for ad');
        return false;
      }

      this.gamesSinceLastInterstitial++;
      
      // Show ad based on frequency
      if (this.gamesSinceLastInterstitial >= this.INTERSTITIAL_FREQUENCY) {
        console.log('🎯 Time for interstitial ad!');
        
        // Pause background music during ad
        await audioService.pauseBackgroundMusic();
        
        const adShown = await appodealService.showInterstitial();
        
        if (adShown) {
          this.gamesSinceLastInterstitial = 0;
          
          // Resume music after a short delay (ad callback will handle this better in real implementation)
          setTimeout(() => {
            audioService.playBackgroundMusic();
          }, 2000);
          
          return true;
        } else {
          // Resume music if ad failed to show
          audioService.playBackgroundMusic();
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error showing game completion ad:', error);
      audioService.playBackgroundMusic(); // Ensure music resumes
      return false;
    }
  }

  /**
   * Show interstitial when user navigates back to home screen
   * Called from GameScreen when user taps home button
   */
  async showHomeNavigationAd(): Promise<boolean> {
    try {
      const isLoaded = await appodealService.isAdLoaded('interstitial');
      if (isLoaded && this.gamesSinceLastInterstitial >= 2) {
        return await appodealService.showInterstitial();
      }
      return false;
    } catch (error) {
      console.error('❌ Error showing home navigation ad:', error);
      return false;
    }
  }

  // =============================================================================
  // REWARDED VIDEO ADS - For game benefits
  // =============================================================================

  /**
   * Show rewarded video for extra hints
   * Called from GameScreen when user taps "Watch Ad for Hints" button
   */
  async showRewardedHintsAd(): Promise<AdReward | null> {
    try {
      console.log('🎁 Showing rewarded ad for hints...');
      
      const isLoaded = await appodealService.isAdLoaded('rewarded');
      if (!isLoaded) {
        console.log('📭 Rewarded video not ready');
        return null;
      }

      // Pause background music during ad
      await audioService.pauseBackgroundMusic();
      
      const adWatched = await appodealService.showRewardedVideo();
      
      // Resume music
      setTimeout(() => {
        audioService.playBackgroundMusic();
      }, 1000);
      
      if (adWatched) {
        // Reward: 3 extra hints
        return {
          type: 'hints',
          amount: 3
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error showing rewarded hints ad:', error);
      audioService.playBackgroundMusic();
      return null;
    }
  }

  /**
   * Show rewarded video for extra time
   * Called from GameScreen when user is running low on time
   */
  async showRewardedTimeAd(): Promise<AdReward | null> {
    try {
      console.log('⏰ Showing rewarded ad for extra time...');
      
      const isLoaded = await appodealService.isAdLoaded('rewarded');
      if (!isLoaded) {
        return null;
      }

      await audioService.pauseBackgroundMusic();
      const adWatched = await appodealService.showRewardedVideo();
      
      setTimeout(() => {
        audioService.playBackgroundMusic();
      }, 1000);
      
      if (adWatched) {
        // Reward: 60 extra seconds
        return {
          type: 'time',
          amount: 60
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error showing rewarded time ad:', error);
      audioService.playBackgroundMusic();
      return null;
    }
  }

  /**
   * Show rewarded video to unlock next level early
   * Called from ResultsScreen when user wants to skip level progression
   */
  async showRewardedLevelUnlockAd(): Promise<AdReward | null> {
    try {
      console.log('🔓 Showing rewarded ad for level unlock...');
      
      const adWatched = await appodealService.showRewardedVideo();
      
      if (adWatched) {
        return {
          type: 'level_unlock',
          amount: 1
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error showing rewarded level unlock ad:', error);
      return null;
    }
  }

  // =============================================================================
  // BANNER ADS - Non-intrusive placement
  // =============================================================================

  /**
   * Show banner on home screen
   * Called when HomeScreen mounts
   */
  async showHomeBanner(): Promise<void> {
    try {
      if (!appodealService.isReady()) return;
      
      console.log('📄 Showing home screen banner...');
      await appodealService.showBanner('bottom');
    } catch (error) {
      console.error('❌ Error showing home banner:', error);
    }
  }

  /**
   * Show banner on results screen
   * Called when ResultsScreen mounts
   */
  async showResultsBanner(): Promise<void> {
    try {
      if (!appodealService.isReady()) return;
      
      console.log('📄 Showing results screen banner...');
      await appodealService.showBanner('bottom');
    } catch (error) {
      console.error('❌ Error showing results banner:', error);
    }
  }

  /**
   * Hide banner when entering gameplay
   * Called when GameScreen mounts
   */
  async hideGameplayBanner(): Promise<void> {
    try {
      console.log('🙈 Hiding banner for gameplay...');
      await appodealService.hideBanner();
    } catch (error) {
      console.error('❌ Error hiding gameplay banner:', error);
    }
  }

  // =============================================================================
  // AD AVAILABILITY CHECKS
  // =============================================================================

  /**
   * Check if rewarded hints are available
   * Used to show/hide "Watch Ad for Hints" button in GameScreen
   */
  async isRewardedHintsAvailable(): Promise<boolean> {
    try {
      return await appodealService.isAdLoaded('rewarded');
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if rewarded time boost is available
   * Used to show emergency time boost option when timer is low
   */
  async isRewardedTimeAvailable(): Promise<boolean> {
    try {
      return await appodealService.isAdLoaded('rewarded');
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if interstitial will show after this game
   * Used to prepare users or adjust game flow
   */
  willShowInterstitialAfterGame(): boolean {
    return this.gamesSinceLastInterstitial >= (this.INTERSTITIAL_FREQUENCY - 1);
  }

  // =============================================================================
  // STATISTICS & ANALYTICS
  // =============================================================================

  /**
   * Reset ad frequency counter (for testing or special events)
   */
  resetAdFrequency(): void {
    this.gamesSinceLastInterstitial = 0;
    console.log('🔄 Ad frequency counter reset');
  }

  /**
   * Get current ad statistics
   */
  getAdStats(): { gamesSinceLastAd: number; frequency: number; nextAdIn: number } {
    return {
      gamesSinceLastAd: this.gamesSinceLastInterstitial,
      frequency: this.INTERSTITIAL_FREQUENCY,
      nextAdIn: Math.max(0, this.INTERSTITIAL_FREQUENCY - this.gamesSinceLastInterstitial)
    };
  }

  /**
   * Update GDPR consent for ads
   */
  setUserConsent(hasConsent: boolean): void {
    appodealService.setUserConsent(hasConsent);
  }
}

// Export singleton instance
export const adIntegrationService = new AdIntegrationService();
export default adIntegrationService;
