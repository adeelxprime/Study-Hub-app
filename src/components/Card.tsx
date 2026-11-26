import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, SHADOWS, RADIUS, SPACING } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'elevated' }) => {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        variant === 'flat' && styles.flat,
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md
  },
  elevated: {
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: COLORS.border
  },
  flat: {
    backgroundColor: COLORS.background
  }
});
