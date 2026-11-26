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
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { notifications } from '../services/notifications';
import { Exam, ExamRevisionPlan, StudentProfile } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

export const ExamPrepScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route
}) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Add Exam Modal
  const [addExamModal, setAddExamModal] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examSubject, setExamSubject] = useState('');
  const [examDaysAhead, setExamDaysAhead] = useState('7');
  const [examRoom, setExamRoom] = useState('Main Examination Hall');
  const [targetGrade, setTargetGrade] = useState('A');
  const [examNotes, setExamNotes] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [list, prof] = await Promise.all([
        storage.getExams(),
        storage.getProfile()
      ]);
      setExams(list);
      setProfile(prof);

      // Select first exam by default or route param
      if (route.params?.exam) {
        setSelectedExam(route.params.exam);
      } else if (list.length > 0 && !selectedExam) {
        setSelectedExam(list[0]);
      }
    } catch (e) {
      console.warn('Failed to load exams:', e);
    }
  }, [route.params?.exam, selectedExam]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleCreateExam = async () => {
    if (!examTitle.trim() || !examSubject.trim()) {
      Alert.alert('Validation', 'Please provide an exam title and subject.');
      return;
    }

    const days = parseInt(examDaysAhead, 10) || 7;
    const examDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T09:00';

    try {
      const created = await storage.addExam({
        title: examTitle.trim(),
        subject: examSubject.trim(),
        date: examDate,
        room: examRoom.trim(),
        targetGrade: targetGrade.trim(),
        notes: examNotes.trim()
      });

      await notifications.scheduleExamReminder(created);
      await loadData();
      setSelectedExam(created);
      setAddExamModal(false);
      Alert.alert('Exam Added', 'Upcoming exam registered and reminders configured!');
    } catch (e) {
      Alert.alert('Error', 'Failed to add exam.');
    }
  };

  const handleGenerateRevisionPlan = async () => {
    if (!selectedExam) return;
    setGeneratingPlan(true);

    const examDate = new Date(selectedExam.date);
    const diffMs = examDate.getTime() - Date.now();
    const daysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    try {
      const res = await api.generateExamRevisionPlan({
        examName: selectedExam.title,
        subject: selectedExam.subject,
        examDate: selectedExam.date,
        daysLeft,
        weakTopics: ['Core Theory', 'Numerical Problem Formulation'],
        dailyStudyHours: profile?.targetStudyHoursDaily || 3,
        studentField: profile?.field || 'General'
      });

      if (res.success && res.plan) {
        const updatedExam: Exam = {
          ...selectedExam,
          revisionPlan: res.plan
        };
        await storage.updateExam(updatedExam);
        setSelectedExam(updatedExam);
        await loadData();
        Alert.alert('AI Blueprint Generated', 'Personalized daily revision milestones and high-yield topics ready!');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to generate exam revision plan.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const getDaysLeft = (dateStr: string) => {
    const diffMs = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  const plan = selectedExam?.revisionPlan;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Exam Preparation Mode</Text>
          <Text style={styles.headerSubtitle}>Countdown, syllabus milestones & AI roadmap</Text>
        </View>
        <TouchableOpacity
          onPress={() => setAddExamModal(true)}
          style={styles.addExamBtn}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Horizontal Exam Picker */}
      {exams.length > 0 && (
        <View style={styles.examPickerBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.examPickerScroll}>
            {exams.map(e => {
              const isSelected = selectedExam?.id === e.id;
              const days = getDaysLeft(e.date);

              return (
                <TouchableOpacity
                  key={e.id}
                  onPress={() => setSelectedExam(e)}
                  style={[styles.examChip, isSelected && styles.examChipActive]}
                >
                  <Text style={[styles.examChipTitle, isSelected && styles.examChipTitleActive]} numberOfLines={1}>
                    {e.subject}
                  </Text>
                  <Text style={[styles.examChipDays, isSelected && styles.examChipDaysActive]}>
                    {days === 0 ? 'Today!' : `${days}d left`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {selectedExam ? (
          <View>
            {/* Selected Exam Header Card */}
            <Card style={styles.examHeroCard}>
              <View style={styles.heroTop}>
                <Badge label={selectedExam.subject} variant="danger" size="sm" />
                <View style={styles.gradePill}>
                  <Text style={styles.gradePillText}>Target: {selectedExam.targetGrade}</Text>
                </View>
              </View>

              <Text style={styles.heroExamTitle}>{selectedExam.title}</Text>

              <View style={styles.heroMetaRow}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Date & Time</Text>
                  <Text style={styles.metaVal}>
                    {new Date(selectedExam.date).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      weekday: 'short'
                    })} &bull; {new Date(selectedExam.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Exam Hall / Room</Text>
                  <Text style={styles.metaVal}>{selectedExam.room || 'Main Hall'}</Text>
                </View>
              </View>

              {/* Countdown Banner */}
              <View style={styles.countdownBanner}>
                <Ionicons name="alarm" size={20} color="#DC2626" />
                <Text style={styles.countdownBannerText}>
                  {getDaysLeft(selectedExam.date)} Days Remaining Until Exam
                </Text>
              </View>
            </Card>

            {/* AI Revision Plan Section */}
            {!plan ? (
              <Card style={styles.planPromoCard}>
                <Ionicons name="rocket-outline" size={32} color={COLORS.primary} />
                <Text style={styles.planPromoTitle}>Personalized AI Exam Preparation Blueprint</Text>
                <Text style={styles.planPromoSub}>
                  Calculate your exam readiness score, high-yield topic priorities, and day-by-day revision milestones.
                </Text>
                <Button
                  title={generatingPlan ? 'Generating Roadmap...' : '⚡ Generate AI Exam Blueprint'}
                  onPress={handleGenerateRevisionPlan}
                  loading={generatingPlan}
                  variant="primary"
                  size="md"
                  icon="sparkles"
                  style={{ marginTop: 6 }}
                />
              </Card>
            ) : (
              <View>
                {/* Readiness Score Card */}
                <Card style={styles.readinessCard}>
                  <View style={styles.readinessRow}>
                    <View style={styles.scoreCircle}>
                      <Text style={styles.scoreCircleText}>{plan.readinessScore}%</Text>
                      <Text style={styles.scoreCircleSub}>Readiness</Text>
                    </View>
                    <View style={styles.readinessInfo}>
                      <Text style={styles.strategyTitle}>Strategic Approach</Text>
                      <Text style={styles.strategyDesc}>{plan.strategySummary}</Text>
                    </View>
                  </View>
                </Card>

                {/* High-Yield Topics Priority */}
                {plan.highYieldTopics && (
                  <Card>
                    <View style={styles.rowAlign}>
                      <Ionicons name="star" size={17} color="#D97706" style={styles.headerIcon} />
                      <Text style={styles.cardSectionTitle}>High-Yield Priority Topics</Text>
                    </View>
                    {plan.highYieldTopics.map((topic, idx) => (
                      <View key={idx} style={styles.topicItemRow}>
                        <View style={styles.priorityDot} />
                        <Text style={styles.topicText}>{topic}</Text>
                      </View>
                    ))}
                  </Card>
                )}

                {/* Day-by-day Milestones */}
                <Card>
                  <View style={styles.rowAlign}>
                    <Ionicons name="calendar" size={17} color={COLORS.primary} style={styles.headerIcon} />
                    <Text style={styles.cardSectionTitle}>Day-by-Day Revision Milestones</Text>
                  </View>

                  {plan.dailyMilestones.map((m, idx) => (
                    <View key={idx} style={styles.milestoneItem}>
                      <View style={styles.milestoneDayBadge}>
                        <Text style={styles.milestoneDayText}>Day {m.dayNumber}</Text>
                        <Text style={styles.milestoneHoursText}>{m.recommendedHours}h target</Text>
                      </View>

                      <View style={styles.milestoneContent}>
                        <Text style={styles.milestoneFocusTitle}>{m.focus}</Text>
                        <Text style={styles.milestoneTopics}>
                          Topics: {m.targetTopics.join(', ')}
                        </Text>
                        <View style={styles.milestoneActions}>
                          {m.actionItems.map((act, aIdx) => (
                            <View key={aIdx} style={styles.actionRow}>
                              <Ionicons name="checkmark-circle-outline" size={14} color="#059669" />
                              <Text style={styles.actionItemText}>{act}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))}
                </Card>

                {/* Exam Day Strategy Tips */}
                {plan.examDayTips && (
                  <Card style={styles.tipsCard}>
                    <View style={styles.rowAlign}>
                      <Ionicons name="shield-checkmark" size={17} color="#059669" style={styles.headerIcon} />
                      <Text style={styles.cardSectionTitle}>Exam Day Strategy</Text>
                    </View>
                    {plan.examDayTips.map((tip, idx) => (
                      <View key={idx} style={styles.tipRow}>
                        <Text style={styles.tipNum}>{idx + 1}.</Text>
                        <Text style={styles.tipBody}>{tip}</Text>
                      </View>
                    ))}
                  </Card>
                )}

                <Button
                  title="Regenerate Blueprint"
                  onPress={handleGenerateRevisionPlan}
                  loading={generatingPlan}
                  variant="outline"
                  size="md"
                  style={{ marginTop: 10 }}
                />
              </View>
            )}
          </View>
        ) : (
          <EmptyState
            icon="school-outline"
            title="No Exams Scheduled"
            description="Add your midterm and final exam dates to generate a customized countdown revision roadmap!"
            actionTitle="Add Upcoming Exam"
            onAction={() => setAddExamModal(true)}
          />
        )}
      </ScrollView>

      {/* Add Exam Modal */}
      <Modal visible={addExamModal} transparent animationType="slide" onRequestClose={() => setAddExamModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Upcoming Exam</Text>
              <TouchableOpacity onPress={() => setAddExamModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Exam Title</Text>
              <TextInput
                style={styles.textInput}
                value={examTitle}
                onChangeText={setExamTitle}
                placeholder="e.g. Midterm Examination: Data Structures"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.textInput}
                value={examSubject}
                onChangeText={setExamSubject}
                placeholder={profile?.subjects[0] || 'Subject'}
                placeholderTextColor={COLORS.textLight}
              />

              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Days Until Exam</Text>
                  <TextInput
                    style={styles.textInput}
                    value={examDaysAhead}
                    onChangeText={setExamDaysAhead}
                    keyboardType="numeric"
                    placeholder="7"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>

                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Target Grade</Text>
                  <TextInput
                    style={styles.textInput}
                    value={targetGrade}
                    onChangeText={setTargetGrade}
                    placeholder="A+"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Exam Hall / Room</Text>
              <TextInput
                style={styles.textInput}
                value={examRoom}
                onChangeText={setExamRoom}
                placeholder="Hall 301"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Syllabus Notes / Chapters</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={examNotes}
                onChangeText={setExamNotes}
                multiline
                numberOfLines={3}
                placeholder="Chapters 1 to 6, formulas, unit conversions..."
                placeholderTextColor={COLORS.textLight}
              />

              <Button
                title="Register Exam & Enable Reminders"
                onPress={handleCreateExam}
                variant="primary"
                size="md"
                icon="checkmark"
                style={styles.saveExamBtn}
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
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6
  },
  headerTitles: {
    flex: 1
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
  addExamBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  examPickerBar: {
    backgroundColor: COLORS.card,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  examPickerScroll: {
    paddingHorizontal: SPACING.base,
    gap: 8
  },
  examChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6
  },
  examChipActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171'
  },
  examChipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text
  },
  examChipTitleActive: {
    color: '#991B1B',
    fontWeight: '800'
  },
  examChipDays: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  examChipDaysActive: {
    color: '#DC2626',
    fontWeight: '700'
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 40
  },
  examHeroCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    marginBottom: SPACING.md
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  gradePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full
  },
  gradePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626'
  },
  heroExamTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 10
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2'
  },
  metaCol: {
    flex: 1
  },
  metaLabel: {
    fontSize: 11,
    color: '#991B1B',
    fontWeight: '600'
  },
  metaVal: {
    fontSize: 13,
    color: '#7F1D1D',
    fontWeight: '700',
    marginTop: 2
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: RADIUS.md,
    gap: 8,
    marginTop: 10
  },
  countdownBannerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626'
  },
  planPromoCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: 8,
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE'
  },
  planPromoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center'
  },
  planPromoSub: {
    fontSize: 13,
    color: '#4338CA',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16
  },
  readinessCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    marginBottom: SPACING.md
  },
  readinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small
  },
  scoreCircleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#059669'
  },
  scoreCircleSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#047857'
  },
  readinessInfo: {
    flex: 1
  },
  strategyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46'
  },
  strategyDesc: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 17,
    marginTop: 2
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  headerIcon: {
    marginRight: 6
  },
  topicItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 8
  },
  topicText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text
  },
  milestoneItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  milestoneDayBadge: {
    width: 70,
    marginRight: 10
  },
  milestoneDayText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary
  },
  milestoneHoursText: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  milestoneContent: {
    flex: 1
  },
  milestoneFocusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text
  },
  milestoneTopics: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  milestoneActions: {
    marginTop: 4,
    gap: 3
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  actionItemText: {
    fontSize: 12,
    color: '#334155'
  },
  tipsCard: {
    backgroundColor: '#F8FAFC'
  },
  tipRow: {
    flexDirection: 'row',
    marginVertical: 4
  },
  tipNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
    marginRight: 6
  },
  tipBody: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18
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
    padding: SPACING.lg,
    maxHeight: '90%'
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
  notesInput: {
    height: 70,
    textAlignVertical: 'top'
  },
  rowInputs: {
    flexDirection: 'row',
    gap: SPACING.md
  },
  flex1: {
    flex: 1
  },
  saveExamBtn: {
    marginTop: SPACING.lg
  }
});
