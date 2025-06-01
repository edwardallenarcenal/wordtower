import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { COLORS, FONTS, SIZES } from '../constants/theme';

interface CategoryCardProps {
  name: string;
  description: string;
  onSelect: () => void;
  isSelected?: boolean;
}

export const CategoryCard = React.memo(({ 
  name, 
  description, 
  onSelect,
  isSelected,
}: CategoryCardProps) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
      ],
    };
  });

  const handlePress = () => {
    // Create a bouncy animation effect
    scale.value = withSequence(
      withSpring(0.95, { damping: 10, stiffness: 400 }),
      withSpring(1.05, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );
    onSelect();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.container, animatedStyle, isSelected && styles.selected]}>
        <View
          style={[styles.gradient, {backgroundColor: COLORS.primary}]}
        >
          <View style={styles.content}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.description}>{description}</Text>
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedText}>✓</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: SIZES.padding,
    marginVertical: SIZES.padding / 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  selected: {
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  gradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    padding: SIZES.padding,
  },
  name: {
    color: COLORS.background,
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  description: {
    color: COLORS.background,
    fontSize: SIZES.small,
    fontFamily: FONTS.regular,
    opacity: 0.9,
  },
  selectedIndicator: {
    position: 'absolute',
    top: SIZES.padding,
    right: SIZES.padding,
    backgroundColor: COLORS.accent,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
  },
});
