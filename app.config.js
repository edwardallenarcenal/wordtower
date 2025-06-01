const baseConfig = require('./app.json');

module.exports = {
  ...baseConfig.expo,
  platforms: ['ios', 'android'],
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    '**/*',
    'assets/audio/*'
  ],
  plugins: [
    'expo-av',
    ['expo-config-plugin-appodeal', {
      androidAppKey: '320bccf32fc2380c7dc458b30b9297af92132e06ba35797b', // Test Android app key from Appodeal
      iosAppKey: 'fee50c333ff3825fd6ad6d38cff78154de3025546d47a84f', // Test iOS app key from Appodeal
      adTypes: ['interstitial', 'rewarded_video', 'banner'],
      testMode: false // Production mode
    }],
    './plugins/android-manifest-merger-fix.js', // Fix for Android manifest conflicts
    './plugins/google-play-services-fix.js' // Specific fix for Google Play Services AD_SERVICES_CONFIG conflict
  ],
  splash: {
    ...baseConfig.expo.splash,
    backgroundColor: '#FFF5FA'
  },
  ios: {
    ...baseConfig.expo.ios,
    bundleIdentifier: 'com.tamarawtech.wordtower',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false
    }
  },
  android: {
    ...baseConfig.expo.android,
    package: 'com.tamarawtech.wordtower',
    adaptiveIcon: {
      ...baseConfig.expo.android.adaptiveIcon,
      backgroundColor: '#FFF5FA'
    },
    // Add AdMob App ID metadata
    config: {
      googleMobileAdsAppId: "ca-app-pub-2305335662986677~7114732323"
    },
    // Force resolution of Google Play Services AD_SERVICES_CONFIG conflict
    manifestPlaceholders: {
      "appodealAppKey": "320bccf32fc2380c7dc458b30b9297af92132e06ba35797b"
    },
    // Add permissions required for ads
    permissions: [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.WAKE_LOCK",
      "com.google.android.gms.permission.AD_ID"
    ]
  },
  extra: {
    eas: {
      projectId: "555b37b3-dd20-4757-8849-f22849ebd419"
    }
  }
};
