module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@constants': './src/constants',
            '@hooks': './src/hooks',
            '@services': './src/services',
            '@types': './src/types',
            '@utils': './src/utils',
            '@assets': './src/assets'
          }
        }
      ]
    ]
  };
};
