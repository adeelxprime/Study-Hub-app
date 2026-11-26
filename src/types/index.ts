export type StudentFieldType =
  | 'Computer Science'
  | 'BBA'
  | 'Software Engineering'
  | 'Chemistry'
  | 'Physics'
  | 'Pharmacy'
  | 'Nursing'
  | 'Civil Engineering'
  | 'Mechanical Engineering'
  | 'Electrical Engineering'
  | 'MBBS';

export interface StudentProfile {
  name: string;
  field: StudentFieldType;
  semester: string;
  university: string;
  targetStudyHoursDaily: number;
  sleepTime: string; // "23:00"
  wakeTime: string;  // "07:00"
  subjects: string[];
  createdAt: string;
}

export interface TimetableClass {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  dayOfWeek: number; // 1 = Monday, 7 = Sunday
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  color: string;
  notificationsEnabled: boolean;
}

export type AssignmentPriority = 'Low' | 'Medium' | 'High';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  deadline: string; // ISO date or "YYYY-MM-DDTHH:mm"
  priority: AssignmentPriority;
  description: string;
  completed: boolean;
  score?: string;
  reminderEnabled?: boolean;
  createdAt: string;
}

export interface Lecture {
  id: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
  classwork: string;
  description: string;
  boardPhotos: string[]; // local uris
  ocrText?: string;
  revisionData?: LectureRevisionData;
  createdAt: string;
  pointsAwarded?: boolean;
}

export interface LectureRevisionData {
  summary: string;
  keyPoints: string[];
  definitions: { term: string; definition: string }[];
  formulas: { formula: string; explanation: string }[];
  mcqs: { question: string; options: string[]; correctIndex: number; explanation: string }[];
  shortQuestions: { question: string; answer: string }[];
  longQuestions: { question: string; answerOutline: string }[];
  flashcards: { front: string; back: string }[];
  quickRevisionNotes: string;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  content: string;
  tags: string[];
  isAiGenerated?: boolean;
  sourceLectureId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  fileUri: string;
  fileName: string;
  fileType: string; // 'pdf' | 'doc' | 'image' | 'link'
  fileSize?: number;
  dateAdded: string;
  description?: string;
}

export interface PlannedTask {
  id: string;
  time: string;
  title: string;
  type: 'class' | 'study' | 'break' | 'review' | 'assignment';
  subject: string;
  durationMinutes: number;
  notes: string;
  isBreak: boolean;
  completed: boolean;
}

export interface DailySchedule {
  date: string; // YYYY-MM-DD
  tasks: PlannedTask[];
  generatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  id: string;
  title: string;
  subject: string;
  field: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  userAnswers: { [questionId: string]: number };
  questions: QuizQuestion[];
}

export interface FocusSession {
  id: string;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';
  durationMinutes: number;
  subject: string;
  completedAt: string;
  taskTitle?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 1
  requirement: string;
}

export interface GamificationState {
  points: number;
  streakCount: number;
  lastActiveDate: string;
  savedLectureCount: number;
  completedAssignmentCount: number;
  passedQuizCount: number;
  focusMinutesTotal: number;
  badges: Badge[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  lectureContextId?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  subject: string;
  field: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DDTHH:mm
  room: string;
  targetGrade: string;
  notes: string;
  revisionPlan?: ExamRevisionPlan;
}

export interface ExamRevisionPlan {
  readinessScore: number;
  strategySummary: string;
  dailyMilestones: {
    dayNumber: number;
    focus: string;
    targetTopics: string[];
    recommendedHours: number;
    actionItems: string[];
  }[];
  highYieldTopics: string[];
  examDayTips: string[];
}

export interface StudyGoal {
  dailyStudyMinutesGoal: number;
  weeklyStudyMinutesGoal: number;
  dailyTasksGoal: number;
  weeklyQuizzesGoal: number;
}
