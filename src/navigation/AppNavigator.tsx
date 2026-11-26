import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { PlannerScreen } from '../screens/PlannerScreen';
import { TimetableScreen } from '../screens/TimetableScreen';
import { AiChatScreen } from '../screens/AiChatScreen';
import { MoreScreen } from '../screens/MoreScreen';

import { FieldSelectScreen } from '../screens/FieldSelectScreen';
import { LectureJournalScreen } from '../screens/LectureJournalScreen';
import { LectureDetailScreen } from '../screens/LectureDetailScreen';
import { AssignmentsScreen } from '../screens/AssignmentsScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { StudyMaterialsScreen } from '../screens/StudyMaterialsScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { FocusModeScreen } from '../screens/FocusModeScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { GamificationScreen } from '../screens/GamificationScreen';
import { GamesScreen } from '../screens/GamesScreen';
import { ExamPrepScreen } from '../screens/ExamPrepScreen';
import { GlobalSearchScreen } from '../screens/GlobalSearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600'
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Planner') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Timetable') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'AiChat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'grid' : 'grid-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        }
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Planner"
        component={PlannerScreen}
        options={{ tabBarLabel: 'AI Planner' }}
      />
      <Tab.Screen
        name="Timetable"
        component={TimetableScreen}
        options={{ tabBarLabel: 'Timetable' }}
      />
      <Tab.Screen
        name="AiChat"
        component={AiChatScreen}
        options={{ tabBarLabel: 'AI Tutor' }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ tabBarLabel: 'All Features' }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="FieldSelect" component={FieldSelectScreen} />
      <Stack.Screen name="LectureJournal" component={LectureJournalScreen} />
      <Stack.Screen name="LectureDetail" component={LectureDetailScreen} />
      <Stack.Screen name="Assignments" component={AssignmentsScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
      <Stack.Screen name="Materials" component={StudyMaterialsScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="FocusMode" component={FocusModeScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Gamification" component={GamificationScreen} />
      <Stack.Screen name="Games" component={GamesScreen} />
      <Stack.Screen name="ExamPrep" component={ExamPrepScreen} />
      <Stack.Screen name="GlobalSearch" component={GlobalSearchScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
