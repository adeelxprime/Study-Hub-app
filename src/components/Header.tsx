import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { StudentProfile, GamificationState } from '../types';
import { STUDENT_FIELDS } from '../constants/fields';

interface HeaderProps {
  profile: StudentProfile | null;
  gamification: GamificationState | null;
  onOpenFieldSelect: () => void;
  onOpenSearch: () => void;
  onOpenGamification: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  gamification,
  onOpenFieldSelect,
  onOpenSearch,
  onOpenGamification
}) => {
  const fieldMeta = STUDENT_FIELDS.find(f => f.id === profile?.field) || STUDENT_FIELDS[0];

  return (
    <View style={styles.container}>
      {/* Field Selector Pill */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onOpenFieldSelect}
        style={[styles.fieldPill, { backgroundColor: fieldMeta.accentColor }]}
      >
        <Ionicons name={fieldMeta.icon as any} size={16} color={fieldMeta.color} />
        <Text style={[styles.fieldPillText, { color: fieldMeta.color }]} numberOfLines={1}>
          {fieldMeta.shortName}
        </Text>
        <Ionicons name="chevron-down" size={14} color={fieldMeta.color} />
      </TouchableOpacity>

      {/* Gamification Pills & Search */}
      <View style={styles.rightGroup}>
        {/* Streak Pill */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenGamification}
          style={styles.statPill}
        >
          <Ionicons name="flame" size={15} color="#EA580C" />
          <Text style={styles.statText}>{gamification?.streakCount || 1}d</Text>
        </TouchableOpacity>

        {/* Points Pill */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenGamification}
          style={[styles.statPill, styles.pointsPill]}
        >
          <Ionicons name="star" size={14} color="#D97706" />
          <Text style={[styles.statText, styles.pointsText]}>
            {gamification?.points || 0} pts
          </Text>
        </TouchableOpacity>

        {/* Global Search Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenSearch}
          style={styles.iconButton}
        >
          <Ionicons name="search" size={19} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  fieldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 5,
    maxWidth: 130
  },
  fieldPillText: {
    fontSize: 13,
    fontWeight: '700'
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 3
  },
  pointsPill: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A'
  },
  statText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9A3412'
  },
  pointsText: {
    color: '#B45309'
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  }
});
