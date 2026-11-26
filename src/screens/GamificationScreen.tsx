import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { storage } from '../services/storage';
import { GamificationState, StudentProfile } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

export const GamificationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [gamification, setGamification] = useState<GamificationState | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [gam, prof] = await Promise.all([
        storage.getGamification(),
        storage.getProfile()
      ]);
      setGamification(gam);
      setProfile(prof);
    } catch (e) {
      console.warn('Failed to load gamification:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const points = gamification?.points || 0;
  const level = Math.floor(points / 50) + 1;
  const pointsInCurrentLevel = points % 50;
  const levelPercent = Math.min(100, Math.round((pointsInCurrentLevel / 50) * 100));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Achievements & Streaks</Text>
          <Text style={styles.headerSubtitle}>Points, Badges & Academic Momentum</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Points & Level Banner Card */}
        <Card style={styles.pointsBanner}>
          <View style={styles.trophyIconLarge}>
            <Ionicons name="trophy" size={36} color="#D97706" />
          </View>
          <Text style={styles.pointsCountText}>{points} PTS</Text>
          <Text style={styles.levelTitle}>
            Level {level} &bull; {level >= 5 ? 'Master Scholar' : level >= 3 ? 'Dedicated Student' : 'Rising Scholar'}
          </Text>

          <View style={styles.levelProgressContainer}>
            <View style={styles.levelBarBg}>
              <View style={[styles.levelBarFill, { width: `${levelPercent}%` }]} />
            </View>
            <Text style={styles.levelProgressText}>
              {pointsInCurrentLevel} / 50 XP to Level {level + 1}
            </Text>
          </View>
        </Card>

        {/* Daily Streak Card */}
        <Card style={styles.streakCard}>
          <View style={styles.streakRow}>
            <View style={styles.flameCircle}>
              <Ionicons name="flame" size={28} color="#EA580C" />
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakCountText}>
                {gamification?.streakCount || 1} Day Study Streak! 🔥
              </Text>
              <Text style={styles.streakDesc}>
                Open the app daily and complete study tasks to keep your streak burning!
              </Text>
            </View>
          </View>
        </Card>

        {/* How to Earn Points Rules */}
        <Card>
          <Text style={styles.cardHeaderTitle}>How to Earn Gamification Points</Text>
          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <View style={[styles.ruleIconBox, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="camera" size={16} color="#4F46E5" />
              </View>
              <Text style={styles.ruleLabel}>Save a Lecture Journal Entry</Text>
              <Text style={styles.rulePoints}>+5 pts</Text>
            </View>

            <View style={styles.ruleItem}>
              <View style={[styles.ruleIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="clipboard" size={16} color="#10B981" />
              </View>
              <Text style={styles.ruleLabel}>Complete an Assignment</Text>
              <Text style={styles.rulePoints}>+10 pts</Text>
            </View>

            <View style={styles.ruleItem}>
              <View style={[styles.ruleIconBox, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="help-circle" size={16} color="#F59E0B" />
              </View>
              <Text style={styles.ruleLabel}>Pass a Topical or Field Quiz</Text>
              <Text style={styles.rulePoints}>+15 pts</Text>
            </View>

            <View style={styles.ruleItem}>
              <View style={[styles.ruleIconBox, { backgroundColor: '#FDF2F8' }]}>
                <Ionicons name="timer" size={16} color="#DB2777" />
              </View>
              <Text style={styles.ruleLabel}>Pomodoro Focus Minute</Text>
              <Text style={styles.rulePoints}>+1 pt/min</Text>
            </View>
          </View>
        </Card>

        {/* Badges Showcase */}
        <Text style={styles.badgesSectionTitle}>Academic Badges & Milestones</Text>
        <View style={styles.badgesGrid}>
          {gamification?.badges?.map(badge => {
            const isUnlocked = badge.unlocked;
            const isClassRegular = badge.id === 'class_regular';

            return (
              <Card
                key={badge.id}
                style={[
                  styles.badgeCard,
                  isUnlocked && styles.badgeCardUnlocked
                ]}
              >
                <View
                  style={[
                    styles.badgeIconCircle,
                    isUnlocked ? styles.badgeIconUnlocked : styles.badgeIconLocked
                  ]}
                >
                  <Ionicons
                    name={badge.icon as any}
                    size={26}
                    color={isUnlocked ? '#FFFFFF' : '#94A3B8'}
                  />
                </View>

                <Text
                  style={[
                    styles.badgeName,
                    isUnlocked && { color: COLORS.text }
                  ]}
                >
                  {badge.name}
                </Text>

                <Text style={styles.badgeDesc}>{badge.description}</Text>

                {/* Progress Bar for Locked Badges */}
                {!isUnlocked && (
                  <View style={styles.badgeProgressBox}>
                    <View style={styles.badgeProgressBg}>
                      <View
                        style={[
                          styles.badgeProgressFill,
                          { width: `${Math.round(badge.progress * 100)}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.badgeProgressText}>
                      {isClassRegular
                        ? `${gamification?.savedLectureCount || 0} / 5 lectures`
                        : `${Math.round(badge.progress * 100)}%`}
                    </Text>
                  </View>
                )}

                {isUnlocked && (
                  <View style={styles.unlockedPill}>
                    <Ionicons name="checkmark-circle" size={13} color="#059669" />
                    <Text style={styles.unlockedText}>Unlocked</Text>
                  </View>
                )}
              </Card>
            );
          })}
        </View>
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
    paddingVertical: SPACING.md,
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
  headerTitles: {
    flex: 1
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
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 40
  },
  pointsBanner: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A'
  },
  trophyIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    ...SHADOWS.small
  },
  pointsCountText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#92400E'
  },
  levelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
    marginTop: 2
  },
  levelProgressContainer: {
    width: '80%',
    marginTop: 12,
    alignItems: 'center'
  },
  levelBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#FDE68A',
    borderRadius: 4,
    overflow: 'hidden'
  },
  levelBarFill: {
    height: '100%',
    backgroundColor: '#D97706',
    borderRadius: 4
  },
  levelProgressText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
    marginTop: 4
  },
  streakCard: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA'
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  flameCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small
  },
  streakInfo: {
    flex: 1
  },
  streakCountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#9A3412'
  },
  streakDesc: {
    fontSize: 12,
    color: '#C2410C',
    lineHeight: 17,
    marginTop: 2
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10
  },
  rulesList: {
    gap: 10
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  ruleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  ruleLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500'
  },
  rulePoints: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary
  },
  badgesSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginVertical: SPACING.md
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm
  },
  badgeCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.base,
    paddingHorizontal: 8,
    marginBottom: 0,
    backgroundColor: COLORS.card
  },
  badgeCardUnlocked: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4'
  },
  badgeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  badgeIconUnlocked: {
    backgroundColor: '#10B981'
  },
  badgeIconLocked: {
    backgroundColor: '#E2E8F0'
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center'
  },
  badgeDesc: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 2,
    minHeight: 30
  },
  badgeProgressBox: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8
  },
  badgeProgressBg: {
    width: '100%',
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden'
  },
  badgeProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3
  },
  badgeProgressText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600'
  },
  unlockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    gap: 3,
    marginTop: 8
  },
  unlockedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669'
  }
});
