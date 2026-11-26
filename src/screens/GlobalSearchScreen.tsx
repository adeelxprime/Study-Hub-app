import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { storage } from '../services/storage';
import { Lecture, Note, Assignment, StudyMaterial, TimetableClass } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

type CategoryFilter = 'All' | 'Lectures' | 'Notes' | 'Assignments' | 'Materials' | 'Classes';

export const GlobalSearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [classes, setClasses] = useState<TimetableClass[]>([]);

  useEffect(() => {
    Promise.all([
      storage.getLectures(),
      storage.getNotes(),
      storage.getAssignments(),
      storage.getMaterials(),
      storage.getTimetable()
    ]).then(([lecs, nts, asgs, mats, cls]) => {
      setLectures(lecs);
      setNotes(nts);
      setAssignments(asgs);
      setMaterials(mats);
      setClasses(cls);
    });
  }, []);

  const q = query.trim().toLowerCase();

  const matchingLectures = q
    ? lectures.filter(
        l =>
          l.title.toLowerCase().includes(q) ||
          l.subject.toLowerCase().includes(q) ||
          (l.classwork && l.classwork.toLowerCase().includes(q))
      )
    : [];

  const matchingNotes = q
    ? notes.filter(
        n =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.subject.toLowerCase().includes(q)
      )
    : [];

  const matchingAssignments = q
    ? assignments.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.subject.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q))
      )
    : [];

  const matchingMaterials = q
    ? materials.filter(
        m =>
          m.title.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q)
      )
    : [];

  const matchingClasses = q
    ? classes.filter(
        c =>
          c.subject.toLowerCase().includes(q) ||
          c.teacher.toLowerCase().includes(q) ||
          c.room.toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    (category === 'All' || category === 'Lectures' ? matchingLectures.length : 0) +
    (category === 'All' || category === 'Notes' ? matchingNotes.length : 0) +
    (category === 'All' || category === 'Assignments' ? matchingAssignments.length : 0) +
    (category === 'All' || category === 'Materials' ? matchingMaterials.length : 0) +
    (category === 'All' || category === 'Classes' ? matchingClasses.length : 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Global search across all items..."
            placeholderTextColor={COLORS.textLight}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.categoriesBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {(['All', 'Lectures', 'Notes', 'Assignments', 'Materials', 'Classes'] as CategoryFilter[]).map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.catPill, category === cat && styles.catPillActive]}
            >
              <Text style={[styles.catPillText, category === cat && styles.catPillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!q ? (
          <View style={styles.emptyPrompt}>
            <Ionicons name="search" size={48} color={COLORS.borderDark} />
            <Text style={styles.emptyPromptTitle}>Search Your Entire Study Space</Text>
            <Text style={styles.emptyPromptDesc}>
              Quickly find lectures, handwritten OCR notes, upcoming assignments, syllabus PDFs, and class halls.
            </Text>
          </View>
        ) : totalResults === 0 ? (
          <View style={styles.emptyPrompt}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyPromptTitle}>No Results Found</Text>
            <Text style={styles.emptyPromptDesc}>
              No items matching "{query}". Try a different keyword or category filter.
            </Text>
          </View>
        ) : (
          <View>
            {/* Matching Lectures */}
            {(category === 'All' || category === 'Lectures') && matchingLectures.length > 0 && (
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionTitle}>Lectures ({matchingLectures.length})</Text>
                {matchingLectures.map(l => (
                  <Card key={l.id} style={styles.resultCard}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('LectureDetail', { lectureId: l.id })}
                    >
                      <View style={styles.resultHeader}>
                        <Badge label="LECTURE" variant="primary" size="sm" />
                        <Text style={styles.resultDate}>{l.date}</Text>
                      </View>
                      <Text style={styles.resultTitle}>{l.title}</Text>
                      <Text style={styles.resultSub}>{l.subject}</Text>
                    </TouchableOpacity>
                  </Card>
                ))}
              </View>
            )}

            {/* Matching Notes */}
            {(category === 'All' || category === 'Notes') && matchingNotes.length > 0 && (
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionTitle}>Study Notes ({matchingNotes.length})</Text>
                {matchingNotes.map(n => (
                  <Card key={n.id} style={styles.resultCard}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('Notes')}
                    >
                      <View style={styles.resultHeader}>
                        <Badge label="NOTE" variant="info" size="sm" />
                        <Text style={styles.resultDate}>{new Date(n.updatedAt).toLocaleDateString()}</Text>
                      </View>
                      <Text style={styles.resultTitle}>{n.title}</Text>
                      <Text style={styles.resultSub} numberOfLines={2}>{n.content}</Text>
                    </TouchableOpacity>
                  </Card>
                ))}
              </View>
            )}

            {/* Matching Assignments */}
            {(category === 'All' || category === 'Assignments') && matchingAssignments.length > 0 && (
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionTitle}>Assignments ({matchingAssignments.length})</Text>
                {matchingAssignments.map(a => (
                  <Card key={a.id} style={styles.resultCard}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('Assignments')}
                    >
                      <View style={styles.resultHeader}>
                        <Badge label={a.completed ? 'COMPLETED' : 'PENDING'} variant={a.completed ? 'success' : 'danger'} size="sm" />
                        <Text style={styles.resultDate}>Priority: {a.priority}</Text>
                      </View>
                      <Text style={styles.resultTitle}>{a.title}</Text>
                      <Text style={styles.resultSub}>{a.subject} &bull; Due: {new Date(a.deadline).toLocaleDateString()}</Text>
                    </TouchableOpacity>
                  </Card>
                ))}
              </View>
            )}

            {/* Matching Materials */}
            {(category === 'All' || category === 'Materials') && matchingMaterials.length > 0 && (
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionTitle}>Materials ({matchingMaterials.length})</Text>
                {matchingMaterials.map(m => (
                  <Card key={m.id} style={styles.resultCard}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('Materials')}
                    >
                      <View style={styles.resultHeader}>
                        <Badge label={m.fileType.toUpperCase()} variant="warning" size="sm" />
                        <Text style={styles.resultDate}>{new Date(m.dateAdded).toLocaleDateString()}</Text>
                      </View>
                      <Text style={styles.resultTitle}>{m.title}</Text>
                      <Text style={styles.resultSub}>{m.subject}</Text>
                    </TouchableOpacity>
                  </Card>
                ))}
              </View>
            )}

            {/* Matching Classes */}
            {(category === 'All' || category === 'Classes') && matchingClasses.length > 0 && (
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionTitle}>Timetable Classes ({matchingClasses.length})</Text>
                {matchingClasses.map(c => (
                  <Card key={c.id} style={styles.resultCard}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('Timetable')}
                    >
                      <View style={styles.resultHeader}>
                        <Badge label="CLASS" variant="primary" size="sm" />
                        <Text style={styles.resultDate}>{c.startTime} - {c.endTime}</Text>
                      </View>
                      <Text style={styles.resultTitle}>{c.subject}</Text>
                      <Text style={styles.resultSub}>{c.teacher} &bull; Room: {c.room}</Text>
                    </TouchableOpacity>
                  </Card>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
    paddingVertical: SPACING.sm,
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
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 7,
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
  categoriesBar: {
    backgroundColor: COLORS.card,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  categoryScroll: {
    paddingHorizontal: SPACING.base,
    gap: 8
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  catPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  catPillTextActive: {
    color: '#FFFFFF'
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 40
  },
  emptyPrompt: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20
  },
  emptyPromptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12
  },
  emptyPromptDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4
  },
  sectionGroup: {
    marginBottom: SPACING.base
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  resultCard: {
    marginBottom: SPACING.sm
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  resultDate: {
    fontSize: 11,
    color: COLORS.textLight
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2
  },
  resultSub: {
    fontSize: 12,
    color: COLORS.textMuted
  }
});
