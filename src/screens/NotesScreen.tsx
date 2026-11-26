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
import { pdfExport } from '../services/pdf';
import { Note, StudentProfile } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

export const NotesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [tagsString, setTagsString] = useState('');

  const loadNotes = useCallback(async () => {
    try {
      const [list, prof] = await Promise.all([
        storage.getNotes(),
        storage.getProfile()
      ]);
      setNotes(list);
      setProfile(prof);
    } catch (e) {
      console.warn('Failed to load notes:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const openModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setSubject(note.subject);
      setContent(note.content);
      setTagsString(note.tags ? note.tags.join(', ') : '');
    } else {
      setEditingNote(null);
      setTitle('');
      setSubject(profile?.subjects[0] || 'General');
      setContent('');
      setTagsString('Exam Prep, Summary');
    }
    setModalVisible(true);
  };

  const handleSaveNote = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Validation', 'Please provide a title and note content.');
      return;
    }

    const tags = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      if (editingNote) {
        const updated: Note = {
          ...editingNote,
          title: title.trim(),
          subject: subject.trim(),
          content: content.trim(),
          tags
        };
        await storage.updateNote(updated);
      } else {
        await storage.addNote({
          title: title.trim(),
          subject: subject.trim(),
          content: content.trim(),
          tags
        });
      }

      await loadNotes();
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to save note.');
    }
  };

  const handleDeleteNote = (id: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this study note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await storage.deleteNote(id);
          await loadNotes();
          setModalVisible(false);
        }
      }
    ]);
  };

  const handleExportPdf = async (note: Note) => {
    try {
      await pdfExport.exportNoteToPdf(note);
    } catch (e) {
      Alert.alert('Export Failed', 'Could not export note to PDF.');
    }
  };

  const subjectsList = ['All', ...(profile?.subjects || [])];

  const filteredNotes = notes.filter(n => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      selectedSubjectFilter === 'All' || n.subject === selectedSubjectFilter;

    return matchesSearch && matchesSubject;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notes Manager</Text>
          <Text style={styles.headerSubtitle}>Subject-wise revision & lecture summaries</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => openModal()}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes or keywords..."
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

      {/* Subject Filter Bar */}
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
        {filteredNotes.length > 0 ? (
          filteredNotes.map(note => (
            <Card key={note.id} style={styles.noteCard}>
              <View style={styles.noteTop}>
                <Badge label={note.subject} variant="primary" size="sm" />
                {note.isAiGenerated && (
                  <View style={styles.aiPill}>
                    <Ionicons name="sparkles" size={11} color="#D97706" />
                    <Text style={styles.aiPillText}>AI Generated</Text>
                  </View>
                )}
                <Text style={styles.dateText}>
                  {new Date(note.updatedAt).toLocaleDateString()}
                </Text>
              </View>

              <Text style={styles.noteTitle}>{note.title}</Text>

              <Text style={styles.noteBodyPreview} numberOfLines={4}>
                {note.content}
              </Text>

              {note.tags && note.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {note.tags.map((t, idx) => (
                    <View key={idx} style={styles.tagPill}>
                      <Text style={styles.tagText}>#{t}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.noteFooter}>
                <TouchableOpacity
                  onPress={() => handleExportPdf(note)}
                  style={styles.actionBtn}
                >
                  <Ionicons name="share-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.actionBtnText}>Export PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => openModal(note)}
                  style={styles.actionBtn}
                >
                  <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.actionBtnText}>Edit Note</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            icon="journal-outline"
            title="No Notes Found"
            description="Create custom study notes or save AI-generated summaries from your lectures."
            actionTitle="Create Note"
            onAction={() => openModal()}
          />
        )}
      </ScrollView>

      {/* Add / Edit Note Modal */}
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
                {editingNote ? 'Edit Study Note' : 'Create Study Note'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Operating System Scheduling Algorithms"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.textInput}
                value={subject}
                onChangeText={setSubject}
                placeholder="e.g. Operating Systems"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Tags (comma separated)</Text>
              <TextInput
                style={styles.textInput}
                value={tagsString}
                onChangeText={setTagsString}
                placeholder="Exam Prep, Formulas, High Yield"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Content / Markdown Notes</Text>
              <TextInput
                style={[styles.textInput, styles.contentInput]}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={10}
                placeholder="Write your study notes, definitions, bullet points..."
                placeholderTextColor={COLORS.textLight}
              />

              <View style={styles.modalActionButtons}>
                {editingNote && (
                  <Button
                    title="Delete"
                    onPress={() => handleDeleteNote(editingNote.id)}
                    variant="danger"
                    size="md"
                    icon="trash"
                    style={styles.modalBtnDelete}
                  />
                )}
                <Button
                  title={editingNote ? 'Save Changes' : 'Create Note'}
                  onPress={handleSaveNote}
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
  noteCard: {
    marginBottom: SPACING.md
  },
  noteTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    gap: 3
  },
  aiPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309'
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textLight
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6
  },
  noteBodyPreview: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 10
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10
  },
  tagPill: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  tagText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500'
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
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
  contentInput: {
    height: 180,
    textAlignVertical: 'top'
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
