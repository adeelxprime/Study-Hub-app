import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { Card } from '../components/Card';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  screen: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'journal',
    title: 'Lecture Journal & OCR',
    subtitle: 'Board photos, handwritten OCR & revision notes',
    icon: 'camera',
    color: '#4F46E5',
    screen: 'LectureJournal'
  },
  {
    id: 'assignments',
    title: 'Assignment Manager',
    subtitle: 'Deadlines, priority tracking & grade logs',
    icon: 'clipboard',
    color: '#0891B2',
    screen: 'Assignments'
  },
  {
    id: 'notes',
    title: 'Notes Manager',
    subtitle: 'Subject-wise rich notes with PDF export',
    icon: 'journal',
    color: '#059669',
    screen: 'Notes'
  },
  {
    id: 'materials',
    title: 'Study Materials & PDFs',
    subtitle: 'Syllabus, slide decks & document viewer',
    icon: 'folder-open',
    color: '#D97706',
    screen: 'Materials'
  },
  {
    id: 'quiz',
    title: 'Field-Based & AI Quizzes',
    subtitle: 'Randomized MCQs, scoring & explanations',
    icon: 'ribbon',
    color: '#DC2626',
    screen: 'Quiz'
  },
  {
    id: 'focus',
    title: 'Focus Mode (Pomodoro)',
    subtitle: 'Deep study sessions & ambient timer',
    icon: 'timer',
    color: '#7C3AED',
    screen: 'FocusMode'
  },
  {
    id: 'analytics',
    title: 'Performance Analytics & Goals',
    subtitle: 'Study hours, weak subjects & goal bars',
    icon: 'trending-up',
    color: '#10B981',
    screen: 'Analytics'
  },
  {
    id: 'gamification',
    title: 'Achievements & Badges',
    subtitle: 'Class Regular badge, XP points & streaks',
    icon: 'trophy',
    color: '#F59E0B',
    screen: 'Gamification'
  },
  {
    id: 'games',
    title: 'Brain Break Games',
    subtitle: 'Tile Puzzle, Memory Match & Quick Quiz',
    icon: 'game-controller',
    color: '#3730A3',
    screen: 'Games'
  },
  {
    id: 'examprep',
    title: 'Exam Preparation Mode',
    subtitle: 'Countdown milestones & AI revision plan',
    icon: 'rocket',
    color: '#BE123C',
    screen: 'ExamPrep'
  },
  {
    id: 'field',
    title: 'Change Academic Major',
    subtitle: 'Switch between 11 university study fields',
    icon: 'school',
    color: '#0284C7',
    screen: 'FieldSelect'
  },
  {
    id: 'settings',
    title: 'Settings & Cloud Backup',
    subtitle: 'Backend URL, Gemini key & cross-device sync',
    icon: 'settings',
    color: '#64748B',
    screen: 'Settings'
  }
];

export const MoreScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Features & Modules</Text>
        <Text style={styles.headerSubtitle}>Complete AI Student Assistant suite</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(item.screen)}
              style={styles.menuCard}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>

              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 40
  },
  menuGrid: {
    gap: 8
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  menuTextCol: {
    flex: 1
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  }
});
