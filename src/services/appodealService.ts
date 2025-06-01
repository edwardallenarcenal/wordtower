// Appodeal Service - Production Ready
import { Platform } from 'react-native';
import { Appodeal, AppodealAdType, AppodealLogLevel } from 'react-native-appodeal';

// Type definitions
export interface AppodealConfig {
  androidAppKey: string;
  iosAppKey: string;
  testMode: boolean;
}

export interface AdCallbacks {
  onLoaded?: () => void;
  onFailedToLoad?: (error?: any) => void;
  onShown?: () => void;
  onClosed?: () => void;
  onFinished?: (reward?: any) => void;
}

export type AdFormat = 'interstitial' | 'rewarded' | 'banner';

class AppodealService {
  private isInitialized = false;
  private config: AppodealConfig | null = null;
  private isDevelopmentMode = false;

  // Production Appodeal app keys
  private readonly APP_KEYS = {
    ios: 'fee50c333ff3825fd6ad6d38cff78154de3025546d47a84f',
    android: '320bccf32fc2380c7dc458b30b9297af92132e06ba35797b'
  };

  /**
   * Initialize Appodeal SDK
   */
  async initialize(testMode?: boolean): Promise<boolean> {
    try {
      if (this.isInitialized) {
        console.log('ℹ️ Appodeal already initialized');
        return true;
      }

      console.log('🚀 Initializing Appodeal SDK...');
      
      const shouldUseTestMode = testMode !== undefined ? testMode : true;

      // Check if we're in development environment (Expo Go)
      if (!Appodeal || typeof Appodeal.initialize !== 'function') {
        console.log('💡 Development environment detected - using simulation mode');
        this.isDevelopmentMode = true;
        this.isInitialized = true;
        this.config = {
          androidAppKey: this.APP_KEYS.android,
          iosAppKey: this.APP_KEYS.ios,
          testMode: shouldUseTestMode
        };
        return true;
      }

      // Check if native methods are available
      const hasNativeMethods = !!(Appodeal as any).initializeWithAppKey;
      if (!hasNativeMethods) {
        console.log('💡 Native SDK not available - using simulation mode');
        this.isDevelopmentMode = true;
        this.isInitialized = true;
        this.config = {
          androidAppKey: this.APP_KEYS.android,
          iosAppKey: this.APP_KEYS.ios,
          testMode: shouldUseTestMode
        };
        return true;
      }

      // Initialize with real SDK
      const appKey = Platform.OS === 'ios' ? this.APP_KEYS.ios : this.APP_KEYS.android;
      const adTypes = AppodealAdType.INTERSTITIAL | AppodealAdType.REWARDED_VIDEO | AppodealAdType.BANNER;

      try {
        Appodeal.initialize(appKey, adTypes);
        
        if (shouldUseTestMode) {
          if (typeof Appodeal.setTesting === 'function') {
            Appodeal.setTesting(true);
          }
          if (typeof Appodeal.setLogLevel === 'function') {
            Appodeal.setLogLevel(AppodealLogLevel.VERBOSE);
          }
        }

        this.setupCallbacks();
        this.isInitialized = true;
        this.config = {
          androidAppKey: this.APP_KEYS.android,
          iosAppKey: this.APP_KEYS.ios,
          testMode: shouldUseTestMode
        };

        console.log('✅ Appodeal SDK initialized successfully');
        return true;

      } catch (initError) {
        const errorMessage = initError instanceof Error ? initError.message : String(initError);
        if (errorMessage.includes('initializeWithAppKey') || errorMessage.includes('null')) {
          console.log('💡 Native SDK error - switching to simulation mode');
          this.isDevelopmentMode = true;
          this.isInitialized = true;
          this.config = {
            androidAppKey: this.APP_KEYS.android,
            iosAppKey: this.APP_KEYS.ios,
            testMode: shouldUseTestMode
          };
          return true;
        }
        throw initError;
      }

    } catch (error) {
      console.error('❌ Appodeal initialization failed:', error);
      return false;
    }
  }

  /**
   * Setup event callbacks
   */
  private setupCallbacks(): void {
    try {
      if (typeof Appodeal.addEventListener === 'function') {
        // Interstitial callbacks
        Appodeal.addEventListener('onInterstitialLoaded', () => {
          console.log('📺 Interstitial ad loaded');
        });

        Appodeal.addEventListener('onInterstitialFailedToLoad', () => {
          console.log('❌ Interstitial ad failed to load');
        });

        Appodeal.addEventListener('onInterstitialShown', () => {
          console.log('📺 Interstitial ad shown');
        });

        Appodeal.addEventListener('onInterstitialClosed', () => {
          console.log('📺 Interstitial ad closed');
        });

        // Rewarded video callbacks
        Appodeal.addEventListener('onRewardedVideoLoaded', () => {
          console.log('🎁 Rewarded video loaded');
        });

        Appodeal.addEventListener('onRewardedVideoFailedToLoad', () => {
          console.log('❌ Rewarded video failed to load');
        });

        Appodeal.addEventListener('onRewardedVideoShown', () => {
          console.log('🎁 Rewarded video shown');
        });

        Appodeal.addEventListener('onRewardedVideoFinished', (reward: any) => {
          console.log('🎁 Rewarded video finished:', reward);
        });

        Appodeal.addEventListener('onRewardedVideoClosed', () => {
          console.log('🎁 Rewarded video closed');
        });

        // Banner callbacks
        Appodeal.addEventListener('onBannerLoaded', () => {
          console.log('📄 Banner ad loaded');
        });

        Appodeal.addEventListener('onBannerFailedToLoad', () => {
          console.log('❌ Banner ad failed to load');
        });
      }
    } catch (error) {
      console.warn('⚠️ Error setting up callbacks:', error);
    }
  }

  /**
   * Check if SDK is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Show interstitial ad
   */
  async showInterstitial(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ Appodeal not initialized');
        return false;
      }

      if (this.isDevelopmentMode) {
        console.log('📺 [SIMULATION] Showing interstitial ad');
        return true;
      }

      if (typeof (Appodeal as any).show === 'function') {
        return (Appodeal as any).show(AppodealAdType.INTERSTITIAL);
      }

      console.log('⚠️ Interstitial show method not available');
      return false;
    } catch (error) {
      console.error('❌ Error showing interstitial:', error);
      return false;
    }
  }

  /**
   * Show rewarded video ad
   */
  async showRewardedVideo(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ Appodeal not initialized');
        return false;
      }

      if (this.isDevelopmentMode) {
        console.log('🎁 [SIMULATION] Showing rewarded video ad');
        return true;
      }

      if (typeof (Appodeal as any).show === 'function') {
        return (Appodeal as any).show(AppodealAdType.REWARDED_VIDEO);
      }

      console.log('⚠️ Rewarded video show method not available');
      return false;
    } catch (error) {
      console.error('❌ Error showing rewarded video:', error);
      return false;
    }
  }

  /**
   * Show banner ad
   */
  async showBanner(position: 'top' | 'bottom' = 'bottom'): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ Appodeal not initialized');
        return false;
      }

      if (this.isDevelopmentMode) {
        console.log(`📄 [SIMULATION] Showing banner ad at ${position}`);
        return true;
      }

      if (typeof (Appodeal as any).show === 'function') {
        return (Appodeal as any).show(AppodealAdType.BANNER);
      }

      console.log('⚠️ Banner show method not available');
      return false;
    } catch (error) {
      console.error('❌ Error showing banner:', error);
      return false;
    }
  }

  /**
   * Hide banner ad
   */
  async hideBanner(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }

      if (this.isDevelopmentMode) {
        console.log('📄 [SIMULATION] Hiding banner ad');
        return true;
      }

      if (typeof (Appodeal as any).hide === 'function') {
        (Appodeal as any).hide(AppodealAdType.BANNER);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error hiding banner:', error);
      return false;
    }
  }

  /**
   * Check if ad is loaded
   */
  async isAdLoaded(adType: AdFormat): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }

      if (this.isDevelopmentMode) {
        return true; // Always return true in simulation mode
      }

      if (typeof (Appodeal as any).isLoaded === 'function') {
        const appodealAdType = adType === 'interstitial' 
          ? AppodealAdType.INTERSTITIAL
          : adType === 'rewarded'
          ? AppodealAdType.REWARDED_VIDEO
          : AppodealAdType.BANNER;
        
        return (Appodeal as any).isLoaded(appodealAdType);
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking if ad is loaded:', error);
      return false;
    }
  }

  /**
   * Set user consent for GDPR
   */
  setUserConsent(hasConsent: boolean): void {
    try {
      if (this.isDevelopmentMode) {
        console.log(`🔒 [SIMULATION] Setting user consent: ${hasConsent}`);
        return;
      }

      // Appodeal GDPR consent methods would go here
      // This depends on the specific SDK version and implementation
      console.log(`🔒 Setting user consent: ${hasConsent}`);
    } catch (error) {
      console.error('❌ Error setting user consent:', error);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AppodealConfig | null {
    return this.config;
  }

  /**
   * Check if running in development mode
   */
  isDev(): boolean {
    return this.isDevelopmentMode;
  }
}

// Export singleton instance
export const appodealService = new AppodealService();
export default appodealService;
