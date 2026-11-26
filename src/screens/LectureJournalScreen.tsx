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
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { pdfExport } from '../services/pdf';
import { Lecture, StudentProfile } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

export const LectureJournalScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route
}) => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [classwork, setClasswork] = useState('');
  const [description, setDescription] = useState('');
  const [boardPhotos, setBoardPhotos] = useState<string[]>([]);
  const [ocrText, setOcrText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadLectures = useCallback(async () => {
    try {
      const [list, prof] = await Promise.all([
        storage.getLectures(),
        storage.getProfile()
      ]);
      setLectures(list);
      setProfile(prof);
    } catch (e) {
      console.warn('Failed to load lectures:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLectures();
      if (route.params?.openCreateModal) {
        openCreateModal();
        navigation.setParams({ openCreateModal: false });
      }
    }, [loadLectures, route.params?.openCreateModal])
  );

  const openCreateModal = () => {
    setTitle('');
    setSubject(profile?.subjects[0] || 'General Studies');
    setDate(new Date().toISOString().split('T')[0]);
    setClasswork('');
    setDescription('');
    setBoardPhotos([]);
    setOcrText('');
    setModalVisible(true);
  };

  // Camera capture
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to capture board photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setBoardPhotos(prev => [...prev, asset.uri]);

        // Auto trigger AI OCR if base64 is available
        if (asset.base64) {
          triggerOcrExtraction(asset.base64);
        }
      }
    } catch (e) {
      Alert.alert('Camera Error', 'Could not open camera.');
    }
  };

  // Gallery select
  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setBoardPhotos(prev => [...prev, asset.uri]);

        if (asset.base64) {
          triggerOcrExtraction(asset.base64);
        }
      }
    } catch (e) {
      Alert.alert('Gallery Error', 'Could not pick photo.');
    }
  };

  const triggerOcrExtraction = async (base64Data: string) => {
    setOcrLoading(true);
    try {
      const res = await api.extractBoardText(
        base64Data,
        subject || 'General',
        profile?.field || 'General'
      );
      if (res.success && res.text) {
        setOcrText(prev => (prev ? prev + '\n\n' + res.text : res.text));
        Alert.alert('AI Board OCR Complete! 🔍', 'Extracted notes, formulas, and headings from whiteboard photo.');
      }
    } catch (e) {
      console.warn('OCR error:', e);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSaveLecture = async () => {
    if (!title.trim() || !subject.trim()) {
      Alert.alert('Validation', 'Please provide a title and subject.');
      return;
    }

    setSaving(true);
    try {
      const { lecture, pointsAwarded, badgeUnlocked } = await storage.addLecture({
        title: title.trim(),
        subject: subject.trim(),
        date,
        classwork: classwork.trim(),
        description: description.trim(),
        boardPhotos,
        ocrText: ocrText.trim() || undefined
      });

      setModalVisible(false);
      await loadLectures();

      if (pointsAwarded) {
        let msg = '+5 Points awarded for logging your lecture!';
        if (badgeUnlocked) {
          msg += '\n\n🏆 ACHIEVEMENT UNLOCKED: "Class Regular" Badge earned (5 lectures saved)!';
        }
        Alert.alert('Lecture Saved', msg);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save lecture.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportLecturePdf = async (lecture: Lecture) => {
    try {
      await pdfExport.exportLectureToPdf(lecture);
    } catch (e) {
      Alert.alert('Export Failed', 'Could not export lecture to PDF.');
    }
  };

  const subjectsList = ['All', ...(profile?.subjects || [])];

  const filteredLectures = lectures.filter(lec => {
    const matchesSearch =
      lec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lec.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lec.classwork && lec.classwork.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      selectedSubjectFilter === 'All' || lec.subject === selectedSubjectFilter;

    return matchesSearch && matchesSubject;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Lecture Journal</Text>
          <Text style={styles.headerSubtitle}>Board photos, OCR notes & AI revision</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openCreateModal}
          style={styles.addButton}
        >
          <Ionicons name="camera" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search lectures, topics, or notes..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Subject Filter Pills */}
      <View style={styles.subjectFilterScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {subjectsList.map(sub => {
            const isSelected = selectedSubjectFilter === sub;
            return (
              <TouchableOpacity
                key={sub}
                onPress={() => setSelectedSubjectFilter(sub)}
                style={[styles.subjectPill, isSelected && styles.subjectPillSelected]}
              >
                <Text style={[styles.subjectPillText, isSelected && styles.subjectPillTextSelected]}>
                  {sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredLectures.length > 0 ? (
          filteredLectures.map(lec => (
            <Card key={lec.id} style={styles.lectureCard}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('LectureDetail', { lectureId: lec.id })}
              >
                <View style={styles.cardHeaderRow}>
                  <Badge label={lec.subject} variant="primary" size="sm" />
                  <Text style={styles.lectureDate}>{lec.date}</Text>
                </View>

                <Text style={styles.cardTitle}>{lec.title}</Text>

                {lec.description ? (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {lec.description}
                  </Text>
                ) : null}

                {/* Board Photos Carousel */}
                {lec.boardPhotos && lec.boardPhotos.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.photoCarousel}
                  >
                    {lec.boardPhotos.map((uri, idx) => (
                      <Image key={idx} source={{ uri }} style={styles.boardThumb} />
                    ))}
                  </ScrollView>
                )}

                {/* Badges for AI Revision / OCR status */}
                <View style={styles.indicatorsRow}>
                  {lec.boardPhotos && lec.boardPhotos.length > 0 && (
                    <View style={styles.indicatorPill}>
                      <Ionicons name="images-outline" size={13} color="#4F46E5" />
                      <Text style={styles.indicatorText}>{lec.boardPhotos.length} Photos</Text>
                    </View>
                  )}
                  {lec.ocrText && (
                    <View style={[styles.indicatorPill, { backgroundColor: '#ECFDF5' }]}>
                      <Ionicons name="scan-outline" size={13} color="#059669" />
                      <Text style={[styles.indicatorText, { color: '#059669' }]}>AI OCR Text</Text>
                    </View>
                  )}
                  {lec.revisionData && (
                    <View style={[styles.indicatorPill, { backgroundColor: '#FFFBEB' }]}>
                      <Ionicons name="sparkles" size={13} color="#D97706" />
                      <Text style={[styles.indicatorText, { color: '#D97706' }]}>AI Revision Pack</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    onPress={() => handleExportLecturePdf(lec)}
                    style={styles.exportPdfBtn}
                  >
                    <Ionicons name="document-text-outline" size={15} color={COLORS.primary} />
                    <Text style={styles.exportPdfText}>Export PDF</Text>
                  </TouchableOpacity>

                  <View style={styles.studyNowRow}>
                    <Text style={styles.studyNowText}>Study & Revise</Text>
                    <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            </Card>
          ))
        ) : (
          <EmptyState
            icon="camera-outline"
            title="No Lectures Found"
            description="Snap a whiteboard photo or record class notes to generate instant AI summaries, formulas, and flashcards!"
            actionTitle="Record Lecture"
            onAction={openCreateModal}
          />
        )}
      </ScrollView>

      {/* Add Lecture Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Lecture Journal Entry</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Lecture Title</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Graph Traversals: BFS & DFS"
                placeholderTextColor={COLORS.textLight}
              />

              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Subject</Text>
                  <TextInput
                    style={styles.textInput}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="e.g. Algorithms"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>

                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput
                    style={styles.textInput}
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>

              {/* Photo capture buttons */}
              <Text style={styles.inputLabel}>Whiteboard Photos & Slides</Text>
              <View style={styles.photoActionsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleTakePhoto}
                  style={styles.photoActionBtn}
                >
                  <Ionicons name="camera" size={18} color={COLORS.primary} />
                  <Text style={styles.photoActionText}>Take Board Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePickPhoto}
                  style={styles.photoActionBtn}
                >
                  <Ionicons name="images" size={18} color={COLORS.primary} />
                  <Text style={styles.photoActionText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>

              {/* Photos Preview */}
              {boardPhotos.length > 0 && (
                <ScrollView horizontal style={styles.previewScroll}>
                  {boardPhotos.map((uri, idx) => (
                    <View key={idx} style={styles.thumbWrapper}>
                      <Image source={{ uri }} style={styles.previewThumb} />
                      <TouchableOpacity
                        onPress={() =>
                          setBoardPhotos(prev => prev.filter((_, i) => i !== idx))
                        }
                        style={styles.removePhotoBadge}
                      >
                        <Ionicons name="close" size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              {ocrLoading && (
                <View style={styles.ocrLoadingBox}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.ocrLoadingText}>Extracting text & formulas via AI OCR...</Text>
                </View>
              )}

              {/* Extracted OCR text field */}
              {ocrText ? (
                <>
                  <Text style={styles.inputLabel}>Extracted OCR Board Text (Editable)</Text>
                  <TextInput
                    style={[styles.textInput, styles.ocrTextInput]}
                    value={ocrText}
                    onChangeText={setOcrText}
                    multiline
                  />
                </>
              ) : null}

              <Text style={styles.inputLabel}>In-Class Notes & Classwork</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={classwork}
                onChangeText={setClasswork}
                multiline
                numberOfLines={3}
                placeholder="Important points highlighted by the professor..."
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Topic Overview / Description</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
                placeholder="Brief summary of syllabus coverage..."
                placeholderTextColor={COLORS.textLight}
              />

              <View style={styles.modalActionButtons}>
                <Button
                  title={saving ? 'Saving...' : 'Save to Journal (+5 pts)'}
                  onPress={handleSaveLecture}
                  loading={saving}
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
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.base,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    padding: 0
  },
  subjectFilterScroll: {
    paddingVertical: SPACING.sm
  },
  filterScrollContent: {
    paddingHorizontal: SPACING.base,
    gap: 8
  },
  subjectPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  subjectPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  subjectPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  subjectPillTextSelected: {
    color: '#FFFFFF'
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 40
  },
  lectureCard: {
    marginBottom: SPACING.md
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  lectureDate: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4
  },
  cardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8
  },
  photoCarousel: {
    flexDirection: 'row',
    marginVertical: 8
  },
  boardThumb: {
    width: 100,
    height: 70,
    borderRadius: RADIUS.md,
    marginRight: 8,
    backgroundColor: '#E2E8F0'
  },
  indicatorsRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 6,
    flexWrap: 'wrap'
  },
  indicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4
  },
  indicatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  exportPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  exportPdfText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary
  },
  studyNowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  studyNowText: {
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
  ocrTextInput: {
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    fontFamily: 'monospace'
  },
  rowInputs: {
    flexDirection: 'row',
    gap: SPACING.md
  },
  flex1: {
    flex: 1
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginVertical: 4
  },
  photoActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryBg,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    gap: 6
  },
  photoActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary
  },
  previewScroll: {
    marginVertical: 8
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: 8
  },
  previewThumb: {
    width: 80,
    height: 60,
    borderRadius: RADIUS.md
  },
  removePhotoBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.danger,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ocrLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: RADIUS.md,
    gap: 8,
    marginVertical: 6
  },
  ocrLoadingText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600'
  },
  modalActionButtons: {
    marginVertical: SPACING.lg
  },
  saveBtn: {
    width: '100%'
  }
});
