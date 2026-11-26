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
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { storage } from '../services/storage';
import { StudyMaterial, StudentProfile } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

export const StudyMaterialsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Link Modal
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkSubject, setLinkSubject] = useState('');
  const [linkUri, setLinkUri] = useState('');
  const [linkDesc, setLinkDesc] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [mats, prof] = await Promise.all([
        storage.getMaterials(),
        storage.getProfile()
      ]);
      setMaterials(mats);
      setProfile(prof);
    } catch (e) {
      console.warn('Failed to load study materials:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        const ext = file.name.split('.').pop()?.toLowerCase() || 'file';

        await storage.addMaterial({
          title: file.name.replace(/\.[^/.]+$/, ''),
          subject: profile?.subjects[0] || 'General',
          fileUri: file.uri,
          fileName: file.name,
          fileType: ext.includes('pdf') ? 'pdf' : ext.includes('doc') ? 'doc' : 'file',
          fileSize: file.size || undefined,
          description: `Uploaded document (${ext.toUpperCase()})`
        });

        await loadData();
        Alert.alert('File Added', `${file.name} saved to your study materials!`);
      }
    } catch (e) {
      Alert.alert('Upload Error', 'Could not select document.');
    }
  };

  const handleSaveLink = async () => {
    if (!linkTitle.trim() || !linkUri.trim()) {
      Alert.alert('Validation', 'Please provide a title and URL.');
      return;
    }

    try {
      await storage.addMaterial({
        title: linkTitle.trim(),
        subject: linkSubject.trim() || (profile?.subjects[0] || 'General'),
        fileUri: linkUri.trim(),
        fileName: linkTitle.trim(),
        fileType: 'link',
        description: linkDesc.trim() || 'Online learning resource'
      });

      await loadData();
      setLinkModalVisible(false);
      setLinkTitle('');
      setLinkUri('');
      setLinkDesc('');
      Alert.alert('Link Added', 'Learning resource link saved successfully.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save link.');
    }
  };

  const handleOpenMaterial = async (item: StudyMaterial) => {
    if (item.fileType === 'link') {
      Alert.alert('Web Resource Link', item.fileUri);
      return;
    }

    if (await Sharing.isAvailableAsync()) {
      try {
        await Sharing.shareAsync(item.fileUri);
      } catch (e) {
        Alert.alert('View Error', 'Unable to open file on this device.');
      }
    } else {
      Alert.alert('File Location', item.fileUri);
    }
  };

  const handleDeleteMaterial = (id: string) => {
    Alert.alert('Delete Material', 'Are you sure you want to remove this study resource?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await storage.deleteMaterial(id);
          await loadData();
        }
      }
    ]);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const subjectsList = ['All', ...(profile?.subjects || [])];

  const filteredMaterials = materials.filter(m => {
    const matchesSubject =
      selectedSubjectFilter === 'All' || m.subject === selectedSubjectFilter;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Study Materials</Text>
          <Text style={styles.headerSubtitle}>PDFs, lecture slides & resource links</Text>
        </View>

        <View style={styles.headerActionBtns}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setLinkModalVisible(true)}
            style={styles.iconBtn}
          >
            <Ionicons name="link" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickDocument}
            style={styles.uploadBtn}
          >
            <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
            <Text style={styles.uploadBtnText}>Upload</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search PDFs or documents..."
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
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map(mat => {
            const isPdf = mat.fileType === 'pdf';
            const isLink = mat.fileType === 'link';

            return (
              <Card key={mat.id} style={styles.matCard}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleOpenMaterial(mat)}
                  style={styles.matRow}
                >
                  <View
                    style={[
                      styles.fileIconBox,
                      isPdf && { backgroundColor: '#FEF2F2' },
                      isLink && { backgroundColor: '#ECFEFF' }
                    ]}
                  >
                    <Ionicons
                      name={
                        isPdf
                          ? 'document-text'
                          : isLink
                          ? 'globe-outline'
                          : 'document-attach'
                      }
                      size={24}
                      color={isPdf ? '#EF4444' : isLink ? '#0891B2' : COLORS.primary}
                    />
                  </View>

                  <View style={styles.matInfo}>
                    <Text style={styles.matTitle} numberOfLines={1}>
                      {mat.title}
                    </Text>
                    <Text style={styles.matMeta}>
                      {mat.subject} &bull; {new Date(mat.dateAdded).toLocaleDateString()}
                      {mat.fileSize ? ` &bull; ${formatFileSize(mat.fileSize)}` : ''}
                    </Text>
                    {mat.description ? (
                      <Text style={styles.matDesc} numberOfLines={1}>
                        {mat.description}
                      </Text>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDeleteMaterial(mat.id)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="folder-open-outline"
            title="No Materials Uploaded"
            description="Organize subject-wise syllabus files, lecture slides, question banks, and reference documents in one place."
            actionTitle="Upload Document"
            onAction={handlePickDocument}
          />
        )}
      </ScrollView>

      {/* Add Web Link Modal */}
      <Modal visible={linkModalVisible} transparent animationType="slide" onRequestClose={() => setLinkModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Resource Link</Text>
              <TouchableOpacity onPress={() => setLinkModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                value={linkTitle}
                onChangeText={setLinkTitle}
                placeholder="e.g. Stanford Course Slide Deck"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.textInput}
                value={linkSubject}
                onChangeText={setLinkSubject}
                placeholder={profile?.subjects[0] || 'Subject'}
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>URL / Link</Text>
              <TextInput
                style={styles.textInput}
                value={linkUri}
                onChangeText={setLinkUri}
                placeholder="https://..."
                placeholderTextColor={COLORS.textLight}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={linkDesc}
                onChangeText={setLinkDesc}
                placeholder="e.g. Recommended reading for Chapter 2"
                placeholderTextColor={COLORS.textLight}
              />

              <Button
                title="Save Resource Link"
                onPress={handleSaveLink}
                variant="primary"
                size="md"
                icon="checkmark"
                style={styles.saveLinkBtn}
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
  headerActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 6
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
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
  matCard: {
    marginBottom: SPACING.sm
  },
  matRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  fileIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  matInfo: {
    flex: 1
  },
  matTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text
  },
  matMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  matDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2
  },
  deleteBtn: {
    padding: 6
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
  saveLinkBtn: {
    marginTop: SPACING.lg
  }
});
