import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : '#FFFFFF'}
        />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18}
              color={
                variant === 'outline' || variant === 'ghost'
                  ? COLORS.primary
                  : variant === 'secondary'
                  ? COLORS.text
                  : '#FFFFFF'
              }
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              styles[`text_${variant}`],
              styles[`textSize_${size}`],
              textStyle
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md
  },
  primary: {
    backgroundColor: COLORS.primary
  },
  secondary: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderDark
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary
  },
  danger: {
    backgroundColor: COLORS.danger
  },
  success: {
    backgroundColor: COLORS.success
  },
  ghost: {
    backgroundColor: 'transparent'
  },
  size_sm: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md
  },
  size_md: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.base
  },
  size_lg: {
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.xl
  },
  disabled: {
    opacity: 0.5
  },
  icon: {
    marginRight: SPACING.xs + 2
  },
  text: {
    fontWeight: '600'
  },
  text_primary: {
    color: '#FFFFFF'
  },
  text_secondary: {
    color: COLORS.text
  },
  text_outline: {
    color: COLORS.primary
  },
  text_danger: {
    color: '#FFFFFF'
  },
  text_success: {
    color: '#FFFFFF'
  },
  text_ghost: {
    color: COLORS.primary
  },
  textSize_sm: {
    fontSize: 13
  },
  textSize_md: {
    fontSize: 15
  },
  textSize_lg: {
    fontSize: 17
  }
});
