import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Vibration,
  Alert,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { storage } from '../services/storage';
import { StudentProfile } from '../types';
import { Button } from '../components/Button';

type FocusModeType = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';

export const FocusModeScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route
}) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('General');
  const [taskTitle, setTaskTitle] = useState<string>('');

  const [mode, setMode] = useState<FocusModeType>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [initialMinutes, setInitialMinutes] = useState<number>(25);

  // Custom Minutes Modal
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState('45');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    storage.getProfile().then(prof => {
      setProfile(prof);
      if (prof.subjects.length > 0) {
        setSelectedSubject(prof.subjects[0]);
      }
    });

    if (route.params?.subject) {
      setSelectedSubject(route.params.subject);
    }
    if (route.params?.taskTitle) {
      setTaskTitle(route.params.taskTitle);
    }
  }, [route.params?.subject, route.params?.taskTitle]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    Vibration.vibrate([0, 500, 200, 500]);

    if (mode === 'pomodoro' || mode === 'custom') {
      const minutes = initialMinutes;
      await storage.logFocusSession({
        mode,
        durationMinutes: minutes,
        subject: selectedSubject,
        taskTitle: taskTitle || undefined
      });

      Alert.alert(
        'Focus Session Complete! 🏆',
        `Great job! You logged ${minutes} minutes of deep focus on ${selectedSubject}. +${minutes} Points added!`
      );
    } else {
      Alert.alert('Break Finished! ☕', 'Time to get back into the study flow!');
    }
  };

  const setTimerMode = (newMode: FocusModeType, customMins?: number) => {
    setIsRunning(false);
    setMode(newMode);
    let mins = 25;
    if (newMode === 'pomodoro') mins = 25;
    else if (newMode === 'shortBreak') mins = 5;
    else if (newMode === 'longBreak') mins = 15;
    else if (newMode === 'custom') mins = customMins || 45;

    setInitialMinutes(mins);
    setTimeLeft(mins * 60);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialMinutes * 60);
  };

  const handleSaveCustom = () => {
    const mins = parseInt(customMinutesInput, 10);
    if (!mins || mins <= 0 || mins > 240) {
      Alert.alert('Invalid Duration', 'Please enter between 1 and 240 minutes.');
      return;
    }
    setCustomModalVisible(false);
    setTimerMode('custom', mins);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round(((initialMinutes * 60 - timeLeft) / (initialMinutes * 60)) * 100))
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Focus Study Mode</Text>
          <Text style={styles.headerSubtitle}>Pomodoro & Deep Work Timer</Text>
        </View>
        <TouchableOpacity
          onPress={() => setCustomModalVisible(true)}
          style={styles.customBtn}
        >
          <Ionicons name="options-outline" size={20} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Mode Selector Tabs */}
        <View style={styles.modeTabsRow}>
          <TouchableOpacity
            onPress={() => setTimerMode('pomodoro')}
            style={[styles.modeTab, mode === 'pomodoro' && styles.modeTabActive]}
          >
            <Text style={[styles.modeTabText, mode === 'pomodoro' && styles.modeTabTextActive]}>
              Pomodoro (25m)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTimerMode('shortBreak')}
            style={[styles.modeTab, mode === 'shortBreak' && styles.modeTabActive]}
          >
            <Text style={[styles.modeTabText, mode === 'shortBreak' && styles.modeTabTextActive]}>
              Short Break (5m)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTimerMode('longBreak')}
            style={[styles.modeTab, mode === 'longBreak' && styles.modeTabActive]}
          >
            <Text style={[styles.modeTabText, mode === 'longBreak' && styles.modeTabTextActive]}>
              Long Break (15m)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subject & Task Indicator */}
        <View style={styles.focusContextCard}>
          <Ionicons name="book" size={16} color="#818CF8" />
          <Text style={styles.focusSubjectText}>{selectedSubject}</Text>
          {taskTitle ? (
            <Text style={styles.focusTaskText} numberOfLines={1}>
              &bull; {taskTitle}
            </Text>
          ) : null}
        </View>

        {/* Large Timer Dial Display */}
        <View style={styles.timerDialContainer}>
          <View style={styles.timerOuterRing}>
            <View style={styles.timerInnerDial}>
              <Text style={styles.timerDigitsText}>{formatTime(timeLeft)}</Text>
              <Text style={styles.timerModeLabel}>
                {mode === 'pomodoro'
                  ? 'DEEP FOCUS'
                  : mode === 'custom'
                  ? 'CUSTOM FOCUS'
                  : 'BRAIN BREAK'}
              </Text>
              <Text style={styles.timerProgressSub}>{progressPercent}% Elapsed</Text>
            </View>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={resetTimer}
            style={styles.secondaryControlBtn}
          >
            <Ionicons name="refresh" size={24} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleTimer}
            style={[
              styles.primaryPlayBtn,
              isRunning && { backgroundColor: '#EF4444' }
            ]}
          >
            <Ionicons
              name={isRunning ? 'pause' : 'play'}
              size={36}
              color="#FFFFFF"
              style={{ marginLeft: isRunning ? 0 : 4 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Games')}
            style={styles.secondaryControlBtn}
          >
            <Ionicons name="game-controller-outline" size={24} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Motivational Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="flame" size={16} color="#F59E0B" />
          <Text style={styles.tipText}>
            Eliminate notifications & distractions. Each minute studied earns +1 Gamification Point!
          </Text>
        </View>
      </View>

      {/* Custom Duration Modal */}
      <Modal visible={customModalVisible} transparent animationType="slide" onRequestClose={() => setCustomModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Custom Study Timer</Text>
              <TouchableOpacity onPress={() => setCustomModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Study Session Minutes (1 to 240)</Text>
            <TextInput
              style={styles.textInput}
              value={customMinutesInput}
              onChangeText={setCustomMinutesInput}
              keyboardType="numeric"
              placeholder="45"
              placeholderTextColor={COLORS.textLight}
            />

            <Button
              title="Set Custom Timer"
              onPress={handleSaveCustom}
              variant="primary"
              size="md"
              icon="checkmark"
              style={styles.setTimerBtn}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A' // Ambient Dark Theme for Zero Distraction
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitleBox: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC'
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8'
  },
  customBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.base
  },
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: RADIUS.full,
    padding: 3,
    borderWidth: 1,
    borderColor: '#334155'
  },
  modeTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full
  },
  modeTabActive: {
    backgroundColor: COLORS.primary
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8'
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  focusContextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155'
  },
  focusSubjectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC'
  },
  focusTaskText: {
    fontSize: 12,
    color: '#94A3B8',
    maxWidth: 150
  },
  timerDialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20
  },
  timerOuterRing: {
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 5,
    borderColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    ...SHADOWS.large
  },
  timerInnerDial: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  timerDigitsText: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'monospace',
    letterSpacing: 2
  },
  timerModeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#818CF8',
    letterSpacing: 2,
    marginTop: 4
  },
  timerProgressSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28
  },
  secondaryControlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  primaryPlayBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
    marginTop: 6
  },
  textInput: {

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background
  },
  setTimerBtn: {
    marginTop: SPACING.lg
  }
});
