import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { StudentProfile } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // Profile form state
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [semester, setSemester] = useState('');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [targetHours, setTargetHours] = useState('3');

  // Backend / AI config state
  const [backendUrl, setBackendUrl] = useState('http://10.0.2.2:5000');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  // Sync state
  const [syncCode, setSyncCode] = useState('EDUSTUDENT-101');
  const [syncLoading, setSyncLoading] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const [prof, settings] = await Promise.all([
        storage.getProfile(),
        storage.getSettings()
      ]);
      setProfile(prof);
      setName(prof.name);
      setUniversity(prof.university);
      setSemester(prof.semester);
      setSleepTime(prof.sleepTime || '23:00');
      setWakeTime(prof.wakeTime || '07:00');
      setTargetHours(String(prof.targetStudyHoursDaily || 3));

      setBackendUrl(settings.backendUrl || 'http://10.0.2.2:5000');
      setGeminiApiKey(settings.geminiApiKey || '');
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      const updated: StudentProfile = {
        ...profile,
        name: name.trim() || 'Student',
        university: university.trim(),
        semester: semester.trim(),
        sleepTime: sleepTime.trim(),
        wakeTime: wakeTime.trim(),
        targetStudyHoursDaily: parseInt(targetHours, 10) || 3
      };
      await storage.saveProfile(updated);
      setProfile(updated);
      Alert.alert('Profile Saved', 'Study preferences updated successfully.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  const handleSaveApiSettings = async () => {
    try {
      await storage.saveSettings({
        backendUrl: backendUrl.trim(),
        geminiApiKey: geminiApiKey.trim()
      });
      Alert.alert('Settings Saved', 'Backend API and AI configuration saved.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const cleanUrl = backendUrl.trim().replace(/\/+$/, '');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${cleanUrl}/api/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setConnectionStatus(`Connected! Server: ${data.service}`);
        Alert.alert('Server Connected! 🚀', `Backend is online. Gemini Active: ${data.aiConfigured ? 'Yes' : 'Offline Intelligent Templates'}`);
      } else {
        setConnectionStatus(`Server responded with HTTP ${res.status}`);
      }
    } catch (e: any) {
      setConnectionStatus('Offline / Unreachable. Offline intelligent fallbacks active.');
      Alert.alert(
        'Offline Mode Active',
        'Could not reach backend server. The app will smoothly use intelligent offline generators for OCR, AI revision, and study schedules.'
      );
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCloudBackup = async () => {
    setSyncLoading(true);
    try {
      const backupJson = await storage.exportFullBackupJson();
      const res = await api.syncCloudBackup(syncCode, JSON.parse(backupJson));
      Alert.alert('Cloud Backup Successful ☁️', `All data backed up to server with Sync Code: ${syncCode}`);
    } catch (e: any) {
      Alert.alert('Backup Note', `Local backup is always preserved. Cloud sync message: ${e.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleCloudRestore = async () => {
    setSyncLoading(true);
    try {
      const res = await api.syncCloudRestore(syncCode);
      if (res.success && res.data) {
        await storage.importFullBackupJson(JSON.stringify(res.data));
        await loadSettings();
        Alert.alert('Restore Complete', 'All study data restored from cloud backup!');
      }
    } catch (e: any) {
      Alert.alert('Restore Error', e.message);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Study Data',
      'Are you sure? This will clear all timetable classes, assignments, and lectures. Default sample data will be restored.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await storage.resetAllData();
            await loadSettings();
            Alert.alert('Reset Complete', 'App data reset to default.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>App Settings & Sync</Text>
          <Text style={styles.headerSubtitle}>Preferences, AI configuration & backups</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Field Selection Shortcut Card */}
        <Card style={styles.fieldCard}>
          <View style={styles.fieldRow}>
            <View style={styles.fieldLeft}>
              <Text style={styles.fieldLabel}>Current Academic Major</Text>
              <Text style={styles.fieldName}>{profile?.field || 'General Studies'}</Text>
              <Text style={styles.fieldDesc}>
                {profile?.subjects.length || 0} active course subjects configured
              </Text>
            </View>
            <Button
              title="Change Field"
              onPress={() => navigation.navigate('FieldSelect')}
              variant="outline"
              size="sm"
            />
          </View>
        </Card>

        {/* Student Profile & Study Preferences */}
        <Card>
          <Text style={styles.cardSectionTitle}>Student Study Preferences</Text>

          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Alex Johnson"
            placeholderTextColor={COLORS.textLight}
          />

          <View style={styles.rowInputs}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>University / Institute</Text>
              <TextInput
                style={styles.textInput}
                value={university}
                onChangeText={setUniversity}
                placeholder="State University"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Semester / Year</Text>
              <TextInput
                style={styles.textInput}
                value={semester}
                onChangeText={setSemester}
                placeholder="4th Semester"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          </View>

          <View style={styles.rowInputs}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Bedtime</Text>
              <TextInput
                style={styles.textInput}
                value={sleepTime}
                onChangeText={setSleepTime}
                placeholder="23:00"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Wake-up Time</Text>
              <TextInput
                style={styles.textInput}
                value={wakeTime}
                onChangeText={setWakeTime}
                placeholder="07:00"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Study Target</Text>
              <TextInput
                style={styles.textInput}
                value={targetHours}
                onChangeText={setTargetHours}
                keyboardType="numeric"
                placeholder="3"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          </View>

          <Button
            title="Save Profile Preferences"
            onPress={handleSaveProfile}
            variant="primary"
            size="md"
            icon="checkmark"
            style={{ marginTop: SPACING.md }}
          />
        </Card>

        {/* AI Backend & Server Configuration */}
        <Card>
          <View style={styles.rowAlign}>
            <Ionicons name="server" size={17} color={COLORS.primary} style={styles.headerIcon} />
            <Text style={styles.cardSectionTitle}>AI Backend Server Configuration</Text>
          </View>

          <Text style={styles.sectionNotice}>
            The app securely proxies AI and OCR through a local or hosted backend server, preventing sensitive API keys from being exposed.
          </Text>

          <Text style={styles.inputLabel}>Backend Server URL</Text>
          <TextInput
            style={styles.textInput}
            value={backendUrl}
            onChangeText={setBackendUrl}
            placeholder="http://10.0.2.2:5000 or http://192.168.1.X:5000"
            placeholderTextColor={COLORS.textLight}
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Optional Direct Gemini API Key (Overrides server)</Text>
          <TextInput
            style={styles.textInput}
            value={geminiApiKey}
            onChangeText={setGeminiApiKey}
            placeholder="AIzaSy..."
            placeholderTextColor={COLORS.textLight}
            secureTextEntry
            autoCapitalize="none"
          />

          {connectionStatus && (
            <Text
              style={[
                styles.connectionStatusText,
                connectionStatus.includes('Connected')
                  ? { color: COLORS.success }
                  : { color: COLORS.textMuted }
              ]}
            >
              Status: {connectionStatus}
            </Text>
          )}

          <View style={styles.apiActionRow}>
            <Button
              title={testingConnection ? 'Testing...' : 'Test Connection'}
              onPress={handleTestConnection}
              loading={testingConnection}
              variant="outline"
              size="md"
              icon="pulse"
              style={styles.flex1}
            />
            <Button
              title="Save Config"
              onPress={handleSaveApiSettings}
              variant="primary"
              size="md"
              icon="save"
              style={styles.flex1}
            />
          </View>
        </Card>

        {/* Cloud Sync & Backup / Restore */}
        <Card>
          <View style={styles.rowAlign}>
            <Ionicons name="cloud" size={17} color="#0891B2" style={styles.headerIcon} />
            <Text style={styles.cardSectionTitle}>Cross-Device Cloud Sync & Backup</Text>
          </View>

          <Text style={styles.sectionNotice}>
            No mandatory account creation needed. Sync across devices using an anonymous Sync Code.
          </Text>

          <Text style={styles.inputLabel}>Sync Code / Backup Key</Text>
          <TextInput
            style={styles.textInput}
            value={syncCode}
            onChangeText={setSyncCode}
            placeholder="EDUSTUDENT-101"
            placeholderTextColor={COLORS.textLight}
            autoCapitalize="characters"
          />

          <View style={styles.apiActionRow}>
            <Button
              title={syncLoading ? 'Syncing...' : 'Upload Cloud Backup'}
              onPress={handleCloudBackup}
              loading={syncLoading}
              variant="secondary"
              size="md"
              icon="cloud-upload-outline"
              style={styles.flex1}
            />
            <Button
              title={syncLoading ? 'Restoring...' : 'Restore from Cloud'}
              onPress={handleCloudRestore}
              loading={syncLoading}
              variant="outline"
              size="md"
              icon="cloud-download-outline"
              style={styles.flex1}
            />
          </View>
        </Card>

        {/* Danger Zone */}
        <Card style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Text style={styles.dangerDesc}>
            Clear all stored timetable classes, assignments, lectures, notes, and reset gamification points to zero.
          </Text>
          <Button
            title="Reset All Local App Data"
            onPress={handleResetData}
            variant="danger"
            size="md"
            icon="trash"
            style={{ marginTop: 8 }}
          />
        </Card>
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
  fieldCard: {
    backgroundColor: COLORS.primaryBg,
    borderColor: '#C7D2FE',
    marginBottom: SPACING.md
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  fieldLeft: {
    flex: 1,
    marginRight: 10
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textTransform: 'uppercase'
  },
  fieldName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2
  },
  fieldDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  headerIcon: {
    marginRight: 6
  },
  sectionNotice: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginBottom: 8
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
  rowInputs: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  flex1: {
    flex: 1
  },
  connectionStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8
  },
  apiActionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md
  },
  dangerCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA'
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B'
  },
  dangerDesc: {
    fontSize: 12,
    color: '#B91C1C',
    lineHeight: 17,
    marginVertical: 4
  }
});
