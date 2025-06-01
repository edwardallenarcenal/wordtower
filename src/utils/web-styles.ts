import { StyleSheet } from 'react-native';

/**
 * Web-specific styles for the game
 */
export const webStyles = StyleSheet.create({
  container: {
    maxWidth: 600,
    margin: 'auto',
    height: '100%' as any, // Type assertion for web-specific value
    overflow: 'hidden',
  },
  gameArea: {
    maxWidth: 500,
    margin: 'auto',
  },
  letterBlock: {
    cursor: 'pointer',
  },
  responsiveText: {
    textAlign: 'center',
  }
});

/**
 * Media query-like conditional styles for web
 * @param {Object} dimensions - Contains width and height of screen
 * @returns Object with conditional styles
 */
export const getResponsiveStyles = (dimensions: any) => {
  const { width } = dimensions;
  
  if (width < 480) {
    return {
      letterBlockSize: 40,
      fontSize: {
        small: 10,
        medium: 14,
        large: 18,
      }
    };
  }
  
  if (width < 768) {
    return {
      letterBlockSize: 45,
      fontSize: {
        small: 12,
        medium: 16,
        large: 20,
      }
    };
  }
  
  return {
    letterBlockSize: 50,
    fontSize: {
      small: 14,
      medium: 18,
      large: 24,
    }
  };
};
