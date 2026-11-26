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
import { pdfExport } from '../services/pdf';
import {
  DailySchedule,
  PlannedTask,
  StudentProfile,
  TimetableClass,
  Assignment,
  Exam
} from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

interface PlannerScreenProps {
  navigation: any;
}

export const PlannerScreen: React.FC<PlannerScreenProps> = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);

  // Edit / Add Task Modal
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<PlannedTask | null>(null);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskTime, setTaskTime] = useState<string>('');
  const [taskSubject, setTaskSubject] = useState<string>('');
  const [taskNotes, setTaskNotes] = useState<string>('');
  const [taskDuration, setTaskDuration] = useState<string>('45');
  const [taskIsBreak, setTaskIsBreak] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prof, sched] = await Promise.all([
        storage.getProfile(),
        storage.getDailySchedule(selectedDate)
      ]);
      setProfile(prof);
      setSchedule(sched);
    } catch (e) {
      console.warn('Failed to load schedule:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleGenerateAiSchedule = async () => {
    setGenerating(true);
    try {
      const [prof, timetable, assignments, exams] = await Promise.all([
        storage.getProfile(),
        storage.getTimetable(),
        storage.getAssignments(),
        storage.getExams()
      ]);

      const currentDay = new Date(selectedDate).getDay();
      const dayOfWeek = currentDay === 0 ? 7 : currentDay;
      const todayClasses = timetable.filter(c => c.dayOfWeek === dayOfWeek);

      const res = await api.generateDailyStudyPlan({
        studentField: prof.field,
        universityTimetable: todayClasses,
        sleepTime: prof.sleepTime || '23:00',
        wakeTime: prof.wakeTime || '07:00',
        subjects: prof.subjects,
        assignments: assignments.filter(a => !a.completed),
        exams: exams
      });

      if (res.success && res.schedule) {
        const newSched: DailySchedule = {
          date: selectedDate,
          tasks: res.schedule,
          generatedAt: new Date().toISOString()
        };
        await storage.saveDailySchedule(newSched);
        setSchedule(newSched);
        Alert.alert('AI Schedule Generated', 'Personalized daily schedule created with balanced study, classes, and breaks!');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to generate study schedule.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTaskCompleted = async (taskId: string) => {
    if (!schedule) return;
    const updatedTasks = schedule.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    const updatedSchedule: DailySchedule = {
      ...schedule,
      tasks: updatedTasks
    };

    setSchedule(updatedSchedule);
    await storage.saveDailySchedule(updatedSchedule);
  };

  const openEditModal = (task?: PlannedTask) => {
    if (task) {
      setEditingTask(task);
      setTaskTitle(task.title);
      setTaskTime(task.time);
      setTaskSubject(task.subject);
      setTaskNotes(task.notes);
      setTaskDuration(String(task.durationMinutes));
      setTaskIsBreak(task.isBreak);
    } else {
      setEditingTask(null);
      setTaskTitle('');
      setTaskTime('15:00 - 15:45');
      setTaskSubject(profile?.subjects[0] || 'General');
      setTaskNotes('');
      setTaskDuration('45');
      setTaskIsBreak(false);
    }
    setModalVisible(true);
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Validation', 'Please provide a task title');
      return;
    }

    const currentTasks = schedule?.tasks ? [...schedule.tasks] : [];

    if (editingTask) {
      // Update existing
      const idx = currentTasks.findIndex(t => t.id === editingTask.id);
      if (idx !== -1) {
        currentTasks[idx] = {
          ...editingTask,
          title: taskTitle.trim(),
          time: taskTime.trim(),
          subject: taskSubject.trim(),
          notes: taskNotes.trim(),
          durationMinutes: parseInt(taskDuration, 10) || 45,
          isBreak: taskIsBreak
        };
      }
    } else {
      // Add new
      const newTask: PlannedTask = {
        id: 'task_' + Date.now(),
        title: taskTitle.trim(),
        time: taskTime.trim(),
        subject: taskSubject.trim(),
        notes: taskNotes.trim(),
        durationMinutes: parseInt(taskDuration, 10) || 45,
        isBreak: taskIsBreak,
        type: taskIsBreak ? 'break' : 'study',
        completed: false
      };
      currentTasks.push(newTask);
    }

    const updatedSched: DailySchedule = {
      date: selectedDate,
      tasks: currentTasks,
      generatedAt: schedule?.generatedAt || new Date().toISOString()
    };

    setSchedule(updatedSched);
    await storage.saveDailySchedule(updatedSched);
    setModalVisible(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!schedule) return;
    const updatedTasks = schedule.tasks.filter(t => t.id !== taskId);
    const updatedSched: DailySchedule = { ...schedule, tasks: updatedTasks };
    setSchedule(updatedSched);
    await storage.saveDailySchedule(updatedSched);
    setModalVisible(false);
  };

  const handleExportPdf = async () => {
    if (!schedule || schedule.tasks.length === 0) {
      Alert.alert('No Schedule', 'Please generate or add tasks to your schedule before exporting.');
      return;
    }
    try {
      await pdfExport.exportStudyPlanToPdf(
        schedule,
        profile?.name || 'Student',
        profile?.field || 'General'
      );
    } catch (e) {
      Alert.alert('Export Failed', 'Could not generate PDF.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>AI Daily Study Planner</Text>
          <Text style={styles.headerSubtitle}>Personalized routine & smart time blocking</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleExportPdf}
            style={styles.headerIconButton}
          >
            <Ionicons name="share-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openEditModal()}
            style={[styles.headerIconButton, { backgroundColor: COLORS.primaryBg }]}
          >
            <Ionicons name="add" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Bar & AI Generate Action */}
      <View style={styles.actionBar}>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
          <Text style={styles.dateText}>
            {new Date(selectedDate).toLocaleDateString([], {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </View>

        <Button
          title={generating ? 'Generating...' : '⚡ Generate AI Routine'}
          onPress={handleGenerateAiSchedule}
          loading={generating}
          variant="primary"
          size="sm"
          icon="sparkles"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : schedule && schedule.tasks.length > 0 ? (
          <View style={styles.tasksTimeline}>
            {schedule.tasks.map((task, index) => {
              const isClass = task.type === 'class';
              const isBreak = task.isBreak;

              return (
                <View key={task.id} style={styles.timelineRow}>
                  {/* Left line & bullet */}
                  <View style={styles.timelineTracker}>
                    <View
                      style={[
                        styles.trackerDot,
                        task.completed && styles.trackerDotDone,
                        isBreak && styles.trackerDotBreak
                      ]}
                    />
                    {index < schedule.tasks.length - 1 && <View style={styles.trackerLine} />}
                  </View>

                  {/* Task Card */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openEditModal(task)}
                    style={[
                      styles.taskCard,
                      task.completed && styles.taskCardCompleted,
                      isBreak && styles.taskCardBreak
                    ]}
                  >
                    <View style={styles.taskCardTop}>
                      <View style={styles.taskTimeRow}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={isBreak ? '#D97706' : COLORS.primary}
                        />
                        <Text style={[styles.taskTimeText, isBreak && { color: '#D97706' }]}>
                          {task.time} ({task.durationMinutes}m)
                        </Text>
                      </View>
                      <View style={styles.taskBadgeRow}>
                        <Badge
                          label={task.type.toUpperCase()}
                          variant={isBreak ? 'warning' : isClass ? 'info' : 'primary'}
                          size="sm"
                        />
                        <TouchableOpacity
                          onPress={() => handleToggleTaskCompleted(task.id)}
                          style={styles.checkTouch}
                        >
                          <Ionicons
                            name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                            size={22}
                            color={task.completed ? COLORS.success : COLORS.borderDark}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text
                      style={[styles.taskTitle, task.completed && styles.taskTitleDone]}
                      numberOfLines={2}
                    >
                      {task.title}
                    </Text>

                    <Text style={styles.taskSubject}>
                      Subject: {task.subject}
                    </Text>

                    {task.notes ? (
                      <Text style={styles.taskNotes} numberOfLines={2}>
                        📝 {task.notes}
                      </Text>
                    ) : null}

                    {/* Quick Pomodoro Launch for Study Blocks */}
                    {!isBreak && !task.completed && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                          navigation.navigate('FocusMode', {
                            subject: task.subject,
                            taskTitle: task.title
                          })
                        }
                        style={styles.pomodoroLaunchPill}
                      >
                        <Ionicons name="timer-outline" size={13} color={COLORS.primary} />
                        <Text style={styles.pomodoroLaunchText}>Start Focus Session</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="No Schedule for Today"
            description="Tap 'Generate AI Routine' to create an optimized schedule based on your classes, sleep hours, assignments, and exam dates!"
            actionTitle="Generate AI Schedule"
            onAction={handleGenerateAiSchedule}
          />
        )}
      </ScrollView>

      {/* Edit / Reschedule Task Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTask ? 'Reschedule / Edit Task' : 'Add Custom Task'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Task Title</Text>
              <TextInput
                style={styles.textInput}
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholder="e.g. Chapter 4 Practice Problems"
                placeholderTextColor={COLORS.textLight}
              />

              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Time Window</Text>
                  <TextInput
                    style={styles.textInput}
                    value={taskTime}
                    onChangeText={setTaskTime}
                    placeholder="10:00 - 11:30"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>

                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Duration (mins)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={taskDuration}
                    onChangeText={setTaskDuration}
                    keyboardType="numeric"
                    placeholder="60"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.textInput}
                value={taskSubject}
                onChangeText={setTaskSubject}
                placeholder="e.g. Data Structures"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Notes / Goal</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={taskNotes}
                onChangeText={setTaskNotes}
                multiline
                numberOfLines={3}
                placeholder="Specific objective or page numbers..."
                placeholderTextColor={COLORS.textLight}
              />

              {/* Break toggle */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTaskIsBreak(!taskIsBreak)}
                style={styles.breakToggleRow}
              >
                <Ionicons
                  name={taskIsBreak ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={taskIsBreak ? COLORS.primary : COLORS.borderDark}
                />
                <Text style={styles.breakToggleText}>Mark as Break / Rest slot</Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                {editingTask && (
                  <Button
                    title="Delete"
                    onPress={() => handleDeleteTask(editingTask.id)}
                    variant="danger"
                    size="md"
                    icon="trash"
                    style={styles.deleteBtn}
                  />
                )}
                <Button
                  title={editingTask ? 'Save Changes' : 'Add Task'}
                  onPress={handleSaveTask}
                  variant="primary"
                  size="md"
                  icon="checkmark"
                  style={styles.saveBtn}
                />
              </View>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  dateText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 60
  },
  loader: {
    marginTop: 50
  },
  tasksTimeline: {
    paddingTop: 8
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md
  },
  timelineTracker: {
    alignItems: 'center',
    width: 24,
    marginRight: 10
  },
  trackerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...SHADOWS.small
  },
  trackerDotDone: {
    backgroundColor: COLORS.success
  },
  trackerDotBreak: {
    backgroundColor: '#F59E0B'
  },
  trackerLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.borderDark,
    marginVertical: 4
  },
  taskCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small
  },
  taskCardCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.8
  },
  taskCardBreak: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A'
  },
  taskCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  taskTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  taskTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary
  },
  taskBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  checkTouch: {
    padding: 2
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 3
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight
  },
  taskSubject: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4
  },
  taskNotes: {
    fontSize: 12,
    color: '#475569',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    padding: 6,
    borderRadius: RADIUS.sm,
    marginBottom: 6
  },
  pomodoroLaunchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
    marginTop: 4
  },
  pomodoroLaunchText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '85%'
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
  breakToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: SPACING.md
  },
  breakToggleText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500'
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.base
  },
  deleteBtn: {
    flex: 1
  },
  saveBtn: {
    flex: 2
  }
});
