import React from 'react';
import { 
  StyleSheet, 
  Text, 
  ViewStyle,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { COLORS, FONTS, SIZES } from '../constants/theme';

interface LetterBlockProps {
  letter: string;
  isSelected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  colorIndex?: number;
  isHint?: boolean;
}

export const LetterBlock = React.memo(({ 
  letter, 
  isSelected, 
  onPress, 
  style,
  colorIndex = 0,
  isHint = false,
}: LetterBlockProps) => {
  const blockColors = Object.values(COLORS.block);
  const primaryColor = blockColors[colorIndex % blockColors.length];
  
  const scale = useSharedValue(1);
  const pressed = useSharedValue(false);
  const hintPulse = useSharedValue(0);

  // Start hint animation if isHint is true
  React.useEffect(() => {
    if (isHint) {
      hintPulse.value = withTiming(1, { duration: 500 });
    } else {
      hintPulse.value = withTiming(0, { duration: 300 });
    }
  }, [isHint]);

  const animatedStyle = useAnimatedStyle(() => {
    const hintScale = 1 + (hintPulse.value * 0.1);
    const baseScale = isSelected ? 0.95 : scale.value;
    
    return {
      transform: [
        { scale: withSpring(baseScale * hintScale, { 
          damping: 12,
          stiffness: 120,
        })},
        { translateY: withSpring(isSelected ? -8 : 0, {
          damping: 12,
          stiffness: 120,
        })}
      ],
      shadowOpacity: withSpring(isSelected ? 0.3 : 0.15),
      borderWidth: withSpring(isHint ? 2 : 0),
      borderColor: interpolateColor(
        hintPulse.value,
        [0, 1],
        ['transparent', COLORS.warning]
      ),
    };
  });

  const onPressIn = () => {
    scale.value = withSpring(0.9);
    pressed.value = true;
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
    pressed.value = false;
  };

  return (
    <Pressable 
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={`Letter ${letter}`}
    >
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          style
        ]}
      >
        <Animated.View
          style={[styles.gradient, {backgroundColor: primaryColor}]}
        >
          <Text style={styles.letter}>{letter}</Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 56,
    height: 56,
    borderRadius: SIZES.radius,
    margin: SIZES.marginSmall / 2,
    ...SIZES.shadowMedium,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.radius,
  },
  letter: {
    fontSize: SIZES.xLarge,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
