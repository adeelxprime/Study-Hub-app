export const COLORS = {
  // Brand colors
  primary: '#4F46E5', // Indigo 600
  primaryDark: '#3730A3', // Indigo 800
  primaryLight: '#818CF8', // Indigo 400
  primaryBg: '#EEF2FF', // Indigo 50

  secondary: '#06B6D4', // Cyan 500
  secondaryBg: '#ECFEFF',

  accent: '#F59E0B', // Amber 500
  accentBg: '#FFFBEB',

  // Semantic
  success: '#10B981', // Emerald 500
  successBg: '#ECFDF5',
  warning: '#F59E0B', // Amber 500
  warningBg: '#FFFBEB',
  danger: '#EF4444', // Red 500
  dangerBg: '#FEF2F2',
  info: '#3B82F6', // Blue 500
  infoBg: '#EFF6FF',

  // Priority
  priorityHigh: '#EF4444',
  priorityHighBg: '#FEF2F2',
  priorityMedium: '#F59E0B',
  priorityMediumBg: '#FFFBEB',
  priorityLow: '#10B981',
  priorityLowBg: '#ECFDF5',

  // Surfaces & Neutrals
  background: '#F8FAFC', // Slate 50
  card: '#FFFFFF',
  cardHover: '#F1F5F9',
  border: '#E2E8F0', // Slate 200
  borderDark: '#CBD5E1', // Slate 300

  // Text
  text: '#0F172A', // Slate 900
  textMuted: '#64748B', // Slate 500
  textLight: '#94A3B8', // Slate 400
  textWhite: '#FFFFFF',

  // Dark Focus Mode
  focusBackground: '#0F172A',
  focusCard: '#1E293B',
  focusBorder: '#334155',
  focusText: '#F8FAFC'
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999
};
