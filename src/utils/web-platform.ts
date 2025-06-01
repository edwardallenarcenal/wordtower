import { Platform, Dimensions } from 'react-native';

/**
 * Helper utilities for web platform-specific behavior
 */
export const isWeb = Platform.OS === 'web';

/**
 * Get appropriate event handler based on platform
 * @param {Object} handlers - Object containing touch and mouse handlers
 * @returns The appropriate handler for the current platform
 */
export const getPlatformHandler = (handlers: any) => {
  if (isWeb) {
    return handlers.web || handlers.default;
  }
  return handlers.mobile || handlers.default;
};

/**
 * Get appropriate styles based on platform
 * @param {Object} styles - Object containing web and mobile styles
 * @returns The appropriate styles for the current platform
 */
export const getPlatformStyles = (styles: any) => {
  if (isWeb) {
    return { ...styles.default, ...styles.web };
  }
  return { ...styles.default, ...styles.mobile };
};

/**
 * Web-specific event handler wrapper
 * @param {Function} handler - The event handler function
 * @returns A new function that handles both touch and mouse events
 */
export const webEventHandler = (handler: any) => {
  if (!isWeb || !handler) return handler;
  
  return (event: any) => {
    // Handle both touch and mouse events for web
    handler(event);
  };
};

/**
 * Apply web-specific attributes to an element
 * This is useful for accessibility and SEO
 * @param {string} role - The ARIA role of the element
 * @returns Object with web-specific props
 */
export const getWebAccessibilityProps = (role: string) => {
  if (!isWeb) return {};
  
  return {
    role,
    tabIndex: 0,
  };
};

/**
 * Get responsive dimensions based on current screen size
 * @returns Object with screen breakpoints and dimensions
 */
export const getResponsiveDimensions = () => {
  const { width, height } = Dimensions.get('window');
  
  return {
    width,
    height,
    isSmallScreen: width < 480,
    isMediumScreen: width >= 480 && width < 768,
    isLargeScreen: width >= 768,
    isLandscape: width > height,
  };
};

/**
 * Add web focus effects to a component (for keyboard navigation)
 * @returns Object with web-specific focus props
 */
export const getWebFocusProps = () => {
  if (!isWeb) return {};
  
  return {
    outlineColor: 'transparent',
    focusStyle: {
      outlineWidth: 2,
      outlineStyle: 'solid',
      outlineColor: '#4D90FE',
    }
  };
};
