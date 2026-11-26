import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { storage } from '../services/storage';
import {
  StudentProfile,
  TimetableClass,
  Assignment,
  Lecture,
  Exam,
  DailySchedule,
  GamificationState,
  StudyGoal,
  PlannedTask
} from '../types';
import { STUDENT_FIELDS } from '../constants/fields';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [gamification, setGamification] = useState<GamificationState | null>(null);
  const [todayClasses, setTodayClasses] = useState<TimetableClass[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [nextExam, setNextExam] = useState<Exam | null>(null);
  const [recentLectures, setRecentLectures] = useState<Lecture[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<DailySchedule | null>(null);
  const [goals, setGoals] = useState<StudyGoal | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [prof, gam, timetable, assignments, exams, lectures, sched, studyGoals] =
        await Promise.all([
          storage.getProfile(),
          storage.getGamification(),
          storage.getTimetable(),
          storage.getAssignments(),
          storage.getExams(),
          storage.getLectures(),
          storage.getDailySchedule(new Date().toISOString().split('T')[0]),
          storage.getGoals()
        ]);

      setProfile(prof);
      setGamification(gam);
      setGoals(studyGoals);

      // Filter classes for today (1 = Monday, 7 = Sunday)
      const currentDay = new Date().getDay(); // 0 is Sunday in JS
      const dayOfWeek = currentDay === 0 ? 7 : currentDay;
      const todayCls = timetable
        .filter(c => c.dayOfWeek === dayOfWeek)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      setTodayClasses(todayCls);

      // Pending assignments sorted by deadline
      const pending = assignments
        .filter(a => !a.completed)
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      setPendingAssignments(pending.slice(0, 3));

      // Next upcoming exam
      const now = Date.now();
      const upcomingExams = exams
        .filter(e => new Date(e.date).getTime() >= now - 24 * 60 * 60 * 1000)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setNextExam(upcomingExams[0] || null);

      // Recent 3 lectures
      setRecentLectures(lectures.slice(0, 3));
      setTodaySchedule(sched);
    } catch (e) {
      console.warn('Dashboard load error:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleToggleAssignment = async (id: string) => {
    await storage.toggleAssignmentCompleted(id);
    await loadDashboardData();
  };

  // Format countdown
  const getExamCountdown = (examDateStr: string) => {
    const diffMs = new Date(examDateStr).getTime() - Date.now();
    if (diffMs <= 0) return 'Today!';
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const fieldMeta = STUDENT_FIELDS.find(f => f.id === profile?.field) || STUDENT_FIELDS[0];
  const nextTask = todaySchedule?.tasks?.find(t => !t.completed);

  // Minutes studied today
  const minutesStudiedToday = Math.min(
    gamification?.focusMinutesTotal || 0,
    goals?.dailyStudyMinutesGoal || 120
  );
  const studyProgressPercent = Math.min(
    100,
    Math.round((minutesStudiedToday / (goals?.dailyStudyMinutesGoal || 120)) * 100)
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Top Universal App Header */}
      <Header
        profile={profile}
        gamification={gamification}
        onOpenFieldSelect={() => navigation.navigate('FieldSelect')}
        onOpenSearch={() => navigation.navigate('GlobalSearch')}
        onOpenGamification={() => navigation.navigate('Gamification')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Welcome / Field Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerTextCol}>
            <Text style={styles.greetingText}>Welcome back, {profile?.name || 'Student'} 👋</Text>
            <Text style={styles.universityText}>
              {profile?.university || 'University'} &bull; {profile?.semester || 'Semester'}
            </Text>
            <View style={styles.fieldTagRow}>
              <View style={[styles.fieldBadge, { backgroundColor: fieldMeta.accentColor }]}>
                <Ionicons name={fieldMeta.icon as any} size={14} color={fieldMeta.color} />
                <Text style={[styles.fieldBadgeText, { color: fieldMeta.color }]}>
                  {fieldMeta.name}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Action Tiles */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('LectureJournal', { openCreateModal: true })}
            style={[styles.quickActionTile, { backgroundColor: '#EEF2FF' }]}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: '#4F46E5' }]}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.tileTitle}>Board OCR</Text>
            <Text style={styles.tileSubtitle}>New Lecture</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AiChat')}
            style={[styles.quickActionTile, { backgroundColor: '#ECFDF5' }]}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: '#10B981' }]}>
              <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.tileTitle}>Ask AI</Text>
            <Text style={styles.tileSubtitle}>Study Tutor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FocusMode')}
            style={[styles.quickActionTile, { backgroundColor: '#FFFBEB' }]}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: '#F59E0B' }]}>
              <Ionicons name="timer" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.tileTitle}>Focus</Text>
            <Text style={styles.tileSubtitle}>Pomodoro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Planner')}
            style={[styles.quickActionTile, { backgroundColor: '#FDF2F8' }]}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: '#DB2777' }]}>
              <Ionicons name="calendar" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.tileTitle}>AI Plan</Text>
            <Text style={styles.tileSubtitle}>Daily Routine</Text>
          </TouchableOpacity>
        </View>

        {/* Next Task / Active Routine Block */}
        <Card style={styles.nextTaskCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.rowAlign}>
              <Ionicons name="flash" size={18} color={COLORS.primary} style={styles.headerIcon} />
              <Text style={styles.cardSectionTitle}>Next Task Today</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Planner')}>
              <Text style={styles.viewAllLink}>View Schedule</Text>
            </TouchableOpacity>
          </View>

          {nextTask ? (
            <View style={styles.nextTaskItem}>
              <View style={styles.nextTaskTimeCol}>
                <Text style={styles.nextTaskTime}>{nextTask.time}</Text>
                <Badge
                  label={nextTask.type.toUpperCase()}
                  variant={nextTask.isBreak ? 'warning' : 'primary'}
                  size="sm"
                />
              </View>
              <View style={styles.nextTaskInfoCol}>
                <Text style={styles.nextTaskTitle} numberOfLines={1}>
                  {nextTask.title}
                </Text>
                <Text style={styles.nextTaskSubject} numberOfLines={1}>
                  {nextTask.subject} &bull; {nextTask.durationMinutes} mins
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyTaskBox}>
              <Text style={styles.emptyTaskText}>No active schedule for today yet.</Text>
              <Button
                title="Generate AI Schedule"
                onPress={() => navigation.navigate('Planner')}
                variant="outline"
                size="sm"
                icon="sparkles"
              />
            </View>
          )}
        </Card>

        {/* Daily Study Progress & Goals */}
        <Card style={styles.progressCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.rowAlign}>
              <Ionicons name="trending-up" size={18} color="#059669" style={styles.headerIcon} />
              <Text style={styles.cardSectionTitle}>Today's Study Progress</Text>
            </View>
            <Text style={styles.progressGoalText}>
              Goal: {goals?.dailyStudyMinutesGoal || 120} min
            </Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${studyProgressPercent}%`, backgroundColor: COLORS.primary }
              ]}
            />
          </View>
          <View style={styles.progressStatsRow}>
            <Text style={styles.progressStatLeft}>
              {minutesStudiedToday} mins focused ({studyProgressPercent}%)
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
              <Text style={styles.viewAnalyticsLink}>Full Analytics &rarr;</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Exam Countdown Card */}
        {nextExam && (
          <Card style={styles.examCard}>
            <View style={styles.examCardInner}>
              <View style={styles.examBadgeRow}>
                <Badge label="UPCOMING EXAM" variant="danger" size="sm" />
                <View style={styles.countdownPill}>
                  <Ionicons name="alarm" size={13} color="#DC2626" />
                  <Text style={styles.countdownText}>{getExamCountdown(nextExam.date)}</Text>
                </View>
              </View>
              <Text style={styles.examTitle}>{nextExam.title}</Text>
              <Text style={styles.examMeta}>
                {nextExam.subject} &bull; Room: {nextExam.room} &bull; Target: {nextExam.targetGrade}
              </Text>
              <Button
                title="Open AI Exam Prep Blueprint"
                onPress={() => navigation.navigate('ExamPrep', { exam: nextExam })}
                variant="danger"
                size="sm"
                icon="rocket"
                style={styles.examButton}
              />
            </View>
          </Card>
        )}

        {/* Upcoming Classes Today */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={styles.rowAlign}>
              <Ionicons name="school" size={18} color="#0891B2" style={styles.headerIcon} />
              <Text style={styles.cardSectionTitle}>Classes Today ({todayClasses.length})</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Timetable')}>
              <Text style={styles.viewAllLink}>Timetable</Text>
            </TouchableOpacity>
          </View>

          {todayClasses.length > 0 ? (
            todayClasses.map(cls => (
              <View key={cls.id} style={styles.classItemRow}>
                <View style={[styles.classColorStrip, { backgroundColor: cls.color || COLORS.primary }]} />
                <View style={styles.classInfo}>
                  <Text style={styles.classSubject}>{cls.subject}</Text>
                  <Text style={styles.classDetails}>
                    {cls.teacher} &bull; {cls.room}
                  </Text>
                </View>
                <View style={styles.classTimeBox}>
                  <Text style={styles.classTime}>{cls.startTime}</Text>
                  <Text style={styles.classTimeEnd}>to {cls.endTime}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyNotice}>No university classes scheduled for today.</Text>
          )}
        </Card>

        {/* Pending Assignments */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={styles.rowAlign}>
              <Ionicons name="clipboard" size={18} color="#D97706" style={styles.headerIcon} />
              <Text style={styles.cardSectionTitle}>Pending Assignments</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Assignments')}>
              <Text style={styles.viewAllLink}>All Tasks</Text>
            </TouchableOpacity>
          </View>

          {pendingAssignments.length > 0 ? (
            pendingAssignments.map(asg => (
              <TouchableOpacity
                key={asg.id}
                activeOpacity={0.7}
                onPress={() => handleToggleAssignment(asg.id)}
                style={styles.assignmentItemRow}
              >
                <Ionicons
                  name={asg.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={asg.completed ? COLORS.success : COLORS.borderDark}
                  style={styles.checkIcon}
                />
                <View style={styles.asgDetails}>
                  <Text
                    style={[styles.asgTitle, asg.completed && styles.asgTitleDone]}
                    numberOfLines={1}
                  >
                    {asg.title}
                  </Text>
                  <Text style={styles.asgSubText}>
                    {asg.subject} &bull; Due:{' '}
                    {new Date(asg.deadline).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
                <Badge
                  label={asg.priority}
                  variant={
                    asg.priority === 'High'
                      ? 'danger'
                      : asg.priority === 'Medium'
                      ? 'warning'
                      : 'success'
                  }
                  size="sm"
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyNotice}>All assignments completed! 🎉</Text>
          )}
        </Card>

        {/* Lecture History Preview */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={styles.rowAlign}>
              <Ionicons name="book" size={18} color="#7C3AED" style={styles.headerIcon} />
              <Text style={styles.cardSectionTitle}>Recent Lectures</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('LectureJournal')}>
              <Text style={styles.viewAllLink}>Journal</Text>
            </TouchableOpacity>
          </View>

          {recentLectures.length > 0 ? (
            recentLectures.map(lec => (
              <TouchableOpacity
                key={lec.id}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('LectureDetail', { lectureId: lec.id })}
                style={styles.lecturePreviewRow}
              >
                <View style={styles.lectureIconBox}>
                  <Ionicons name="document-text" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.lectureInfo}>
                  <Text style={styles.lectureTitle} numberOfLines={1}>
                    {lec.title}
                  </Text>
                  <Text style={styles.lectureMeta}>
                    {lec.subject} &bull; {lec.date}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyNotice}>No lectures saved yet. Capture a whiteboard photo!</Text>
          )}
        </Card>

        {/* Brain Break Games Promo Banner */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Games')}
          style={styles.gamesBanner}
        >
          <View style={styles.gamesBannerIcon}>
            <Ionicons name="game-controller" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.gamesBannerText}>
            <Text style={styles.gamesBannerTitle}>Study Fatigue? Take a Brain Break</Text>
            <Text style={styles.gamesBannerDesc}>
              Tile Puzzle &bull; Memory Card Match &bull; 60s Quick Quiz
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 40
  },
  bannerContainer: {
    marginBottom: SPACING.base
  },
  bannerTextCol: {
    gap: 3
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text
  },
  universityText: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  fieldTagRow: {
    flexDirection: 'row',
    marginTop: 6
  },
  fieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 5
  },
  fieldBadgeText: {
    fontSize: 12,
    fontWeight: '700'
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.base,
    gap: SPACING.xs + 2
  },
  quickActionTile: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: 6,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  tileIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text
  },
  tileSubtitle: {
    fontSize: 10,
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary
  },
  nextTaskCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary
  },
  nextTaskItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  nextTaskTimeCol: {
    minWidth: 90,
    marginRight: SPACING.sm
  },
  nextTaskTime: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4
  },
  nextTaskInfoCol: {
    flex: 1
  },
  nextTaskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text
  },
  nextTaskSubject: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  emptyTaskBox: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: 8
  },
  emptyTaskText: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  progressCard: {
    marginBottom: SPACING.md
  },
  progressGoalText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500'
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginVertical: 8
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4
  },
  progressStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressStatLeft: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  viewAnalyticsLink: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary
  },
  examCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA'
  },
  examCardInner: {
    gap: 6
  },
  examBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 4
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626'
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B'
  },
  examMeta: {
    fontSize: 12,
    color: '#B91C1C'
  },
  examButton: {
    marginTop: 6
  },
  classItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  classColorStrip: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: SPACING.sm
  },
  classInfo: {
    flex: 1
  },
  classSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text
  },
  classDetails: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  classTimeBox: {
    alignItems: 'flex-end'
  },
  classTime: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary
  },
  classTimeEnd: {
    fontSize: 11,
    color: COLORS.textLight
  },
  emptyNotice: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: 6
  },
  assignmentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  checkIcon: {
    marginRight: 10
  },
  asgDetails: {
    flex: 1
  },
  asgTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text
  },
  asgTitleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight
  },
  asgSubText: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  lecturePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  lectureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  lectureInfo: {
    flex: 1
  },
  lectureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text
  },
  lectureMeta: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  gamesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3730A3',
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    marginTop: 4,
    ...SHADOWS.small
  },
  gamesBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md
  },
  gamesBannerText: {
    flex: 1
  },
  gamesBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  gamesBannerDesc: {
    fontSize: 11,
    color: '#C7D2FE',
    marginTop: 2
  }
});
