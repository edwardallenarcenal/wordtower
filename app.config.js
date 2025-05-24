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
    'expo-av'
  ],
  splash: {
    ...baseConfig.expo.splash,
    backgroundColor: '#FFF5FA'
  },
  android: {
    ...baseConfig.expo.android,
    adaptiveIcon: {
      ...baseConfig.expo.android.adaptiveIcon,
      backgroundColor: '#FFF5FA'
    }
  },
  
};
