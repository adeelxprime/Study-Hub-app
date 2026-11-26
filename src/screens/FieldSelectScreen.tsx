import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { STUDENT_FIELDS, FieldMetadata } from '../constants/fields';
import { storage } from '../services/storage';
import { StudentProfile, StudentFieldType } from '../types';
import { Button } from '../components/Button';

interface FieldSelectScreenProps {
  navigation: any;
  route: any;
}

export const FieldSelectScreen: React.FC<FieldSelectScreenProps> = ({ navigation }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [selectedField, setSelectedField] = useState<StudentFieldType>('Computer Science');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const prof = await storage.getProfile();
    setProfile(prof);
    setSelectedField(prof.field);
  };

  const handleSelectField = async (field: FieldMetadata) => {
    setSelectedField(field.id);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const fieldMeta = STUDENT_FIELDS.find(f => f.id === selectedField) || STUDENT_FIELDS[0];
      const updatedProfile: StudentProfile = {
        ...profile,
        field: selectedField,
        subjects: fieldMeta.defaultSubjects
      };
      await storage.saveProfile(updatedProfile);
      Alert.alert(
        'Field Updated',
        `Your study field is now set to ${selectedField}. Course subjects and quiz banks have been updated!`,
        [{ text: 'Continue', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to update field.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Select Your Field of Study</Text>
          <Text style={styles.subtitle}>Tailors AI responses, quizzes, and course subjects</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {STUDENT_FIELDS.map(field => {
            const isSelected = selectedField === field.id;
            return (
              <TouchableOpacity
                key={field.id}
                activeOpacity={0.8}
                onPress={() => handleSelectField(field)}
                style={[
                  styles.fieldCard,
                  isSelected && {
                    borderColor: field.color,
                    borderWidth: 2,
                    backgroundColor: field.accentColor
                  }
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: isSelected ? field.color : field.accentColor }
                  ]}
                >
                  <Ionicons
                    name={field.icon as any}
                    size={24}
                    color={isSelected ? '#FFFFFF' : field.color}
                  />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.row}>
                    <Text style={[styles.fieldName, isSelected && { color: field.color }]}>
                      {field.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={field.color} />
                    )}
                  </View>
                  <Text style={styles.fieldDesc} numberOfLines={2}>
                    {field.description}
                  </Text>
                  <View style={styles.subjectsPreview}>
                    <Text style={styles.subjectsCount}>
                      {field.defaultSubjects.length} Core Subjects:
                    </Text>
                    <Text style={styles.subjectsList} numberOfLines={1}>
                      {field.defaultSubjects.slice(0, 3).join(', ')}...
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Confirm ${selectedField}`}
          onPress={handleSave}
          loading={saving}
          variant="primary"
          size="lg"
          icon="checkmark"
        />
      </View>
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
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm
  },
  headerTitleContainer: {
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 90
  },
  grid: {
    gap: SPACING.md
  },
  fieldCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...SHADOWS.small
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md
  },
  cardContent: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1
  },
  fieldDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 8
  },
  subjectsPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 6,
    borderRadius: RADIUS.sm
  },
  subjectsCount: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  subjectsList: {
    fontSize: 11,
    color: COLORS.textLight
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    padding: SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium
  }
});
