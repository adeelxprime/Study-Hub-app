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
import { notifications } from '../services/notifications';
import { Assignment, AssignmentPriority, StudentProfile } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

type FilterType = 'All' | 'Pending' | 'Completed' | 'High';

export const AssignmentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('Pending');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('3');
  const [priority, setPriority] = useState<AssignmentPriority>('Medium');
  const [description, setDescription] = useState('');
  const [score, setScore] = useState('');

  const loadAssignments = useCallback(async () => {
    try {
      const [list, prof] = await Promise.all([
        storage.getAssignments(),
        storage.getProfile()
      ]);
      setAssignments(list);
      setProfile(prof);
    } catch (e) {
      console.warn('Failed to load assignments:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAssignments();
    }, [loadAssignments])
  );

  const openModal = (asg?: Assignment) => {
    if (asg) {
      setEditingAssignment(asg);
      setTitle(asg.title);
      setSubject(asg.subject);
      const diffDays = Math.max(
        1,
        Math.round((new Date(asg.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );
      setDeadlineDays(String(diffDays));
      setPriority(asg.priority);
      setDescription(asg.description || '');
      setScore(asg.score || '');
    } else {
      setEditingAssignment(null);
      setTitle('');
      setSubject(profile?.subjects[0] || '');
      setDeadlineDays('3');
      setPriority('Medium');
      setDescription('');
      setScore('');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !subject.trim()) {
      Alert.alert('Validation', 'Please provide a title and subject.');
      return;
    }

    const days = parseInt(deadlineDays, 10) || 3;
    const deadlineDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    try {
      if (editingAssignment) {
        const updated: Assignment = {
          ...editingAssignment,
          title: title.trim(),
          subject: subject.trim(),
          deadline: deadlineDate,
          priority,
          description: description.trim(),
          score: score.trim() || undefined
        };
        const currentList = await storage.getAssignments();
        const idx = currentList.findIndex(a => a.id === editingAssignment.id);
        if (idx !== -1) {
          currentList[idx] = updated;
          await storage.saveAssignments(currentList);
          await notifications.scheduleAssignmentReminder(updated);
        }
      } else {
        const created = await storage.addAssignment({
          title: title.trim(),
          subject: subject.trim(),
          deadline: deadlineDate,
          priority,
          description: description.trim(),
          completed: false,
          score: score.trim() || undefined
        });
        await notifications.scheduleAssignmentReminder(created);
      }

      await loadAssignments();
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to save assignment.');
    }
  };

  const handleToggleCompleted = async (id: string) => {
    const isCompleted = await storage.toggleAssignmentCompleted(id);
    if (isCompleted) {
      Alert.alert('Well done! 🎉', '+10 Points awarded for completing this assignment.');
    }
    await loadAssignments();
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this assignment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await storage.deleteAssignment(id);
          await loadAssignments();
          setModalVisible(false);
        }
      }
    ]);
  };

  const filteredAssignments = assignments.filter(a => {
    if (activeFilter === 'Pending') return !a.completed;
    if (activeFilter === 'Completed') return a.completed;
    if (activeFilter === 'High') return a.priority === 'High';
    return true;
  });

  const completedCount = assignments.filter(a => a.completed).length;
  const pendingCount = assignments.filter(a => !a.completed).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Assignments & Projects</Text>
          <Text style={styles.headerSubtitle}>Deadlines, priorities & grading</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => openModal()}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats Summary */}
      <View style={styles.statsSummaryBar}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>
            {assignments.length > 0
              ? Math.round((completedCount / assignments.length) * 100)
              : 0}%
          </Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['Pending', 'All', 'High', 'Completed'] as FilterType[]).map(tab => {
          const isSelected = activeFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveFilter(tab)}
              style={[styles.filterTab, isSelected && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, isSelected && styles.filterTabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map(asg => {
            const daysLeft = Math.ceil(
              (new Date(asg.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            const isOverdue = daysLeft < 0 && !asg.completed;

            return (
              <Card key={asg.id} style={styles.asgCard}>
                <View style={styles.asgCardTop}>
                  <TouchableOpacity
                    onPress={() => handleToggleCompleted(asg.id)}
                    style={styles.checkTouch}
                  >
                    <Ionicons
                      name={asg.completed ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={asg.completed ? COLORS.success : COLORS.borderDark}
                    />
                  </TouchableOpacity>

                  <View style={styles.asgTitleCol}>
                    <Text
                      style={[styles.asgTitle, asg.completed && styles.asgTitleDone]}
                      numberOfLines={2}
                    >
                      {asg.title}
                    </Text>
                    <Text style={styles.asgSubject}>{asg.subject}</Text>
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
                </View>

                {asg.description ? (
                  <Text style={styles.asgDesc} numberOfLines={3}>
                    {asg.description}
                  </Text>
                ) : null}

                <View style={styles.asgFooter}>
                  <View style={styles.deadlineContainer}>
                    <Ionicons
                      name={isOverdue ? 'alert-circle' : 'time-outline'}
                      size={15}
                      color={isOverdue ? COLORS.danger : COLORS.textMuted}
                    />
                    <Text
                      style={[
                        styles.deadlineText,
                        isOverdue && { color: COLORS.danger, fontWeight: '700' }
                      ]}
                    >
                      {isOverdue
                        ? 'Overdue!'
                        : daysLeft === 0
                        ? 'Due Today'
                        : `Due in ${daysLeft} days`}
                    </Text>
                  </View>

                  {asg.score && (
                    <View style={styles.scorePill}>
                      <Text style={styles.scoreText}>Grade: {asg.score}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => openModal(asg)}
                    style={styles.editBtn}
                  >
                    <Ionicons name="create-outline" size={17} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="clipboard-outline"
            title="No Assignments Found"
            description={
              activeFilter === 'Pending'
                ? 'All caught up on assignments! You can add a new one anytime.'
                : 'No assignments match the selected filter.'
            }
            actionTitle="Add Assignment"
            onAction={() => openModal()}
          />
        )}
      </ScrollView>

      {/* Add / Edit Assignment Modal */}
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
                {editingAssignment ? 'Edit Assignment' : 'Add Assignment'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Assignment Title</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Lab Report 3: Synthesis of Aspirin"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.textInput}
                value={subject}
                onChangeText={setSubject}
                placeholder="e.g. Chemistry"
                placeholderTextColor={COLORS.textLight}
              />

              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Days Until Deadline</Text>
                  <TextInput
                    style={styles.textInput}
                    value={deadlineDays}
                    onChangeText={setDeadlineDays}
                    keyboardType="numeric"
                    placeholder="3"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>

                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Priority Level</Text>
                  <View style={styles.prioritySelector}>
                    {(['Low', 'Medium', 'High'] as AssignmentPriority[]).map(p => (
                      <TouchableOpacity
                        key={p}
                        onPress={() => setPriority(p)}
                        style={[
                          styles.priorityBtn,
                          priority === p && styles.priorityBtnActive,
                          priority === p &&
                            p === 'High' && { backgroundColor: '#EF4444' },
                          priority === p &&
                            p === 'Medium' && { backgroundColor: '#F59E0B' },
                          priority === p &&
                            p === 'Low' && { backgroundColor: '#10B981' }
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityBtnText,
                            priority === p && styles.priorityBtnTextActive
                          ]}
                        >
                          {p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>Description / Rubric Notes</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                placeholder="Key requirements, formatting rules, questions to solve..."
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Grade / Score (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={score}
                onChangeText={setScore}
                placeholder="e.g. 95/100 or A"
                placeholderTextColor={COLORS.textLight}
              />

              <View style={styles.modalActionButtons}>
                {editingAssignment && (
                  <Button
                    title="Delete"
                    onPress={() => handleDelete(editingAssignment.id)}
                    variant="danger"
                    size="md"
                    icon="trash"
                    style={styles.modalBtnDelete}
                  />
                )}
                <Button
                  title={editingAssignment ? 'Save Changes' : 'Create Assignment'}
                  onPress={handleSave}
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
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small
  },
  statsSummaryBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  statBox: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background
  },
  filterTabActive: {
    backgroundColor: COLORS.primary
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  filterTabTextActive: {
    color: '#FFFFFF'
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 40
  },
  asgCard: {
    marginBottom: SPACING.md
  },
  asgCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  checkTouch: {
    paddingTop: 2
  },
  asgTitleCol: {
    flex: 1
  },
  asgTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text
  },
  asgTitleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight
  },
  asgSubject: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  asgDesc: {
    fontSize: 13,
    color: '#475569',
    marginTop: 8,
    lineHeight: 18
  },
  asgFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  deadlineText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500'
  },
  scorePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669'
  },
  editBtn: {
    padding: 4
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
  prioritySelector: {
    flexDirection: 'row',
    gap: 4
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center'
  },
  priorityBtnActive: {
    borderColor: 'transparent'
  },
  priorityBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  priorityBtnTextActive: {
    color: '#FFFFFF'
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
