import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { TimetableClass, Assignment, Exam } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

class NotificationService {
  private hasPermission: boolean = false;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.hasPermission = finalStatus === 'granted';

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('study-reminders', {
          name: 'Study Assistant Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4F46E5',
          sound: 'default'
        });
      }

      return this.hasPermission;
    } catch (e) {
      console.warn('Failed to get notification permissions:', e);
      return false;
    }
  }

  // --- 1. Class Reminder (15 mins before class) ---
  async scheduleClassReminder(classItem: TimetableClass): Promise<string | null> {
    try {
      const granted = await this.requestPermissions();
      if (!granted) return null;

      const [hoursStr, minsStr] = classItem.startTime.split(':');
      let targetHour = parseInt(hoursStr, 10);
      let targetMinute = parseInt(minsStr, 10) - 15;

      if (targetMinute < 0) {
        targetMinute += 60;
        targetHour -= 1;
        if (targetHour < 0) targetHour += 24;
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Upcoming Class: ${classItem.subject}`,
          body: `Starts in 15 mins with ${classItem.teacher} in ${classItem.room || 'campus'}.`,
          data: { type: 'class', classId: classItem.id }
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: classItem.dayOfWeek === 7 ? 1 : classItem.dayOfWeek + 1, // Expo weekday: 1 is Sunday
          hour: targetHour,
          minute: targetMinute
        }
      });

      return id;
    } catch (e) {
      console.warn('Failed to schedule class notification:', e);
      return null;
    }
  }

  // --- 2. Assignment Reminder ---
  async scheduleAssignmentReminder(assignment: Assignment): Promise<string | null> {
    try {
      const granted = await this.requestPermissions();
      if (!granted) return null;

      const deadlineDate = new Date(assignment.deadline);
      const reminderDate = new Date(deadlineDate.getTime() - 4 * 60 * 60 * 1000); // 4 hours before deadline

      if (reminderDate.getTime() <= Date.now()) {
        return null; // Past deadline or too close
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Assignment Due Soon: ${assignment.title}`,
          body: `Deadline in 4 hours (${assignment.subject}). Priority: ${assignment.priority}`,
          data: { type: 'assignment', assignmentId: assignment.id }
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate
        }
      });

      return id;
    } catch (e) {
      console.warn('Failed to schedule assignment notification:', e);
      return null;
    }
  }

  // --- 3. Exam Reminder (1 day before) ---
  async scheduleExamReminder(exam: Exam): Promise<string | null> {
    try {
      const granted = await this.requestPermissions();
      if (!granted) return null;

      const examDate = new Date(exam.date);
      const reminderDate = new Date(examDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before

      if (reminderDate.getTime() <= Date.now()) return null;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Exam Tomorrow: ${exam.title}`,
          body: `Scheduled at ${examDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} in ${exam.room}. Review your quick revision notes!`,
          data: { type: 'exam', examId: exam.id }
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate
        }
      });

      return id;
    } catch (e) {
      console.warn('Failed to schedule exam notification:', e);
      return null;
    }
  }

  // --- 4. Daily Study Session Reminder ---
  async scheduleDailyStudyReminder(hour: number = 19, minute: number = 0): Promise<string | null> {
    try {
      const granted = await this.requestPermissions();
      if (!granted) return null;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time for Today\'s Study Session 📚',
          body: 'Check off pending tasks, review today\'s lecture, and keep your streak alive!',
          data: { type: 'daily-reminder' }
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute
        }
      });

      return id;
    } catch (e) {
      console.warn('Failed to schedule daily reminder:', e);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.warn('Failed to cancel notification:', e);
    }
  }
}

export const notifications = new NotificationService();
