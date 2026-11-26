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
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { storage } from '../services/storage';
import { notifications } from '../services/notifications';
import { TimetableClass, StudentProfile } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

const DAYS = [
  { id: 1, name: 'Mon', fullName: 'Monday' },
  { id: 2, name: 'Tue', fullName: 'Tuesday' },
  { id: 3, name: 'Wed', fullName: 'Wednesday' },
  { id: 4, name: 'Thu', fullName: 'Thursday' },
  { id: 5, name: 'Fri', fullName: 'Friday' },
  { id: 6, name: 'Sat', fullName: 'Saturday' },
  { id: 7, name: 'Sun', fullName: 'Sunday' }
];

const COLOR_OPTIONS = [
  '#4F46E5', // Indigo
  '#0891B2', // Cyan
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#7C3AED', // Violet
  '#DB2777'  // Pink
];

interface TimetableScreenProps {
  navigation: any;
}

export const TimetableScreen: React.FC<TimetableScreenProps> = ({ navigation }) => {
  const [classes, setClasses] = useState<TimetableClass[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const d = new Date().getDay();
    return d === 0 ? 7 : d;
  });

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<TimetableClass | null>(null);
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [classColor, setClassColor] = useState(COLOR_OPTIONS[0]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const loadClasses = useCallback(async () => {
    try {
      const [list, prof] = await Promise.all([
        storage.getTimetable(),
        storage.getProfile()
      ]);
      setClasses(list);
      setProfile(prof);
    } catch (e) {
      console.warn('Failed to load timetable:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadClasses();
    }, [loadClasses])
  );

  const openClassModal = (cls?: TimetableClass) => {
    if (cls) {
      setEditingClass(cls);
      setSubject(cls.subject);
      setTeacher(cls.teacher);
      setRoom(cls.room);
      setDayOfWeek(cls.dayOfWeek);
      setStartTime(cls.startTime);
      setEndTime(cls.endTime);
      setClassColor(cls.color || COLOR_OPTIONS[0]);
      setNotificationsEnabled(cls.notificationsEnabled !== false);
    } else {
      setEditingClass(null);
      setSubject(profile?.subjects[0] || '');
      setTeacher('');
      setRoom('');
      setDayOfWeek(selectedDay);
      setStartTime('09:00');
      setEndTime('10:30');
      setClassColor(COLOR_OPTIONS[0]);
      setNotificationsEnabled(true);
    }
    setModalVisible(true);
  };

  const handleSaveClass = async () => {
    if (!subject.trim()) {
      Alert.alert('Validation', 'Please provide a subject name.');
      return;
    }

    try {
      if (editingClass) {
        const updated: TimetableClass = {
          ...editingClass,
          subject: subject.trim(),
          teacher: teacher.trim(),
          room: room.trim(),
          dayOfWeek,
          startTime: startTime.trim(),
          endTime: endTime.trim(),
          color: classColor,
          notificationsEnabled
        };
        await storage.updateTimetableClass(updated);
        if (notificationsEnabled) {
          await notifications.scheduleClassReminder(updated);
        }
      } else {
        const created = await storage.addTimetableClass({
          subject: subject.trim(),
          teacher: teacher.trim(),
          room: room.trim(),
          dayOfWeek,
          startTime: startTime.trim(),
          endTime: endTime.trim(),
          color: classColor,
          notificationsEnabled
        });
        if (notificationsEnabled) {
          await notifications.scheduleClassReminder(created);
        }
      }

      await loadClasses();
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to save timetable class.');
    }
  };

  const handleDeleteClass = async (id: string) => {
    Alert.alert('Delete Class', 'Are you sure you want to remove this class from your timetable?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await storage.deleteTimetableClass(id);
          await loadClasses();
          setModalVisible(false);
        }
      }
    ]);
  };

  const dailyClasses = classes
    .filter(c => c.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>University Timetable</Text>
          <Text style={styles.headerSubtitle}>Classes, lectures, rooms & instructors</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Daily / Weekly View Toggle */}
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              onPress={() => setViewMode('daily')}
              style={[styles.toggleBtn, viewMode === 'daily' && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, viewMode === 'daily' && styles.toggleTextActive]}>
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('weekly')}
              style={[styles.toggleBtn, viewMode === 'weekly' && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, viewMode === 'weekly' && styles.toggleTextActive]}>
                Weekly
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => openClassModal()}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Day Selector Bar (For Daily View) */}
      {viewMode === 'daily' && (
        <View style={styles.daySelectorRow}>
          {DAYS.map(day => {
            const isSelected = selectedDay === day.id;
            return (
              <TouchableOpacity
                key={day.id}
                activeOpacity={0.8}
                onPress={() => setSelectedDay(day.id)}
                style={[styles.dayTab, isSelected && styles.dayTabSelected]}
              >
                <Text style={[styles.dayTabText, isSelected && styles.dayTabTextSelected]}>
                  {day.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {viewMode === 'daily' ? (
          dailyClasses.length > 0 ? (
            <View style={styles.classesList}>
              {dailyClasses.map(cls => (
                <TouchableOpacity
                  key={cls.id}
                  activeOpacity={0.9}
                  onPress={() => openClassModal(cls)}
                  style={styles.classCard}
                >
                  <View style={[styles.colorIndicator, { backgroundColor: cls.color || COLORS.primary }]} />

                  <View style={styles.classCardBody}>
                    <View style={styles.classCardTop}>
                      <Text style={styles.classSubjectTitle}>{cls.subject}</Text>
                      <View style={styles.timeTag}>
                        <Ionicons name="time" size={13} color={COLORS.primary} />
                        <Text style={styles.timeTagText}>
                          {cls.startTime} - {cls.endTime}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.classDetailsRow}>
                      <View style={styles.detailItem}>
                        <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{cls.teacher || 'Instructor TBA'}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{cls.room || 'Room TBA'}</Text>
                      </View>
                    </View>

                    {cls.notificationsEnabled && (
                      <View style={styles.notificationNotice}>
                        <Ionicons name="notifications" size={12} color="#059669" />
                        <Text style={styles.notificationText}>Reminder 15m prior enabled</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="school-outline"
              title={`No Classes on ${DAYS.find(d => d.id === selectedDay)?.fullName}`}
              description="Enjoy your free time or add a new lecture to your schedule!"
              actionTitle="Add Class"
              onAction={() => openClassModal()}
            />
          )
        ) : (
          /* Weekly View */
          <View style={styles.weeklyContainer}>
            {DAYS.map(day => {
              const dayClasses = classes
                .filter(c => c.dayOfWeek === day.id)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <Card key={day.id} style={styles.weeklyDayCard}>
                  <View style={styles.weeklyDayHeader}>
                    <Text style={styles.weeklyDayTitle}>{day.fullName}</Text>
                    <Text style={styles.weeklyClassCount}>
                      {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                    </Text>
                  </View>

                  {dayClasses.length > 0 ? (
                    dayClasses.map(cls => (
                      <TouchableOpacity
                        key={cls.id}
                        activeOpacity={0.8}
                        onPress={() => openClassModal(cls)}
                        style={styles.weeklyClassRow}
                      >
                        <View
                          style={[
                            styles.weeklyClassColorStrip,
                            { backgroundColor: cls.color || COLORS.primary }
                          ]}
                        />
                        <View style={styles.weeklyClassInfo}>
                          <Text style={styles.weeklyClassSubject}>{cls.subject}</Text>
                          <Text style={styles.weeklyClassMeta}>
                            {cls.room} &bull; {cls.teacher}
                          </Text>
                        </View>
                        <Text style={styles.weeklyClassTime}>{cls.startTime}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noClassesWeekly}>Free Day</Text>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add / Edit Class Modal */}
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
                {editingClass ? 'Edit Timetable Class' : 'Add Class'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Subject / Course</Text>
              <TextInput
                style={styles.textInput}
                value={subject}
                onChangeText={setSubject}
                placeholder="e.g. Data Structures"
                placeholderTextColor={COLORS.textLight}
              />

              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Teacher / Professor</Text>
                  <TextInput
                    style={styles.textInput}
                    value={teacher}
                    onChangeText={setTeacher}
                    placeholder="Prof. Smith"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>

                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Room / Hall</Text>
                  <TextInput
                    style={styles.textInput}
                    value={room}
                    onChangeText={setRoom}
                    placeholder="Hall 301"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>

              {/* Day of Week Selector */}
              <Text style={styles.inputLabel}>Day of Week</Text>
              <View style={styles.dayButtonRow}>
                {DAYS.map(day => (
                  <TouchableOpacity
                    key={day.id}
                    onPress={() => setDayOfWeek(day.id)}
                    style={[
                      styles.daySelectBtn,
                      dayOfWeek === day.id && styles.daySelectBtnActive
                    ]}
                  >
                    <Text
                      style={[
                        styles.daySelectBtnText,
                        dayOfWeek === day.id && styles.daySelectBtnTextActive
                      ]}
                    >
                      {day.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Start Time</Text>
                  <TextInput
                    style={styles.textInput}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="09:00"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>

                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>End Time</Text>
                  <TextInput
                    style={styles.textInput}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="10:30"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>

              {/* Color Theme Selector */}
              <Text style={styles.inputLabel}>Color Tag</Text>
              <View style={styles.colorPalette}>
                {COLOR_OPTIONS.map(c => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setClassColor(c)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: c },
                      classColor === c && styles.colorCircleActive
                    ]}
                  />
                ))}
              </View>

              {/* Notification Toggle */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextGroup}>
                  <Text style={styles.toggleRowTitle}>15-Minute Class Reminder</Text>
                  <Text style={styles.toggleRowSubtitle}>
                    Notify before class begins
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                  thumbColor={notificationsEnabled ? COLORS.primary : '#F8FAFC'}
                />
              </View>

              <View style={styles.modalActionButtons}>
                {editingClass && (
                  <Button
                    title="Delete"
                    onPress={() => handleDeleteClass(editingClass.id)}
                    variant="danger"
                    size="md"
                    icon="trash"
                    style={styles.modalBtnDelete}
                  />
                )}
                <Button
                  title={editingClass ? 'Save Class' : 'Create Class'}
                  onPress={handleSaveClass}
                  variant="primary"
                  size="md"
                  icon="checkmark"
                  style={styles.modalBtnSave}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.sm
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  toggleTextActive: {
    color: '#FFFFFF'
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small
  },
  daySelectorRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'space-between'
  },
  dayTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full
  },
  dayTabSelected: {
    backgroundColor: COLORS.primaryBg
  },
  dayTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  dayTabTextSelected: {
    color: COLORS.primary,
    fontWeight: '800'
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 40
  },
  classesList: {
    gap: SPACING.md
  },
  classCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.small
  },
  colorIndicator: {
    width: 6
  },
  classCardBody: {
    flex: 1,
    padding: SPACING.base
  },
  classCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  classSubjectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4
  },
  timeTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary
  },
  classDetailsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginVertical: 4
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textMuted
  },
  notificationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6
  },
  notificationText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600'
  },
  weeklyContainer: {
    gap: SPACING.md
  },
  weeklyDayCard: {
    marginBottom: 0
  },
  weeklyDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6
  },
  weeklyDayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text
  },
  weeklyClassCount: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  weeklyClassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC'
  },
  weeklyClassColorStrip: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 10
  },
  weeklyClassInfo: {
    flex: 1
  },
  weeklyClassSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text
  },
  weeklyClassMeta: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  weeklyClassTime: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary
  },
  noClassesWeekly: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
    paddingVertical: 4
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
  rowInputs: {
    flexDirection: 'row',
    gap: SPACING.md
  },
  flex1: {
    flex: 1
  },
  dayButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4
  },
  daySelectBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  daySelectBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  daySelectBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  daySelectBtnTextActive: {
    color: '#FFFFFF'
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 6
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  colorCircleActive: {
    borderWidth: 3,
    borderColor: '#0F172A'
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.md,
    paddingVertical: 6
  },
  toggleTextGroup: {
    flex: 1
  },
  toggleRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text
  },
  toggleRowSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.base
  },
  modalBtnDelete: {
    flex: 1
  },
  modalBtnSave: {
    flex: 2
  }
});
