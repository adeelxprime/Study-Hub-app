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
import { STUDENT_FIELDS } from '../constants/fields';
import { QuizQuestion, QuizResult, StudentProfile, Lecture } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

export const QuizScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [activeTab, setActiveTab] = useState<'take' | 'history'>('take');

  // Active Quiz State
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [activeQuizTitle, setActiveQuizTitle] = useState<string>('');
  const [activeQuizSubject, setActiveQuizSubject] = useState<string>('');
  const [quizInProgress, setQuizInProgress] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [completedResult, setCompletedResult] = useState<QuizResult | null>(null);

  // AI Quiz Generator Modal
  const [generatorModalVisible, setGeneratorModalVisible] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genSubject, setGenSubject] = useState('');
  const [genLectureId, setGenLectureId] = useState<string | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [prof, hist, lecs] = await Promise.all([
        storage.getProfile(),
        storage.getQuizHistory(),
        storage.getLectures()
      ]);
      setProfile(prof);
      setQuizHistory(hist);
      setLectures(lecs);
      if (prof.subjects.length > 0) {
        setGenSubject(prof.subjects[0]);
      }
    } catch (e) {
      console.warn('Failed to load quiz data:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Start field-based quiz
  const handleStartFieldQuiz = () => {
    const fieldMeta = STUDENT_FIELDS.find(f => f.id === profile?.field) || STUDENT_FIELDS[0];
    const questions = [...fieldMeta.sampleQuestions].sort(() => 0.5 - Math.random());

    setCurrentQuestions(questions);
    setActiveQuizTitle(`${fieldMeta.shortName} Core Exam Quiz`);
    setActiveQuizSubject(fieldMeta.name);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizInProgress(true);
    setQuizCompleted(false);
  };

  // Generate custom quiz from topic / lecture
  const handleGenerateAiQuiz = async () => {
    if (!genTopic.trim() && !genLectureId) {
      Alert.alert('Validation', 'Please provide a topic or select a lecture.');
      return;
    }

    setGeneratingQuiz(true);
    try {
      const selectedLec = genLectureId ? lectures.find(l => l.id === genLectureId) : null;
      const topicName = genTopic.trim() || selectedLec?.title || 'General';
      const subjectName = genSubject.trim() || selectedLec?.subject || 'General';
      const lectureNotes = selectedLec
        ? `${selectedLec.title}\n${selectedLec.classwork}\n${selectedLec.ocrText || ''}`
        : '';

      const res = await api.generateCustomQuiz(
        profile?.field || 'General',
        topicName,
        subjectName,
        lectureNotes,
        5
      );

      if (res.success && res.questions && res.questions.length > 0) {
        setGeneratorModalVisible(false);
        setCurrentQuestions(res.questions);
        setActiveQuizTitle(`AI Quiz: ${topicName}`);
        setActiveQuizSubject(subjectName);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setQuizInProgress(true);
        setQuizCompleted(false);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to generate AI quiz.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    const q = currentQuestions[currentQuestionIndex];
    setUserAnswers(prev => ({ ...prev, [q.id]: optionIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    let score = 0;
    currentQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });

    const total = currentQuestions.length;
    const percentage = Math.round((score / total) * 100);

    const resultObj: QuizResult = {
      id: 'quiz_' + Date.now(),
      title: activeQuizTitle,
      subject: activeQuizSubject,
      field: profile?.field || 'General',
      score,
      totalQuestions: total,
      percentage,
      date: new Date().toISOString(),
      userAnswers,
      questions: currentQuestions
    };

    await storage.saveQuizResult(resultObj);
    setCompletedResult(resultObj);
    setQuizCompleted(true);
    setQuizInProgress(false);
    await loadData();
  };

  const fieldMeta = STUDENT_FIELDS.find(f => f.id === profile?.field) || STUDENT_FIELDS[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Study Quizzes & MCQs</Text>
          <Text style={styles.headerSubtitle}>Field-based testing & AI quiz generator</Text>
        </View>

        {!quizInProgress && (
          <View style={styles.tabToggle}>
            <TouchableOpacity
              onPress={() => setActiveTab('take')}
              style={[styles.tabBtn, activeTab === 'take' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, activeTab === 'take' && styles.tabBtnTextActive]}>
                Quizzes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('history')}
              style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, activeTab === 'history' && styles.tabBtnTextActive]}>
                History ({quizHistory.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* --- STATE 1: QUIZ IN PROGRESS --- */}
        {quizInProgress ? (
          <View>
            {/* Progress Header */}
            <View style={styles.quizProgressHeader}>
              <View>
                <Text style={styles.quizSubjectText}>{activeQuizSubject}</Text>
                <Text style={styles.quizActiveTitle}>{activeQuizTitle}</Text>
              </View>
              <View style={styles.questionCounterPill}>
                <Text style={styles.questionCounterText}>
                  {currentQuestionIndex + 1} / {currentQuestions.length}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`
                  }
                ]}
              />
            </View>

            {/* Question Card */}
            {currentQuestions[currentQuestionIndex] && (
              <Card style={styles.questionCard}>
                <Text style={styles.questionText}>
                  {currentQuestions[currentQuestionIndex].question}
                </Text>

                <View style={styles.optionsList}>
                  {currentQuestions[currentQuestionIndex].options.map((option, idx) => {
                    const isSelected =
                      userAnswers[currentQuestions[currentQuestionIndex].id] === idx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.8}
                        onPress={() => handleSelectOption(idx)}
                        style={[
                          styles.optionCard,
                          isSelected && styles.optionCardSelected
                        ]}
                      >
                        <View
                          style={[
                            styles.optionLetterBox,
                            isSelected && styles.optionLetterBoxSelected
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionLetterText,
                              isSelected && styles.optionLetterTextSelected
                            ]}
                          >
                            {String.fromCharCode(65 + idx)}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Card>
            )}

            {/* Bottom Controls */}
            <View style={styles.quizBottomControls}>
              <Button
                title={
                  currentQuestionIndex === currentQuestions.length - 1
                    ? 'Submit Quiz'
                    : 'Next Question'
                }
                onPress={handleNextQuestion}
                disabled={
                  userAnswers[currentQuestions[currentQuestionIndex]?.id] === undefined
                }
                variant="primary"
                size="lg"
                icon={
                  currentQuestionIndex === currentQuestions.length - 1
                    ? 'checkmark-circle'
                    : 'arrow-forward'
                }
              />
              <TouchableOpacity
                onPress={() => setQuizInProgress(false)}
                style={styles.cancelQuizBtn}
              >
                <Text style={styles.cancelQuizText}>Exit Quiz</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : quizCompleted && completedResult ? (
          /* --- STATE 2: QUIZ COMPLETED / SCORE SCREEN --- */
          <View>
            <Card style={styles.scoreSummaryCard}>
              <View style={styles.trophyCircle}>
                <Ionicons
                  name={completedResult.percentage >= 60 ? 'trophy' : 'refresh-circle'}
                  size={42}
                  color={completedResult.percentage >= 60 ? '#D97706' : COLORS.primary}
                />
              </View>
              <Text style={styles.scorePercentageText}>{completedResult.percentage}%</Text>
              <Text style={styles.scoreRatioText}>
                {completedResult.score} of {completedResult.totalQuestions} Correct
              </Text>

              <Text style={styles.scoreFeedbackText}>
                {completedResult.percentage >= 80
                  ? 'Outstanding mastery! Exam-ready performance! 🌟 (+15 pts)'
                  : completedResult.percentage >= 60
                  ? 'Good job! You passed this knowledge check! (+15 pts)'
                  : 'Keep reviewing your lecture notes and try again!'}
              </Text>

              <Button
                title="Back to Quizzes"
                onPress={() => setQuizCompleted(false)}
                variant="primary"
                size="md"
                style={styles.backToQuizBtn}
              />
            </Card>

            {/* Review Answers */}
            <Text style={styles.reviewSectionTitle}>Question Review & Explanations</Text>
            {completedResult.questions.map((q, qIdx) => {
              const userAns = completedResult.userAnswers[q.id];
              const isCorrect = userAns === q.correctIndex;

              return (
                <Card key={q.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeaderRow}>
                    <Text style={styles.reviewQIndex}>Q{qIdx + 1}</Text>
                    <Badge
                      label={isCorrect ? 'CORRECT' : 'INCORRECT'}
                      variant={isCorrect ? 'success' : 'danger'}
                      size="sm"
                    />
                  </View>
                  <Text style={styles.reviewQText}>{q.question}</Text>

                  <View style={styles.reviewAnsRow}>
                    <Text style={styles.reviewLabel}>Your Answer:</Text>
                    <Text
                      style={[
                        styles.reviewVal,
                        { color: isCorrect ? COLORS.success : COLORS.danger }
                      ]}
                    >
                      {userAns !== undefined ? q.options[userAns] : 'Skipped'}
                    </Text>
                  </View>

                  {!isCorrect && (
                    <View style={styles.reviewAnsRow}>
                      <Text style={styles.reviewLabel}>Correct Answer:</Text>
                      <Text style={[styles.reviewVal, { color: COLORS.success }]}>
                        {q.options[q.correctIndex]}
                      </Text>
                    </View>
                  )}

                  <View style={styles.explanationBox}>
                    <Text style={styles.expTitle}>Explanation:</Text>
                    <Text style={styles.expText}>{q.explanation}</Text>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : activeTab === 'take' ? (
          /* --- STATE 3: QUIZ SELECTION DASHBOARD --- */
          <View>
            {/* Field Quiz Banner */}
            <Card style={styles.fieldQuizBanner}>
              <View style={styles.fieldQuizTop}>
                <View style={[styles.fieldIcon, { backgroundColor: fieldMeta.color }]}>
                  <Ionicons name={fieldMeta.icon as any} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.fieldQuizTitles}>
                  <Text style={styles.fieldQuizMainTitle}>{fieldMeta.name}</Text>
                  <Text style={styles.fieldQuizSub}>
                    Curated University Standard Questions
                  </Text>
                </View>
              </View>

              <Text style={styles.fieldQuizDesc}>
                Test yourself against verified university level questions tailored specifically for {fieldMeta.shortName} students.
              </Text>

              <Button
                title={`Start ${fieldMeta.shortName} Quiz`}
                onPress={handleStartFieldQuiz}
                variant="primary"
                size="md"
                icon="play"
              />
            </Card>

            {/* AI Custom Quiz Generator Card */}
            <Card style={styles.aiGenCard}>
              <View style={styles.aiGenHeader}>
                <View style={styles.aiGenIconCircle}>
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.aiGenTitles}>
                  <Text style={styles.aiGenTitle}>AI Custom Quiz Generator</Text>
                  <Text style={styles.aiGenSub}>
                    Generate questions from ANY topic or lecture notes
                  </Text>
                </View>
              </View>

              <Text style={styles.aiGenDesc}>
                Enter any syllabus chapter, clinical case, equation, or pick one of your saved whiteboard lectures to test yourself on exact content.
              </Text>

              <Button
                title="⚡ Generate Custom AI Quiz"
                onPress={() => setGeneratorModalVisible(true)}
                variant="outline"
                size="md"
                icon="flash"
              />
            </Card>
          </View>
        ) : (
          /* --- STATE 4: QUIZ HISTORY --- */
          <View>
            {quizHistory.length > 0 ? (
              quizHistory.map(item => (
                <Card key={item.id} style={styles.historyCard}>
                  <View style={styles.histHeader}>
                    <View style={styles.histTitleCol}>
                      <Text style={styles.histTitle}>{item.title}</Text>
                      <Text style={styles.histSubject}>
                        {item.subject} &bull; {new Date(item.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.scoreBadge,
                        {
                          backgroundColor:
                            item.percentage >= 60 ? '#ECFDF5' : '#FEF2F2'
                        }
                      ]}
                    >
                      <Text
                        style={[
                          styles.scoreBadgeText,
                          {
                            color:
                              item.percentage >= 60 ? '#059669' : '#DC2626'
                          }
                        ]}
                      >
                        {item.percentage}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.histFooter}>
                    <Text style={styles.histScoreText}>
                      Score: {item.score} / {item.totalQuestions}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setCompletedResult(item);
                        setQuizCompleted(true);
                      }}
                      style={styles.reviewBtn}
                    >
                      <Text style={styles.reviewBtnText}>Review Explanations &rarr;</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            ) : (
              <EmptyState
                icon="ribbon-outline"
                title="No Quizzes Completed"
                description="Take a field-based quiz or generate an AI quiz to track your mastery scores!"
                actionTitle="Start First Quiz"
                onAction={handleStartFieldQuiz}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* AI Quiz Generator Modal */}
      <Modal visible={generatorModalVisible} transparent animationType="slide" onRequestClose={() => setGeneratorModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate AI Practice Quiz</Text>
              <TouchableOpacity onPress={() => setGeneratorModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Quiz Topic / Concept</Text>
              <TextInput
                style={styles.textInput}
                value={genTopic}
                onChangeText={setGenTopic}
                placeholder="e.g. Dynamic Programming or Myocardial Infarction"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.textInput}
                value={genSubject}
                onChangeText={setGenSubject}
                placeholder={profile?.subjects[0] || 'Subject'}
                placeholderTextColor={COLORS.textLight}
              />

              {/* Or Select from Saved Lectures */}
              {lectures.length > 0 && (
                <>
                  <Text style={styles.inputLabel}>Or Quiz from Saved Lecture Notes</Text>
                  <View style={styles.lecturePillRow}>
                    {lectures.slice(0, 4).map(l => {
                      const isSel = genLectureId === l.id;
                      return (
                        <TouchableOpacity
                          key={l.id}
                          onPress={() => {
                            if (isSel) {
                              setGenLectureId(null);
                            } else {
                              setGenLectureId(l.id);
                              setGenTopic(l.title);
                              setGenSubject(l.subject);
                            }
                          }}
                          style={[styles.lecPill, isSel && styles.lecPillActive]}
                        >
                          <Ionicons
                            name={isSel ? 'checkmark-circle' : 'document-text-outline'}
                            size={14}
                            color={isSel ? '#FFFFFF' : COLORS.primary}
                          />
                          <Text
                            style={[styles.lecPillText, isSel && styles.lecPillTextActive]}
                            numberOfLines={1}
                          >
                            {l.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              <View style={styles.genModalActions}>
                <Button
                  title={generatingQuiz ? 'Generating AI Questions...' : '⚡ Generate 5 MCQs'}
                  onPress={handleGenerateAiQuiz}
                  loading={generatingQuiz}
                  variant="primary"
                  size="md"
                  icon="sparkles"
                  style={styles.genBtn}
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
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  tabBtnTextActive: {
    color: '#FFFFFF'
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 40
  },
  quizProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  quizSubjectText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary
  },
  quizActiveTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text
  },
  questionCounterPill: {
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full
  },
  questionCounterText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: SPACING.base,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3
  },
  questionCard: {
    padding: SPACING.lg
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.lg
  },
  optionsList: {
    gap: 10
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 12
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg
  },
  optionLetterBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  optionLetterBoxSelected: {
    backgroundColor: COLORS.primary
  },
  optionLetterText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text
  },
  optionLetterTextSelected: {
    color: '#FFFFFF'
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text
  },
  optionTextSelected: {
    fontWeight: '600',
    color: COLORS.primaryDark
  },
  quizBottomControls: {
    marginTop: SPACING.lg
  },
  cancelQuizBtn: {
    alignItems: 'center',
    paddingVertical: 12
  },
  cancelQuizText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600'
  },
  scoreSummaryCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: 8,
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF'
  },
  trophyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small
  },
  scorePercentageText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.text
  },
  scoreRatioText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  scoreFeedbackText: {
    fontSize: 14,
    color: '#6B21A8',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20
  },
  backToQuizBtn: {
    marginTop: 10
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginVertical: SPACING.md
  },
  reviewCard: {
    marginBottom: SPACING.md
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  reviewQIndex: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  reviewQText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8
  },
  reviewAnsRow: {
    flexDirection: 'row',
    marginVertical: 2
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    width: 100
  },
  reviewVal: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700'
  },
  explanationBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: RADIUS.sm,
    marginTop: 6
  },
  expTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2
  },
  expText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18
  },
  fieldQuizBanner: {
    marginBottom: SPACING.md
  },
  fieldQuizTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
  },
  fieldIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fieldQuizTitles: {
    flex: 1
  },
  fieldQuizMainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text
  },
  fieldQuizSub: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  fieldQuizDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: SPACING.base
  },
  aiGenCard: {
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF'
  },
  aiGenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  aiGenIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  aiGenTitles: {
    flex: 1
  },
  aiGenTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B4B'
  },
  aiGenSub: {
    fontSize: 11,
    color: '#4338CA'
  },
  aiGenDesc: {
    fontSize: 13,
    color: '#3730A3',
    lineHeight: 19,
    marginBottom: SPACING.base
  },
  historyCard: {
    marginBottom: SPACING.sm
  },
  histHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  histTitleCol: {
    flex: 1
  },
  histTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text
  },
  histSubject: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full
  },
  scoreBadgeText: {
    fontSize: 13,
    fontWeight: '800'
  },
  histFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  histScoreText: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  reviewBtn: {
    padding: 2
  },
  reviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary
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
    maxHeight: '80%'
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
  lecturePillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 6
  },
  lecPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    maxWidth: '48%'
  },
  lecPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  lecPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text
  },
  lecPillTextActive: {
    color: '#FFFFFF'
  },
  genModalActions: {
    marginTop: SPACING.lg
  },
  genBtn: {
    width: '100%'
  }
});
