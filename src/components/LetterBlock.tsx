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
} from 'react-native-reanimated';
import { COLORS, FONTS, SIZES } from '../constants/theme';

interface LetterBlockProps {
  letter: string;
  isSelected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  colorIndex?: number;
}

export const LetterBlock = React.memo(({ 
  letter, 
  isSelected, 
  onPress, 
  style,
  colorIndex = 0,
}: LetterBlockProps) => {
  const blockColors = Object.values(COLORS.block);
  const backgroundColor = blockColors[colorIndex % blockColors.length];
  
  const scale = useSharedValue(1);
  const pressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(isSelected ? 0.95 : scale.value, { 
          damping: 12,
          stiffness: 120,
        })},
        { translateY: withSpring(isSelected ? -10 : 0, {
          damping: 12,
          stiffness: 120,
        })}
      ],
      // No opacity change on selection - keeping opacity the same
    };
  });

  const onPressIn = () => {
    scale.value = withSpring(0.95);
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
          { backgroundColor },
          animatedStyle,
          style
        ]}
      >
        <Text style={styles.letter}>{letter}</Text>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  letter: {
    color: COLORS.text,
    fontSize: SIZES.xLarge,
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
});
