import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({ 
  title, 
  variant = 'primary', 
  size = 'medium',
  style,
  textStyle,
  ...props 
}: ButtonProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.button,
        styles[variant],
        styles[size],
        style,
      ]} 
      {...props}
    >
      <Text style={[
        styles.text,
        styles[`${size}Text`],
        textStyle,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  small: {
    paddingVertical: SIZES.padding / 2,
    paddingHorizontal: SIZES.padding,
  },
  medium: {
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
  },
  large: {
    paddingVertical: SIZES.padding * 1.5,
    paddingHorizontal: SIZES.padding * 3,
  },
  text: {
    color: COLORS.background,
    fontFamily: FONTS.medium,
  },
  smallText: {
    fontSize: SIZES.small,
  },
  mediumText: {
    fontSize: SIZES.medium,
  },
  largeText: {
    fontSize: SIZES.large,
  },
});
