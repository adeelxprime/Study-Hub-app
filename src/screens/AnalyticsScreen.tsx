import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { storage } from '../services/storage';
import {
  FocusSession,
  QuizResult,
  Assignment,
  StudyGoal,
  StudentProfile,
  GamificationState
} from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

export const AnalyticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [goals, setGoals] = useState<StudyGoal | null>(null);
  const [gamification, setGamification] = useState<GamificationState | null>(null);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Edit Goals Modal
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [dailyGoalMins, setDailyGoalMins] = useState('120');
  const [weeklyGoalMins, setWeeklyGoalMins] = useState('700');
  const [dailyTasksGoal, setDailyTasksGoal] = useState('4');

  const loadData = useCallback(async () => {
    try {
      const [prof, g, gam, focus, quizzes, asgs] = await Promise.all([
        storage.getProfile(),
        storage.getGoals(),
        storage.getGamification(),
        storage.getFocusSessions(),
        storage.getQuizHistory(),
        storage.getAssignments()
      ]);
      setProfile(prof);
      setGoals(g);
      setGamification(gam);
      setFocusSessions(focus);
      setQuizHistory(quizzes);
      setAssignments(asgs);

      setDailyGoalMins(String(g.dailyStudyMinutesGoal));
      setWeeklyGoalMins(String(g.weeklyStudyMinutesGoal));
      setDailyTasksGoal(String(g.dailyTasksGoal));
    } catch (e) {
      console.warn('Failed to load analytics data:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSaveGoals = async () => {
    const dailyM = parseInt(dailyGoalMins, 10) || 120;
    const weeklyM = parseInt(weeklyGoalMins, 10) || 700;
    const dailyT = parseInt(dailyTasksGoal, 10) || 4;

    const newGoals: StudyGoal = {
      dailyStudyMinutesGoal: dailyM,
      weeklyStudyMinutesGoal: weeklyM,
      dailyTasksGoal: dailyT,
      weeklyQuizzesGoal: goals?.weeklyQuizzesGoal || 3
    };

    await storage.saveGoals(newGoals);
    setGoals(newGoals);
    setGoalsModalVisible(false);
    Alert.alert('Goals Updated', 'Your daily & weekly study targets have been saved!');
  };

  // Calculations
  const totalStudyMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0) + (gamification?.focusMinutesTotal || 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  const completedAssignments = assignments.filter(a => a.completed).length;
  const assignmentRate = assignments.length > 0 ? Math.round((completedAssignments / assignments.length) * 100) : 100;

  const averageQuizScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((acc, q) => acc + q.percentage, 0) / quizHistory.length)
    : 85;

  // Weak subjects determination: based on low quiz scores & pending assignments
  const subjectScores: { [sub: string]: { totalScore: number; count: number; pendingCount: number } } = {};

  (profile?.subjects || []).forEach(sub => {
    subjectScores[sub] = { totalScore: 0, count: 0, pendingCount: 0 };
  });

  quizHistory.forEach(q => {
    if (subjectScores[q.subject]) {
      subjectScores[q.subject].totalScore += q.percentage;
      subjectScores[q.subject].count += 1;
    }
  });

  assignments.filter(a => !a.completed).forEach(a => {
    if (subjectScores[a.subject]) {
      subjectScores[a.subject].pendingCount += 1;
    }
  });

  const subjectAnalytics = Object.keys(subjectScores).map(sub => {
    const data = subjectScores[sub];
    const avg = data.count > 0 ? Math.round(data.totalScore / data.count) : null;
    const isWeak = (avg !== null && avg < 70) || data.pendingCount >= 2;
    return {
      subject: sub,
      avgScore: avg,
      pendingCount: data.pendingCount,
      isWeak
    };
  });

  const dailyGoalPercent = Math.min(100, Math.round(((gamification?.focusMinutesTotal || 45) / (goals?.dailyStudyMinutesGoal || 120)) * 100));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Performance Analytics</Text>
          <Text style={styles.headerSubtitle}>Study hours, quiz scores & weak areas</Text>
        </View>

        <TouchableOpacity
          onPress={() => setGoalsModalVisible(true)}
          style={styles.editGoalsBtn}
        >
          <Ionicons name="flag-outline" size={16} color={COLORS.primary} />
          <Text style={styles.editGoalsText}>Set Goals</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Core Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="time" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.metricValue}>{totalStudyHours}h</Text>
            <Text style={styles.metricLabel}>Study Time</Text>
          </Card>

          <Card style={styles.metricCard}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="checkmark-done" size={20} color="#10B981" />
            </View>
            <Text style={styles.metricValue}>{assignmentRate}%</Text>
            <Text style={styles.metricLabel}>Task Rate</Text>
          </Card>

          <Card style={styles.metricCard}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="trophy" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.metricValue}>{averageQuizScore}%</Text>
            <Text style={styles.metricLabel}>Avg Quiz</Text>
          </Card>

          <Card style={styles.metricCard}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="flame" size={20} color="#EA580C" />
            </View>
            <Text style={styles.metricValue}>{gamification?.streakCount || 1}d</Text>
            <Text style={styles.metricLabel}>Active Streak</Text>
          </Card>
        </View>

        {/* Study Goals Progress Section */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={styles.rowAlign}>
              <Ionicons name="flag" size={17} color={COLORS.primary} style={styles.headerIcon} />
              <Text style={styles.cardSectionTitle}>Study Goals Tracking</Text>
            </View>
            <TouchableOpacity onPress={() => setGoalsModalVisible(true)}>
              <Text style={styles.linkText}>Adjust</Text>
            </TouchableOpacity>
          </View>

          {/* Daily Study Goal */}
          <View style={styles.goalItem}>
            <View style={styles.goalTitleRow}>
              <Text style={styles.goalName}>Daily Study Target</Text>
              <Text style={styles.goalFraction}>
                {gamification?.focusMinutesTotal || 45} / {goals?.dailyStudyMinutesGoal || 120} min ({dailyGoalPercent}%)
              </Text>
            </View>
            <View style={styles.goalBarBg}>
              <View style={[styles.goalBarFill, { width: `${dailyGoalPercent}%` }]} />
            </View>
          </View>

          {/* Weekly Study Goal */}
          <View style={styles.goalItem}>
            <View style={styles.goalTitleRow}>
              <Text style={styles.goalName}>Weekly Study Target</Text>
              <Text style={styles.goalFraction}>
                {Math.min(goals?.weeklyStudyMinutesGoal || 700, (gamification?.focusMinutesTotal || 45) * 3)} / {goals?.weeklyStudyMinutesGoal || 700} min
              </Text>
            </View>
            <View style={styles.goalBarBg}>
              <View
                style={[
                  styles.goalBarFill,
                  {
                    width: `${Math.min(100, Math.round((((gamification?.focusMinutesTotal || 45) * 3) / (goals?.weeklyStudyMinutesGoal || 700)) * 100))}%`,
                    backgroundColor: '#10B981'
                  }
                ]}
              />
            </View>
          </View>
        </Card>

        {/* Weak Subjects & Revision Priority */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={styles.rowAlign}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" style={styles.headerIcon} />
              <Text style={styles.cardSectionTitle}>Weak Subjects Analysis</Text>
            </View>
          </View>

          <Text style={styles.sectionSubtitle}>
            Identified by exam quiz scores and pending coursework deadlines:
          </Text>

          {subjectAnalytics.map((item, idx) => (
            <View key={idx} style={styles.subjectAnalyticRow}>
              <View style={styles.subLeft}>
                <Text style={styles.subName}>{item.subject}</Text>
                <Text style={styles.subDetail}>
                  {item.avgScore !== null ? `Avg Quiz: ${item.avgScore}%` : 'No quiz yet'}{' '}
                  &bull; {item.pendingCount} pending task{item.pendingCount === 1 ? '' : 's'}
                </Text>
              </View>

              <Badge
                label={item.isWeak ? 'Needs Revision' : 'On Track'}
                variant={item.isWeak ? 'danger' : 'success'}
                size="sm"
              />
            </View>
          ))}
        </Card>

        {/* Recent Focus Sessions */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={styles.rowAlign}>
              <Ionicons name="timer" size={17} color="#F59E0B" style={styles.headerIcon} />
              <Text style={styles.cardSectionTitle}>Recent Focus Sessions</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('FocusMode')}>
              <Text style={styles.linkText}>Start Focus</Text>
            </TouchableOpacity>
          </View>

          {focusSessions.length > 0 ? (
            focusSessions.slice(0, 5).map(session => (
              <View key={session.id} style={styles.sessionHistoryRow}>
                <View style={styles.sessionHistoryLeft}>
                  <Text style={styles.sessionSub}>{session.subject}</Text>
                  <Text style={styles.sessionDate}>
                    {new Date(session.completedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric'
                    })} &bull; Mode: {session.mode.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.durationPill}>
                  <Text style={styles.durationText}>+{session.durationMinutes} min</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptySessionNotice}>
              No focus sessions logged yet. Tap Start Focus to run a Pomodoro timer!
            </Text>
          )}
        </Card>
      </ScrollView>

      {/* Edit Goals Modal */}
      <Modal visible={goalsModalVisible} transparent animationType="slide" onRequestClose={() => setGoalsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Study Goals</Text>
              <TouchableOpacity onPress={() => setGoalsModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Daily Study Minutes Target</Text>
              <TextInput
                style={styles.textInput}
                value={dailyGoalMins}
                onChangeText={setDailyGoalMins}
                keyboardType="numeric"
                placeholder="120"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Weekly Study Minutes Target</Text>
              <TextInput
                style={styles.textInput}
                value={weeklyGoalMins}
                onChangeText={setWeeklyGoalMins}
                keyboardType="numeric"
                placeholder="700"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Daily Tasks Completion Target</Text>
              <TextInput
                style={styles.textInput}
                value={dailyTasksGoal}
                onChangeText={setDailyTasksGoal}
                keyboardType="numeric"
                placeholder="4"
                placeholderTextColor={COLORS.textLight}
              />

              <Button
                title="Save Goals"
                onPress={handleSaveGoals}
                variant="primary"
                size="md"
                icon="checkmark"
                style={styles.saveGoalsBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  editGoalsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryBg,
    gap: 4
  },
  editGoalsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 40
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginBottom: 0
  },
  metricIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerIcon: {
    marginRight: 6
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary
  },
  goalItem: {
    marginVertical: 6
  },
  goalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  goalName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text
  },
  goalFraction: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500'
  },
  goalBarBg: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  goalBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 10
  },
  subjectAnalyticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  subLeft: {
    flex: 1
  },
  subName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text
  },
  subDetail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  sessionHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  sessionHistoryLeft: {
    flex: 1
  },
  sessionSub: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text
  },
  sessionDate: {
    fontSize: 11,
    color: COLORS.textLight
  },
  durationPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309'
  },
  emptySessionNotice: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    marginTop: 10
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background
  },
  saveGoalsBtn: {
    marginTop: SPACING.lg
  }
});
