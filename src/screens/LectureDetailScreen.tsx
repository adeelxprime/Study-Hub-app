import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { pdfExport } from '../services/pdf';
import { Lecture, LectureRevisionData, StudentProfile } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

interface LectureDetailScreenProps {
  navigation: any;
  route: any;
}

type TabType = 'notes' | 'summary' | 'flashcards' | 'mcqs' | 'qa';

export const LectureDetailScreen: React.FC<LectureDetailScreenProps> = ({
  navigation,
  route
}) => {
  const { lectureId } = route.params;
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const [loading, setLoading] = useState(true);
  const [generatingRevision, setGeneratingRevision] = useState(false);

  // Edit OCR text modal
  const [editOcrModal, setEditOcrModal] = useState(false);
  const [editedOcrText, setEditedOcrText] = useState('');

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  // MCQ state: selected answers
  const [userMcqAnswers, setUserMcqAnswers] = useState<{ [index: number]: number }>({});
  const [revealedMcqs, setRevealedMcqs] = useState<{ [index: number]: boolean }>({});

  // Full-screen image preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadLecture = useCallback(async () => {
    try {
      const [lec, prof] = await Promise.all([
        storage.getLectureById(lectureId),
        storage.getProfile()
      ]);
      if (lec) {
        setLecture(lec);
        setEditedOcrText(lec.ocrText || '');
      }
      setProfile(prof);
    } catch (e) {
      console.warn('Failed to load lecture detail:', e);
    } finally {
      setLoading(false);
    }
  }, [lectureId]);

  useEffect(() => {
    loadLecture();
  }, [loadLecture]);

  const handleGenerateRevision = async () => {
    if (!lecture) return;
    setGeneratingRevision(true);
    try {
      const fullText = `${lecture.title}\n\nClasswork:\n${lecture.classwork}\n\nBoard Notes:\n${lecture.ocrText || ''}\n\nOverview:\n${lecture.description}`;
      const res = await api.generateLectureRevision(
        lecture.title,
        lecture.subject,
        profile?.field || 'General',
        fullText
      );

      if (res.success && res.revision) {
        const updatedLecture: Lecture = {
          ...lecture,
          revisionData: res.revision
        };
        await storage.updateLecture(updatedLecture);
        setLecture(updatedLecture);
        Alert.alert('AI Revision Ready! 📚', 'Summaries, flashcards, MCQs, and formulas generated.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to generate AI revision.');
    } finally {
      setGeneratingRevision(false);
    }
  };

  const handleSaveOcrText = async () => {
    if (!lecture) return;
    const updated: Lecture = { ...lecture, ocrText: editedOcrText.trim() };
    await storage.updateLecture(updated);
    setLecture(updated);
    setEditOcrModal(false);
    Alert.alert('Saved', 'Whiteboard transcribed text updated successfully.');
  };

  const handleSaveAsNote = async () => {
    if (!lecture) return;
    try {
      let content = `# ${lecture.title}\n**Subject:** ${lecture.subject} | **Date:** ${lecture.date}\n\n## Classwork\n${lecture.classwork}\n\n`;
      if (lecture.ocrText) {
        content += `## Whiteboard OCR Notes\n${lecture.ocrText}\n\n`;
      }
      if (lecture.revisionData) {
        content += `## Summary\n${lecture.revisionData.summary}\n\n## Key Takeaways\n${lecture.revisionData.keyPoints.map(kp => `- ${kp}`).join('\n')}\n\n`;
      }

      await storage.addNote({
        title: `${lecture.title} (Lecture Notes)`,
        subject: lecture.subject,
        content,
        tags: [lecture.subject, 'Lecture', 'AI-Generated'],
        isAiGenerated: true,
        sourceLectureId: lecture.id
      });

      Alert.alert('Saved to Notes', 'This lecture has been organized into your Notes Manager with full formatting!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save note.');
    }
  };

  const handleExportPdf = async () => {
    if (!lecture) return;
    try {
      await pdfExport.exportLectureToPdf(lecture);
    } catch (e) {
      Alert.alert('Export Error', 'Could not export lecture to PDF.');
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Lecture', 'Are you sure you want to remove this lecture from your journal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await storage.deleteLecture(lectureId);
          navigation.goBack();
        }
      }
    ]);
  };

  if (loading || !lecture) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const rev = lecture.revisionData;
  const flashcards = rev?.flashcards || [
    { front: 'Core Concept', back: 'Review classwork and board notes above' }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerSubject} numberOfLines={1}>
            {lecture.subject}
          </Text>
          <Text style={styles.headerMainTitle} numberOfLines={1}>
            {lecture.title}
          </Text>
        </View>
        <View style={styles.headerActionRow}>
          <TouchableOpacity onPress={handleExportPdf} style={styles.headerBtn}>
            <Ionicons name="share-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
          <TouchableOpacity
            onPress={() => setActiveTab('notes')}
            style={[styles.tabItem, activeTab === 'notes' && styles.tabItemActive]}
          >
            <Ionicons
              name="document-text-outline"
              size={15}
              color={activeTab === 'notes' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
              Notes & Photos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('summary')}
            style={[styles.tabItem, activeTab === 'summary' && styles.tabItemActive]}
          >
            <Ionicons
              name="sparkles-outline"
              size={15}
              color={activeTab === 'summary' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>
              AI Revision
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('flashcards')}
            style={[styles.tabItem, activeTab === 'flashcards' && styles.tabItemActive]}
          >
            <Ionicons
              name="card-outline"
              size={15}
              color={activeTab === 'flashcards' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'flashcards' && styles.tabTextActive]}>
              Flashcards ({rev?.flashcards?.length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('mcqs')}
            style={[styles.tabItem, activeTab === 'mcqs' && styles.tabItemActive]}
          >
            <Ionicons
              name="help-circle-outline"
              size={15}
              color={activeTab === 'mcqs' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'mcqs' && styles.tabTextActive]}>
              Practice MCQs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('qa')}
            style={[styles.tabItem, activeTab === 'qa' && styles.tabItemActive]}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={15}
              color={activeTab === 'qa' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'qa' && styles.tabTextActive]}>
              Exam Q&A
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* --- TAB 1: NOTES & PHOTOS --- */}
        {activeTab === 'notes' && (
          <View>
            {/* Whiteboard Photos Carousel */}
            {lecture.boardPhotos && lecture.boardPhotos.length > 0 ? (
              <Card>
                <Text style={styles.cardHeaderTitle}>Whiteboard Photos ({lecture.boardPhotos.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
                  {lecture.boardPhotos.map((uri, idx) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.9}
                      onPress={() => setPreviewImage(uri)}
                    >
                      <Image source={{ uri }} style={styles.boardPhotoThumb} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.photoTipText}>Tap any photo to view full size</Text>
              </Card>
            ) : null}

            {/* AI OCR Extracted Board Notes */}
            <Card>
              <View style={styles.ocrCardHeader}>
                <View style={styles.rowAlign}>
                  <Ionicons name="scan" size={17} color="#059669" style={styles.headerIcon} />
                  <Text style={styles.cardHeaderTitle}>AI Board OCR Notes</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setEditOcrModal(true)}
                  style={styles.editOcrPill}
                >
                  <Ionicons name="pencil" size={13} color={COLORS.primary} />
                  <Text style={styles.editOcrPillText}>Edit Notes</Text>
                </TouchableOpacity>
              </View>

              {lecture.ocrText ? (
                <View style={styles.ocrBox}>
                  <Text style={styles.ocrText}>{lecture.ocrText}</Text>
                </View>
              ) : (
                <Text style={styles.emptyOcrNotice}>
                  No OCR text yet. Add a whiteboard photo to extract text automatically.
                </Text>
              )}
            </Card>

            {/* In-Class Notes */}
            <Card>
              <Text style={styles.cardHeaderTitle}>Classwork & Teacher Instructions</Text>
              <Text style={styles.bodyText}>
                {lecture.classwork || 'No written classwork recorded.'}
              </Text>
            </Card>

            {/* Description */}
            <Card>
              <Text style={styles.cardHeaderTitle}>Topic Scope</Text>
              <Text style={styles.bodyText}>
                {lecture.description || 'No description recorded.'}
              </Text>
            </Card>

            {/* Action Bar */}
            <View style={styles.bottomActionsCol}>
              <Button
                title={
                  generatingRevision
                    ? 'Generating AI Revision...'
                    : rev
                    ? 'Regenerate AI Revision Pack'
                    : '⚡ Generate AI Revision Pack'
                }
                onPress={handleGenerateRevision}
                loading={generatingRevision}
                variant="primary"
                size="md"
                icon="sparkles"
              />

              <Button
                title="Save Entire Lecture as Note"
                onPress={handleSaveAsNote}
                variant="outline"
                size="md"
                icon="journal-outline"
                style={styles.actionGapTop}
              />
            </View>
          </View>
        )}

        {/* --- TAB 2: AI SUMMARY & FORMULAS --- */}
        {activeTab === 'summary' && (
          <View>
            {!rev ? (
              <Card style={styles.emptyRevCard}>
                <Ionicons name="sparkles" size={32} color={COLORS.primary} />
                <Text style={styles.emptyRevTitle}>AI Revision Package Not Generated Yet</Text>
                <Text style={styles.emptyRevSubtitle}>
                  Extract summaries, key takeaways, formulas, definitions, and cheat sheets with one tap!
                </Text>
                <Button
                  title="Generate AI Revision"
                  onPress={handleGenerateRevision}
                  loading={generatingRevision}
                  variant="primary"
                  size="md"
                  icon="sparkles"
                />
              </Card>
            ) : (
              <View>
                {/* High Yield Summary */}
                <Card style={styles.summaryCard}>
                  <View style={styles.rowAlign}>
                    <Ionicons name="bulb-outline" size={18} color="#059669" style={styles.headerIcon} />
                    <Text style={styles.cardHeaderTitle}>High-Yield Lecture Summary</Text>
                  </View>
                  <Text style={styles.summaryBodyText}>{rev.summary}</Text>
                </Card>

                {/* Key Points */}
                <Card>
                  <View style={styles.rowAlign}>
                    <Ionicons name="key-outline" size={18} color="#D97706" style={styles.headerIcon} />
                    <Text style={styles.cardHeaderTitle}>Core Takeaways</Text>
                  </View>
                  {rev.keyPoints.map((point, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <Text style={styles.bulletSymbol}>&bull;</Text>
                      <Text style={styles.bulletText}>{point}</Text>
                    </View>
                  ))}
                </Card>

                {/* Formulas & Laws */}
                {rev.formulas && rev.formulas.length > 0 && (
                  <Card>
                    <View style={styles.rowAlign}>
                      <Ionicons name="calculator-outline" size={18} color="#4F46E5" style={styles.headerIcon} />
                      <Text style={styles.cardHeaderTitle}>Key Formulas & Laws</Text>
                    </View>
                    {rev.formulas.map((f, idx) => (
                      <View key={idx} style={styles.formulaItem}>
                        <View style={styles.formulaEquationBox}>
                          <Text style={styles.formulaEquationText}>{f.formula}</Text>
                        </View>
                        <Text style={styles.formulaExplanation}>{f.explanation}</Text>
                      </View>
                    ))}
                  </Card>
                )}

                {/* Definitions */}
                {rev.definitions && rev.definitions.length > 0 && (
                  <Card>
                    <View style={styles.rowAlign}>
                      <Ionicons name="book-outline" size={18} color="#7C3AED" style={styles.headerIcon} />
                      <Text style={styles.cardHeaderTitle}>Definitions & Terms</Text>
                    </View>
                    {rev.definitions.map((d, idx) => (
                      <View key={idx} style={styles.definitionItem}>
                        <Text style={styles.defTerm}>{d.term}</Text>
                        <Text style={styles.defBody}>{d.definition}</Text>
                      </View>
                    ))}
                  </Card>
                )}

                {/* Quick Revision Cheat Sheet */}
                {rev.quickRevisionNotes ? (
                  <Card style={styles.cheatSheetCard}>
                    <Text style={styles.cardHeaderTitle}>⚡ 5-Minute Exam Cheat Sheet</Text>
                    <Text style={styles.cheatSheetText}>{rev.quickRevisionNotes}</Text>
                  </Card>
                ) : null}
              </View>
            )}
          </View>
        )}

        {/* --- TAB 3: INTERACTIVE FLASHCARDS --- */}
        {activeTab === 'flashcards' && (
          <View style={styles.flashcardsContainer}>
            {!rev ? (
              <Card style={styles.emptyRevCard}>
                <Ionicons name="card" size={32} color={COLORS.primary} />
                <Text style={styles.emptyRevTitle}>No Flashcards Available</Text>
                <Text style={styles.emptyRevSubtitle}>Generate the AI revision package first.</Text>
                <Button
                  title="Generate AI Revision"
                  onPress={handleGenerateRevision}
                  loading={generatingRevision}
                  variant="primary"
                  size="md"
                  icon="sparkles"
                />
              </Card>
            ) : (
              <View>
                <View style={styles.flashcardCounterRow}>
                  <Text style={styles.flashcardCounterText}>
                    Card {currentCardIndex + 1} of {flashcards.length}
                  </Text>
                  <Text style={styles.flipNoticeText}>Tap card to flip</Text>
                </View>

                {/* Interactive Flip Card */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setCardFlipped(!cardFlipped)}
                  style={[
                    styles.flashcardBox,
                    cardFlipped && styles.flashcardBoxFlipped
                  ]}
                >
                  <View style={styles.cardFaceBadge}>
                    <Text style={[styles.cardFaceText, cardFlipped && { color: '#059669' }]}>
                      {cardFlipped ? 'ANSWER / DEFINITION' : 'PROMPT / QUESTION'}
                    </Text>
                  </View>

                  <Text style={styles.flashcardContent}>
                    {cardFlipped
                      ? flashcards[currentCardIndex].back
                      : flashcards[currentCardIndex].front}
                  </Text>

                  <Ionicons
                    name={cardFlipped ? 'checkmark-circle' : 'sync'}
                    size={20}
                    color={cardFlipped ? '#059669' : COLORS.primary}
                    style={styles.cardFlipIcon}
                  />
                </TouchableOpacity>

                {/* Navigation Controls */}
                <View style={styles.flashcardControls}>
                  <Button
                    title="Previous"
                    onPress={() => {
                      setCardFlipped(false);
                      setCurrentCardIndex(prev => Math.max(0, prev - 1));
                    }}
                    disabled={currentCardIndex === 0}
                    variant="secondary"
                    size="md"
                    icon="chevron-back"
                    style={styles.controlBtn}
                  />
                  <Button
                    title="Next Card"
                    onPress={() => {
                      setCardFlipped(false);
                      setCurrentCardIndex(prev => Math.min(flashcards.length - 1, prev + 1));
                    }}
                    disabled={currentCardIndex === flashcards.length - 1}
                    variant="primary"
                    size="md"
                    icon="chevron-forward"
                    style={styles.controlBtn}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* --- TAB 4: PRACTICE MCQS --- */}
        {activeTab === 'mcqs' && (
          <View>
            {!rev || !rev.mcqs || rev.mcqs.length === 0 ? (
              <Card style={styles.emptyRevCard}>
                <Ionicons name="help-circle" size={32} color={COLORS.primary} />
                <Text style={styles.emptyRevTitle}>No Practice MCQs Generated</Text>
                <Text style={styles.emptyRevSubtitle}>Generate the AI Revision packet to unlock MCQs.</Text>
                <Button
                  title="Generate AI Revision"
                  onPress={handleGenerateRevision}
                  loading={generatingRevision}
                  variant="primary"
                  size="md"
                  icon="sparkles"
                />
              </Card>
            ) : (
              rev.mcqs.map((mcq, mIdx) => {
                const selectedOption = userMcqAnswers[mIdx];
                const isRevealed = revealedMcqs[mIdx];

                return (
                  <Card key={mIdx} style={styles.mcqCard}>
                    <Text style={styles.mcqQuestionText}>
                      Q{mIdx + 1}: {mcq.question}
                    </Text>

                    <View style={styles.mcqOptionsGroup}>
                      {mcq.options.map((option, oIdx) => {
                        const isChosen = selectedOption === oIdx;
                        const isCorrect = oIdx === mcq.correctIndex;

                        let optionStyle: any = styles.mcqOption;
                        if (isRevealed) {
                          if (isCorrect) optionStyle = styles.mcqOptionCorrect;
                          else if (isChosen) optionStyle = styles.mcqOptionWrong;
                        } else if (isChosen) {
                          optionStyle = styles.mcqOptionSelected;
                        }

                        return (
                          <TouchableOpacity
                            key={oIdx}
                            activeOpacity={0.8}
                            disabled={isRevealed}
                            onPress={() => {
                              setUserMcqAnswers(prev => ({ ...prev, [mIdx]: oIdx }));
                              setRevealedMcqs(prev => ({ ...prev, [mIdx]: true }));
                            }}
                            style={optionStyle}
                          >
                            <Text style={styles.optionLetter}>
                              {String.fromCharCode(65 + oIdx)}.
                            </Text>
                            <Text style={styles.optionText}>{option}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {isRevealed && (
                      <View style={styles.mcqExplanationBox}>
                        <Text style={styles.explanationTitle}>Explanation:</Text>
                        <Text style={styles.explanationText}>{mcq.explanation}</Text>
                      </View>
                    )}
                  </Card>
                );
              })
            )}
          </View>
        )}

        {/* --- TAB 5: SHORT & LONG QUESTIONS --- */}
        {activeTab === 'qa' && (
          <View>
            {!rev ? (
              <Card style={styles.emptyRevCard}>
                <Ionicons name="chatbubble-ellipses" size={32} color={COLORS.primary} />
                <Text style={styles.emptyRevTitle}>No Exam Questions Yet</Text>
                <Text style={styles.emptyRevSubtitle}>Generate the AI Revision packet to unlock Q&A.</Text>
                <Button
                  title="Generate AI Revision"
                  onPress={handleGenerateRevision}
                  loading={generatingRevision}
                  variant="primary"
                  size="md"
                  icon="sparkles"
                />
              </Card>
            ) : (
              <View>
                {/* Short Questions */}
                {rev.shortQuestions && rev.shortQuestions.length > 0 && (
                  <Card>
                    <Text style={styles.cardHeaderTitle}>Short Answer Questions (University Model)</Text>
                    {rev.shortQuestions.map((sq, idx) => (
                      <View key={idx} style={styles.qaItem}>
                        <Text style={styles.qText}>Q: {sq.question}</Text>
                        <View style={styles.ansBox}>
                          <Text style={styles.ansText}>Model Answer: {sq.answer}</Text>
                        </View>
                      </View>
                    ))}
                  </Card>
                )}

                {/* Long Essay Questions */}
                {rev.longQuestions && rev.longQuestions.length > 0 && (
                  <Card>
                    <Text style={styles.cardHeaderTitle}>Long / Analytical Essay Questions</Text>
                    {rev.longQuestions.map((lq, idx) => (
                      <View key={idx} style={styles.qaItem}>
                        <Text style={styles.qText}>Essay Prompt: {lq.question}</Text>
                        <View style={styles.ansBox}>
                          <Text style={styles.ansTitle}>Answer Outline & Marking Rubric:</Text>
                          <Text style={styles.ansText}>{lq.answerOutline}</Text>
                        </View>
                      </View>
                    ))}
                  </Card>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Full-Screen Image Modal */}
      <Modal visible={Boolean(previewImage)} transparent onRequestClose={() => setPreviewImage(null)}>
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.closeImageBtn}
            onPress={() => setPreviewImage(null)}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Edit OCR Text Modal */}
      <Modal visible={editOcrModal} transparent animationType="slide" onRequestClose={() => setEditOcrModal(false)}>
        <View style={styles.editOcrOverlay}>
          <View style={styles.editOcrContent}>
            <View style={styles.editOcrHeader}>
              <Text style={styles.editOcrTitle}>Edit Whiteboard OCR Text</Text>
              <TouchableOpacity onPress={() => setEditOcrModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.editOcrInput}
              value={editedOcrText}
              onChangeText={setEditedOcrText}
              multiline
            />
            <Button
              title="Save Changes"
              onPress={handleSaveOcrText}
              variant="primary"
              size="md"
              icon="checkmark"
              style={styles.saveOcrBtn}
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
    backgroundColor: COLORS.background
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
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
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitles: {
    flex: 1,
    marginHorizontal: 8
  },
  headerSubject: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700'
  },
  headerMainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text
  },
  headerActionRow: {
    flexDirection: 'row',
    gap: 4
  },
  tabsRow: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  tabsScrollContent: {
    paddingHorizontal: SPACING.base,
    paddingVertical: 8,
    gap: 8
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    gap: 5
  },
  tabItemActive: {
    backgroundColor: COLORS.primaryBg
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700'
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 40
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8
  },
  photoRow: {
    marginVertical: 6
  },
  boardPhotoThumb: {
    width: 140,
    height: 95,
    borderRadius: RADIUS.md,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  photoTipText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 4
  },
  ocrCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerIcon: {
    marginRight: 6
  },
  editOcrPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryBg,
    gap: 4
  },
  editOcrPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary
  },
  ocrBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  ocrText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 20,
    fontFamily: 'monospace'
  },
  emptyOcrNotice: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic'
  },
  bodyText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21
  },
  bottomActionsCol: {
    marginTop: SPACING.base
  },
  actionGapTop: {
    marginTop: SPACING.sm
  },
  emptyRevCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: 10
  },
  emptyRevTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center'
  },
  emptyRevSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16
  },
  summaryCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  summaryBodyText: {
    fontSize: 14,
    color: '#064E3B',
    lineHeight: 22
  },
  bulletRow: {
    flexDirection: 'row',
    marginVertical: 4
  },
  bulletSymbol: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 8,
    lineHeight: 20
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 20
  },
  formulaItem: {
    marginVertical: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  formulaEquationBox: {
    backgroundColor: '#EEF2FF',
    padding: 8,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: 4
  },
  formulaEquationText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'monospace'
  },
  formulaExplanation: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  definitionItem: {
    marginVertical: 4
  },
  defTerm: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text
  },
  defBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18
  },
  cheatSheetCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A'
  },
  cheatSheetText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 20
  },
  flashcardsContainer: {
    paddingVertical: 10
  },
  flashcardCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  flashcardCounterText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text
  },
  flipNoticeText: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  flashcardBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.medium
  },
  flashcardBoxFlipped: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981'
  },
  cardFaceBadge: {
    position: 'absolute',
    top: 16,
    left: 20
  },
  cardFaceText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1
  },
  flashcardContent: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 10
  },
  cardFlipIcon: {
    position: 'absolute',
    bottom: 16,
    right: 20
  },
  flashcardControls: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg
  },
  controlBtn: {
    flex: 1
  },
  mcqCard: {
    marginBottom: SPACING.md
  },
  mcqQuestionText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10
  },
  mcqOptionsGroup: {
    gap: 8
  },
  mcqOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 10
  },
  mcqOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg
  },
  mcqOptionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5'
  },
  mcqOptionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2'
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
    color: COLORS.primary
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text
  },
  mcqExplanationBox: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 10,
    marginTop: 10,
    borderRadius: RADIUS.sm
  },
  explanationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2
  },
  explanationText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18
  },
  qaItem: {
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8
  },
  qText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4
  },
  ansBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: RADIUS.sm
  },
  ansTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2
  },
  ansText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeImageBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10
  },
  fullScreenImage: {
    width: '95%',
    height: '80%'
  },
  editOcrOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  editOcrContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '85%'
  },
  editOcrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  editOcrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text
  },
  editOcrInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    height: 300,
    textAlignVertical: 'top',
    fontFamily: 'monospace'
  },
  saveOcrBtn: {
    marginTop: SPACING.md
  }
});
