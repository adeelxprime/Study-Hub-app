import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color,
  backgroundColor,
  variant = 'neutral',
  size = 'md',
  style
}) => {
  let bgColor = COLORS.background;
  let textColor = COLORS.textMuted;

  if (color && backgroundColor) {
    bgColor = backgroundColor;
    textColor = color;
  } else {
    switch (variant) {
      case 'primary':
        bgColor = COLORS.primaryBg;
        textColor = COLORS.primary;
        break;
      case 'success':
        bgColor = COLORS.successBg;
        textColor = COLORS.success;
        break;
      case 'warning':
        bgColor = COLORS.warningBg;
        textColor = COLORS.warning;
        break;
      case 'danger':
        bgColor = COLORS.dangerBg;
        textColor = COLORS.danger;
        break;
      case 'info':
        bgColor = COLORS.infoBg;
        textColor = COLORS.info;
        break;
      default:
        bgColor = '#F1F5F9';
        textColor = '#475569';
    }
  }

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bgColor },
        size === 'sm' && styles.badgeSm,
        style
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: textColor },
          size === 'sm' && styles.textSm
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeSm: {
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2
  },
  text: {
    fontSize: 12,
    fontWeight: '600'
  },
  textSm: {
    fontSize: 10,
    fontWeight: '600'
  }
});
