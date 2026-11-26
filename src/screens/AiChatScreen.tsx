import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { ChatMessage, ChatSession, StudentProfile, Lecture } from '../types';
import { STUDENT_FIELDS } from '../constants/fields';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

const SUGGESTED_PROMPTS = [
  'Explain this concept in simple terms',
  'Give me 2 university exam MCQs with answers',
  'What are the key formulas and units?',
  'Give a real-world engineering/medical analogy',
  'How do I answer this in a 10-mark final question?'
];

export const AiChatScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route
}) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('General');
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Chat sessions history modal
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('session_' + Date.now());

  const scrollViewRef = useRef<any>(null);

  const loadData = useCallback(async () => {
    try {
      const [prof, lecs, savedSessions] = await Promise.all([
        storage.getProfile(),
        storage.getLectures(),
        storage.getChatSessions()
      ]);
      setProfile(prof);
      setLectures(lecs);
      setSessions(savedSessions);

      if (prof.subjects.length > 0) {
        setSelectedSubject(prof.subjects[0]);
      }

      // Check if routed with specific lecture context
      if (route.params?.lectureId) {
        setSelectedLectureId(route.params.lectureId);
        const matched = lecs.find(l => l.id === route.params.lectureId);
        if (matched) {
          setSelectedSubject(matched.subject);
        }
      }

      // Initial greeting if empty
      if (messages.length === 0) {
        setMessages([
          {
            id: 'm-init',
            sender: 'ai',
            text: `Hello! I'm your AI Study Assistant for **${prof.field}**.\n\nAsk me anything about your coursework, assignments, or attach a lecture to review exam questions and formulas!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (e) {
      console.warn('Failed to load chat data:', e);
    }
  }, [messages.length, route.params?.lectureId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lectureContextId: selectedLectureId || undefined
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const lectureContext = selectedLectureId
        ? lectures.find(l => l.id === selectedLectureId)
        : null;

      const historyPayload = updatedMessages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await api.sendChatMessage(
        userMsg.text,
        historyPayload,
        profile?.field || 'General',
        selectedSubject,
        lectureContext
      );

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: res.reply || 'Here is the academic explanation for your topic.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      await saveCurrentSession(finalMessages);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: 'Sorry, I encountered an issue connecting to the AI tutor service. Please check your network or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const saveCurrentSession = async (currentMsgs: ChatMessage[]) => {
    if (currentMsgs.length <= 1) return;
    const sessionList = await storage.getChatSessions();
    const existingIdx = sessionList.findIndex(s => s.id === currentSessionId);

    const titleText = currentMsgs.find(m => m.sender === 'user')?.text.slice(0, 30) || 'Study Session';

    const sessionObj: ChatSession = {
      id: currentSessionId,
      title: titleText,
      subject: selectedSubject,
      field: profile?.field || 'General',
      messages: currentMsgs,
      updatedAt: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      sessionList[existingIdx] = sessionObj;
    } else {
      sessionList.unshift(sessionObj);
    }

    setSessions(sessionList);
    await storage.saveChatSessions(sessionList);
  };

  const handleStartNewChat = () => {
    setCurrentSessionId('session_' + Date.now());
    setMessages([
      {
        id: 'm-init',
        sender: 'ai',
        text: `New study chat started for **${profile?.field}** (${selectedSubject}). How can I help you master your coursework today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleLoadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setSelectedSubject(session.subject);
    setMessages(session.messages);
    setHistoryModalVisible(false);
  };

  const fieldMeta = STUDENT_FIELDS.find(f => f.id === profile?.field) || STUDENT_FIELDS[0];
  const activeLecture = lectures.find(l => l.id === selectedLectureId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.fieldIconCircle, { backgroundColor: fieldMeta.accentColor }]}>
            <Ionicons name={fieldMeta.icon as any} size={18} color={fieldMeta.color} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Study Tutor</Text>
            <Text style={styles.headerSubtitle}>{profile?.field || 'University'}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setHistoryModalVisible(true)}
            style={styles.iconButton}
          >
            <Ionicons name="time-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleStartNewChat}
            style={[styles.iconButton, { backgroundColor: COLORS.primaryBg }]}
          >
            <Ionicons name="add" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Context Selection Bar */}
      <View style={styles.contextBar}>
        {/* Subject dropdown pill */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contextScroll}>
          {profile?.subjects.map(sub => {
            const isSelected = selectedSubject === sub;
            return (
              <TouchableOpacity
                key={sub}
                onPress={() => setSelectedSubject(sub)}
                style={[styles.contextPill, isSelected && styles.contextPillActive]}
              >
                <Text style={[styles.contextPillText, isSelected && styles.contextPillTextActive]}>
                  {sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Attached Lecture Context Pill (if selected) */}
      {activeLecture && (
        <View style={styles.attachedLectureBar}>
          <Ionicons name="attach" size={14} color={COLORS.primary} />
          <Text style={styles.attachedLectureText} numberOfLines={1}>
            Attached Lecture Context: {activeLecture.title}
          </Text>
          <TouchableOpacity onPress={() => setSelectedLectureId(null)}>
            <Ionicons name="close" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Messages Stream */}
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesScroll}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAi]}
              >
                {!isUser && (
                  <View style={styles.aiAvatar}>
                    <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                  </View>
                )}

                <View
                  style={[
                    styles.msgBubble,
                    isUser ? styles.msgBubbleUser : styles.msgBubbleAi
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      isUser ? styles.msgTextUser : styles.msgTextAi
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.msgTimestamp,
                      isUser ? styles.msgTimeUser : styles.msgTimeAi
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })}

          {loading && (
            <View style={[styles.msgRow, styles.msgRowAi]}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              </View>
              <View style={[styles.msgBubble, styles.msgBubbleAi, styles.loadingBubble]}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Thinking academically...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Suggested Prompts Carousel */}
        <View style={styles.suggestedPromptsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsScroll}>
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                onPress={() => handleSendMessage(prompt)}
                style={styles.promptChip}
              >
                <Text style={styles.promptChipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Ask about ${selectedSubject}...`}
            placeholderTextColor={COLORS.textLight}
            multiline
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
            style={[
              styles.sendButton,
              (!inputText.trim() || loading) && styles.sendButtonDisabled
            ]}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Chat History Modal */}
      <Modal visible={historyModalVisible} transparent animationType="slide" onRequestClose={() => setHistoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Saved Chat Sessions</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {sessions.length > 0 ? (
                sessions.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    activeOpacity={0.8}
                    onPress={() => handleLoadSession(s)}
                    style={styles.sessionItem}
                  >
                    <View style={styles.sessionIconBox}>
                      <Ionicons name="chatbubbles" size={18} color={COLORS.primary} />
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionTitle} numberOfLines={1}>
                        {s.title}
                      </Text>
                      <Text style={styles.sessionMeta}>
                        {s.subject} &bull; {new Date(s.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noSessionsText}>No past chat sessions saved yet.</Text>
              )}
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
  flex1: {
    flex: 1
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  fieldIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  contextBar: {
    backgroundColor: COLORS.card,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  contextScroll: {
    paddingHorizontal: SPACING.base,
    gap: 6
  },
  contextPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  contextPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  contextPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  contextPillTextActive: {
    color: '#FFFFFF'
  },
  attachedLectureBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: SPACING.base,
    paddingVertical: 6,
    gap: 6
  },
  attachedLectureText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600'
  },
  messagesScroll: {
    padding: SPACING.base,
    paddingBottom: 20
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end'
  },
  msgRowUser: {
    justifyContent: 'flex-end'
  },
  msgRowAi: {
    justifyContent: 'flex-start'
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  msgBubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small
  },
  msgBubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4
  },
  msgBubbleAi: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  msgText: {
    fontSize: 14,
    lineHeight: 21
  },
  msgTextUser: {
    color: '#FFFFFF'
  },
  msgTextAi: {
    color: '#1E293B'
  },
  msgTimestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end'
  },
  msgTimeUser: {
    color: 'rgba(255, 255, 255, 0.7)'
  },
  msgTimeAi: {
    color: COLORS.textLight
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic'
  },
  suggestedPromptsRow: {
    backgroundColor: COLORS.card,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  promptsScroll: {
    paddingHorizontal: SPACING.base,
    gap: 8
  },
  promptChip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full
  },
  promptChipText: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.base,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
    maxHeight: 100
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.borderDark
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
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  sessionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  sessionInfo: {
    flex: 1
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text
  },
  sessionMeta: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  noSessionsText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: 20,
    textAlign: 'center'
  }
});
