import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StudentProfile,
  TimetableClass,
  Assignment,
  Lecture,
  Note,
  StudyMaterial,
  DailySchedule,
  QuizResult,
  FocusSession,
  GamificationState,
  Exam,
  ChatSession,
  StudyGoal,
  Badge
} from '../types';
import { STUDENT_FIELDS } from '../constants/fields';

const STORAGE_KEYS = {
  PROFILE: '@edu_profile',
  TIMETABLE: '@edu_timetable',
  ASSIGNMENTS: '@edu_assignments',
  LECTURES: '@edu_lectures',
  NOTES: '@edu_notes',
  MATERIALS: '@edu_materials',
  SCHEDULES: '@edu_schedules',
  QUIZZES: '@edu_quizzes',
  FOCUS: '@edu_focus',
  GAMIFICATION: '@edu_gamification',
  EXAMS: '@edu_exams',
  CHATS: '@edu_chats',
  GOALS: '@edu_goals',
  SETTINGS: '@edu_settings',
  AWARDED_LECTURES: '@edu_awarded_lectures'
};

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'class_regular',
    name: 'Class Regular',
    description: 'Save 5 lectures in your journal',
    icon: 'school',
    unlocked: false,
    progress: 0,
    requirement: '5 Lectures'
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Score 80% or higher on 3 quizzes',
    icon: 'trophy',
    unlocked: false,
    progress: 0,
    requirement: '3 High-Score Quizzes'
  },
  {
    id: 'deadline_hero',
    name: 'Deadline Hero',
    description: 'Complete 5 assignments on time',
    icon: 'shield-checkmark',
    unlocked: false,
    progress: 0,
    requirement: '5 Assignments Done'
  },
  {
    id: 'focus_champion',
    name: 'Focus Champion',
    description: 'Complete 100 minutes of focused study',
    icon: 'flame',
    unlocked: false,
    progress: 0,
    requirement: '100 Study Mins'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a study session before 9:00 AM',
    icon: 'sunny',
    unlocked: false,
    progress: 0,
    requirement: 'Morning Study'
  },
  {
    id: 'first_ocr',
    name: 'Smart Scribe',
    description: 'Extract board photo notes using AI OCR',
    icon: 'scan',
    unlocked: false,
    progress: 0,
    requirement: '1 OCR Extraction'
  }
];

export const INITIAL_GOALS: StudyGoal = {
  dailyStudyMinutesGoal: 120,
  weeklyStudyMinutesGoal: 700,
  dailyTasksGoal: 4,
  weeklyQuizzesGoal: 3
};

export const INITIAL_PROFILE: StudentProfile = {
  name: 'Alex Johnson',
  field: 'Computer Science',
  semester: '4th Semester',
  university: 'State University of Technology',
  targetStudyHoursDaily: 3,
  sleepTime: '23:00',
  wakeTime: '07:00',
  subjects: STUDENT_FIELDS[0].defaultSubjects,
  createdAt: new Date().toISOString()
};

export const INITIAL_TIMETABLE: TimetableClass[] = [
  {
    id: 't-1',
    subject: 'Data Structures & Algorithms',
    teacher: 'Prof. Marcus Vance',
    room: 'Hall 301',
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '10:30',
    color: '#4F46E5',
    notificationsEnabled: true
  },
  {
    id: 't-2',
    subject: 'Database Systems',
    teacher: 'Dr. Sarah Lin',
    room: 'Lab B',
    dayOfWeek: 1, // Monday
    startTime: '11:00',
    endTime: '12:30',
    color: '#0891B2',
    notificationsEnabled: true
  },
  {
    id: 't-3',
    subject: 'Operating Systems',
    teacher: 'Dr. David Miller',
    room: 'Hall 204',
    dayOfWeek: 2, // Tuesday
    startTime: '10:00',
    endTime: '11:30',
    color: '#7C3AED',
    notificationsEnabled: true
  },
  {
    id: 't-4',
    subject: 'Artificial Intelligence',
    teacher: 'Prof. Elena Rostova',
    room: 'Hall 402',
    dayOfWeek: 3, // Wednesday
    startTime: '09:30',
    endTime: '11:00',
    color: '#10B981',
    notificationsEnabled: true
  },
  {
    id: 't-5',
    subject: 'Software Architecture',
    teacher: 'Prof. Alan Turing Jr.',
    room: 'Auditorium 1',
    dayOfWeek: 4, // Thursday
    startTime: '13:00',
    endTime: '14:30',
    color: '#D97706',
    notificationsEnabled: true
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a-1',
    title: 'Balanced Binary Search Tree Implementation',
    subject: 'Data Structures & Algorithms',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'High',
    description: 'Implement AVL Tree with auto-rotation (LL, RR, LR, RL) in TypeScript/C++ with full unit test coverage.',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'a-2',
    title: 'Relational Schema Normalization (3NF & BCNF)',
    subject: 'Database Systems',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'Medium',
    description: 'Normalize the university hospital management database tables and prove lossless join decomposition.',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'a-3',
    title: 'Deadlock Detection Graph Analysis',
    subject: 'Operating Systems',
    deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'Low',
    description: 'Analyze resource allocation graphs using Banker\'s algorithm and write a 2-page summary report.',
    completed: true,
    score: '95/100',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'e-1',
    title: 'Midterm Examination: Data Structures',
    subject: 'Data Structures & Algorithms',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T09:00',
    room: 'Grand Hall A',
    targetGrade: 'A+',
    notes: 'Chapters 1 to 6: Arrays, Stacks, Queues, Trees, Heaps, and Graph Traversals.'
  },
  {
    id: 'e-2',
    title: 'Database Systems Theory Exam',
    subject: 'Database Systems',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T14:00',
    room: 'Science Complex 102',
    targetGrade: 'A',
    notes: 'Relational Algebra, SQL subqueries, Normalization, and ACID properties.'
  }
];

export const INITIAL_LECTURES: Lecture[] = [
  {
    id: 'lec-1',
    title: 'Graph Traversals: BFS & DFS In-Depth',
    subject: 'Data Structures & Algorithms',
    date: new Date().toISOString().split('T')[0],
    classwork: 'Discussed queue-based Breadth First Search and recursion-based Depth First Search. Analyzed time complexity O(V+E) and space requirements with adjacency list vs matrix representation.',
    description: 'Lecture covering graph representations, cycle detection in directed graphs, and topological sorting algorithms.',
    boardPhotos: [],
    ocrText: `## 📋 Graph Traversals\n\n### Breadth-First Search (BFS)\n- Data structure: Queue (FIFO)\n- Time Complexity: O(V + E)\n- Space Complexity: O(V)\n- Use-case: Shortest path in unweighted graphs\n\n### Depth-First Search (DFS)\n- Data structure: Call Stack / Explicit Stack\n- Time Complexity: O(V + E)\n- Space Complexity: O(V) worst case recursion tree\n- Use-case: Cycle detection, topological sort, connected components`,
    revisionData: {
      summary: 'Comprehensive review of BFS and DFS traversals, time/space trade-offs, and cycle detection in directed graphs.',
      keyPoints: [
        'BFS uses a Queue and visits nodes level by level.',
        'DFS explores as deep as possible before backtracking via recursion.',
        'Both visit vertices in O(V + E) when using adjacency lists.',
        'Topological sort requires a Directed Acyclic Graph (DAG).'
      ],
      definitions: [
        { term: 'Adjacency List', definition: 'An array of linked lists/vectors where index i stores all neighbors of vertex i.' },
        { term: 'Topological Sort', definition: 'A linear ordering of vertices such that for every directed edge u -> v, vertex u comes before v.' }
      ],
      formulas: [
        { formula: 'T(V, E) = O(|V| + |E|)', explanation: 'Total running time where V is vertices count and E is edges count.' }
      ],
      mcqs: [
        {
          question: 'Which graph traversal is best suited to find the shortest path in an unweighted graph?',
          options: ['Breadth-First Search (BFS)', 'Depth-First Search (DFS)', 'Pre-order Traversal', 'In-order Traversal'],
          correctIndex: 0,
          explanation: 'BFS explores neighbors equidistant from the source level-by-level, guaranteeing the shortest path in unweighted graphs.'
        }
      ],
      shortQuestions: [
        { question: 'Why is an adjacency list preferred over an adjacency matrix for sparse graphs?', answer: 'An adjacency list uses O(V + E) space compared to O(V²) for a matrix, saving immense memory when E << V².' }
      ],
      longQuestions: [
        { question: 'Describe how DFS is used to detect cycles in a directed graph.', answerOutline: '1. Maintain three vertex states: Unvisited (White), Processing (Gray), Completed (Black).\n2. If a neighbor is encountered in the Gray state, a back-edge exists, confirming a cycle.\n3. Return true if cycle detected, false otherwise.' }
      ],
      flashcards: [
        { front: 'BFS Data Structure', back: 'FIFO Queue' },
        { front: 'DFS Data Structure', back: 'LIFO Stack / Call Stack' }
      ],
      quickRevisionNotes: '### ⚡ Quick Notes\n- BFS -> Queue -> Shortest Path\n- DFS -> Stack -> Topological Sort & Cycles\n- Space: O(V), Time: O(V + E)'
    },
    createdAt: new Date().toISOString(),
    pointsAwarded: true
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'n-1',
    title: 'ACID Properties Cheat Sheet',
    subject: 'Database Systems',
    content: `# ACID Properties in DBMS\n\n- **Atomicity:** All transactions occur or none do ("All or nothing"). Handled by Write-Ahead Logging (WAL).\n- **Consistency:** Ensures database remains in valid state according to constraints before and after transaction.\n- **Isolation:** Concurrent transactions execute without interference (Read Uncommitted, Read Committed, Repeatable Read, Serializable).\n- **Durability:** Once committed, changes survive system crashes or power failures.`,
    tags: ['DBMS', 'Exam Prep', 'High Yield'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_GAMIFICATION: GamificationState = {
  points: 25,
  streakCount: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  savedLectureCount: 1,
  completedAssignmentCount: 1,
  passedQuizCount: 1,
  focusMinutesTotal: 45,
  badges: INITIAL_BADGES
};

class StorageService {
  // --- Profile ---
  async getProfile(): Promise<StudentProfile> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) {
      await this.saveProfile(INITIAL_PROFILE);
      return INITIAL_PROFILE;
    }
    return JSON.parse(data);
  }

  async saveProfile(profile: StudentProfile): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  // --- Timetable ---
  async getTimetable(): Promise<TimetableClass[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TIMETABLE);
    if (!data) {
      await this.saveTimetable(INITIAL_TIMETABLE);
      return INITIAL_TIMETABLE;
    }
    return JSON.parse(data);
  }

  async saveTimetable(classes: TimetableClass[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(classes));
  }

  async addTimetableClass(cls: Omit<TimetableClass, 'id'>): Promise<TimetableClass> {
    const list = await this.getTimetable();
    const newClass: TimetableClass = { ...cls, id: 'cls_' + Date.now() };
    list.push(newClass);
    await this.saveTimetable(list);
    return newClass;
  }

  async updateTimetableClass(cls: TimetableClass): Promise<void> {
    const list = await this.getTimetable();
    const index = list.findIndex(c => c.id === cls.id);
    if (index !== -1) {
      list[index] = cls;
      await this.saveTimetable(list);
    }
  }

  async deleteTimetableClass(id: string): Promise<void> {
    const list = await this.getTimetable();
    const updated = list.filter(c => c.id !== id);
    await this.saveTimetable(updated);
  }

  // --- Assignments ---
  async getAssignments(): Promise<Assignment[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    if (!data) {
      await this.saveAssignments(INITIAL_ASSIGNMENTS);
      return INITIAL_ASSIGNMENTS;
    }
    return JSON.parse(data);
  }

  async saveAssignments(assignments: Assignment[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }

  async addAssignment(assignment: Omit<Assignment, 'id' | 'createdAt'>): Promise<Assignment> {
    const list = await this.getAssignments();
    const newA: Assignment = {
      ...assignment,
      id: 'asg_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newA);
    await this.saveAssignments(list);
    return newA;
  }

  async toggleAssignmentCompleted(id: string): Promise<boolean> {
    const list = await this.getAssignments();
    const item = list.find(a => a.id === id);
    if (item) {
      item.completed = !item.completed;
      await this.saveAssignments(list);
      if (item.completed) {
        await this.recordAssignmentCompleted();
      }
      return item.completed;
    }
    return false;
  }

  async deleteAssignment(id: string): Promise<void> {
    const list = await this.getAssignments();
    const updated = list.filter(a => a.id !== id);
    await this.saveAssignments(updated);
  }

  // --- Lectures ---
  async getLectures(): Promise<Lecture[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LECTURES);
    if (!data) {
      await this.saveLectures(INITIAL_LECTURES);
      return INITIAL_LECTURES;
    }
    return JSON.parse(data);
  }

  async saveLectures(lectures: Lecture[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(lectures));
  }

  async getLectureById(id: string): Promise<Lecture | undefined> {
    const lectures = await this.getLectures();
    return lectures.find(l => l.id === id);
  }

  async addLecture(lecture: Omit<Lecture, 'id' | 'createdAt'>): Promise<{ lecture: Lecture; pointsAwarded: boolean; badgeUnlocked: boolean }> {
    const list = await this.getLectures();
    const newId = 'lec_' + Date.now();
    const newLecture: Lecture = {
      ...lecture,
      id: newId,
      createdAt: new Date().toISOString(),
      pointsAwarded: false
    };

    list.unshift(newLecture);
    await this.saveLectures(list);

    // Gamification: Award 5 points per saved lecture & Class Regular badge after 5 lectures
    const reward = await this.awardLecturePoints(newId);
    if (reward.awarded) {
      newLecture.pointsAwarded = true;
      list[0] = newLecture;
      await this.saveLectures(list);
    }

    return {
      lecture: newLecture,
      pointsAwarded: reward.awarded,
      badgeUnlocked: reward.badgeUnlocked
    };
  }

  async updateLecture(lecture: Lecture): Promise<void> {
    const list = await this.getLectures();
    const index = list.findIndex(l => l.id === lecture.id);
    if (index !== -1) {
      list[index] = lecture;
      await this.saveLectures(list);
    }
  }

  async deleteLecture(id: string): Promise<void> {
    const list = await this.getLectures();
    const updated = list.filter(l => l.id !== id);
    await this.saveLectures(updated);
  }

  // --- Notes ---
  async getNotes(): Promise<Note[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
    if (!data) {
      await this.saveNotes(INITIAL_NOTES);
      return INITIAL_NOTES;
    }
    return JSON.parse(data);
  }

  async saveNotes(notes: Note[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }

  async addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const list = await this.getNotes();
    const newNote: Note = {
      ...note,
      id: 'note_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newNote);
    await this.saveNotes(list);
    return newNote;
  }

  async updateNote(note: Note): Promise<void> {
    const list = await this.getNotes();
    const index = list.findIndex(n => n.id === note.id);
    if (index !== -1) {
      list[index] = { ...note, updatedAt: new Date().toISOString() };
      await this.saveNotes(list);
    }
  }

  async deleteNote(id: string): Promise<void> {
    const list = await this.getNotes();
    const updated = list.filter(n => n.id !== id);
    await this.saveNotes(updated);
  }

  // --- Study Materials ---
  async getMaterials(): Promise<StudyMaterial[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MATERIALS);
    return data ? JSON.parse(data) : [];
  }

  async saveMaterials(materials: StudyMaterial[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  }

  async addMaterial(item: Omit<StudyMaterial, 'id' | 'dateAdded'>): Promise<StudyMaterial> {
    const list = await this.getMaterials();
    const newMat: StudyMaterial = {
      ...item,
      id: 'mat_' + Date.now(),
      dateAdded: new Date().toISOString()
    };
    list.unshift(newMat);
    await this.saveMaterials(list);
    return newMat;
  }

  async deleteMaterial(id: string): Promise<void> {
    const list = await this.getMaterials();
    const updated = list.filter(m => m.id !== id);
    await this.saveMaterials(updated);
  }

  // --- AI Study Planner ---
  async getDailySchedule(date: string): Promise<DailySchedule | null> {
    const data = await AsyncStorage.getItem(`${STORAGE_KEYS.SCHEDULES}_${date}`);
    return data ? JSON.parse(data) : null;
  }

  async saveDailySchedule(schedule: DailySchedule): Promise<void> {
    await AsyncStorage.setItem(`${STORAGE_KEYS.SCHEDULES}_${schedule.date}`, JSON.stringify(schedule));
  }

  // --- Quizzes ---
  async getQuizHistory(): Promise<QuizResult[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.QUIZZES);
    return data ? JSON.parse(data) : [];
  }

  async saveQuizResult(result: QuizResult): Promise<void> {
    const list = await this.getQuizHistory();
    list.unshift(result);
    await AsyncStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(list));

    // Gamification check: +15 points for passing (>= 60%)
    if (result.percentage >= 60) {
      await this.recordQuizPassed(result.percentage >= 80);
    }
  }

  // --- Focus Sessions ---
  async getFocusSessions(): Promise<FocusSession[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FOCUS);
    return data ? JSON.parse(data) : [];
  }

  async logFocusSession(session: Omit<FocusSession, 'id' | 'completedAt'>): Promise<void> {
    const list = await this.getFocusSessions();
    const newSession: FocusSession = {
      ...session,
      id: 'foc_' + Date.now(),
      completedAt: new Date().toISOString()
    };
    list.unshift(newSession);
    await AsyncStorage.setItem(STORAGE_KEYS.FOCUS, JSON.stringify(list));

    // Add points: 1 point per focus minute
    if (session.durationMinutes > 0) {
      await this.recordFocusSession(session.durationMinutes);
    }
  }

  // --- Exams ---
  async getExams(): Promise<Exam[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!data) {
      await this.saveExams(INITIAL_EXAMS);
      return INITIAL_EXAMS;
    }
    return JSON.parse(data);
  }

  async saveExams(exams: Exam[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }

  async addExam(exam: Omit<Exam, 'id'>): Promise<Exam> {
    const list = await this.getExams();
    const newExam: Exam = { ...exam, id: 'exam_' + Date.now() };
    list.push(newExam);
    await this.saveExams(list);
    return newExam;
  }

  async updateExam(exam: Exam): Promise<void> {
    const list = await this.getExams();
    const idx = list.findIndex(e => e.id === exam.id);
    if (idx !== -1) {
      list[idx] = exam;
      await this.saveExams(list);
    }
  }

  async deleteExam(id: string): Promise<void> {
    const list = await this.getExams();
    const updated = list.filter(e => e.id !== id);
    await this.saveExams(updated);
  }

  // --- Study Goals ---
  async getGoals(): Promise<StudyGoal> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
    if (!data) {
      await this.saveGoals(INITIAL_GOALS);
      return INITIAL_GOALS;
    }
    return JSON.parse(data);
  }

  async saveGoals(goals: StudyGoal): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  // --- Chat Sessions ---
  async getChatSessions(): Promise<ChatSession[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
    return data ? JSON.parse(data) : [];
  }

  async saveChatSessions(sessions: ChatSession[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(sessions));
  }

  // --- Settings & Server Config ---
  async getSettings(): Promise<{ backendUrl: string; geminiApiKey: string }> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      // Default to localhost or emulator IP
      return {
        backendUrl: 'http://10.0.2.2:5000', // Standard Android emulator host
        geminiApiKey: ''
      };
    }
    return JSON.parse(data);
  }

  async saveSettings(settings: { backendUrl: string; geminiApiKey: string }): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // --- Gamification Logic with Duplicate Prevention ---
  async getGamification(): Promise<GamificationState> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GAMIFICATION);
    if (!data) {
      await AsyncStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(INITIAL_GAMIFICATION));
      return INITIAL_GAMIFICATION;
    }
    const state: GamificationState = JSON.parse(data);

    // Check streak
    const today = new Date().toISOString().split('T')[0];
    if (state.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      if (state.lastActiveDate === yesterday) {
        state.streakCount += 1;
      } else {
        // Streak lost if inactive for > 1 day
        state.streakCount = 1;
      }
      state.lastActiveDate = today;
      await AsyncStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(state));
    }

    return state;
  }

  async saveGamification(state: GamificationState): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(state));
  }

  // Award 5 points per saved lecture & Class Regular badge after 5 lectures
  async awardLecturePoints(lectureId: string): Promise<{ awarded: boolean; badgeUnlocked: boolean; totalPoints: number }> {
    const rawAwarded = await AsyncStorage.getItem(STORAGE_KEYS.AWARDED_LECTURES);
    const awardedMap: { [id: string]: boolean } = rawAwarded ? JSON.parse(rawAwarded) : { 'lec-1': true };

    if (awardedMap[lectureId]) {
      // Already awarded for this lecture ID, prevent duplicate reward
      const state = await this.getGamification();
      return { awarded: false, badgeUnlocked: false, totalPoints: state.points };
    }

    // Mark lecture as rewarded
    awardedMap[lectureId] = true;
    await AsyncStorage.setItem(STORAGE_KEYS.AWARDED_LECTURES, JSON.stringify(awardedMap));

    const state = await this.getGamification();
    state.points += 5; // +5 points per saved lecture
    state.savedLectureCount += 1;

    let badgeUnlocked = false;

    // Check "Class Regular" badge: 5 lectures
    const classRegularBadge = state.badges.find(b => b.id === 'class_regular');
    if (classRegularBadge) {
      classRegularBadge.progress = Math.min(1, state.savedLectureCount / 5);
      if (state.savedLectureCount >= 5 && !classRegularBadge.unlocked) {
        classRegularBadge.unlocked = true;
        classRegularBadge.unlockedAt = new Date().toISOString();
        state.points += 20; // Bonus points for unlocking badge
        badgeUnlocked = true;
      }
    }

    await this.saveGamification(state);
    return { awarded: true, badgeUnlocked, totalPoints: state.points };
  }

  private async recordAssignmentCompleted(): Promise<void> {
    const state = await this.getGamification();
    state.points += 10; // +10 points per completed assignment
    state.completedAssignmentCount += 1;

    const badge = state.badges.find(b => b.id === 'deadline_hero');
    if (badge) {
      badge.progress = Math.min(1, state.completedAssignmentCount / 5);
      if (state.completedAssignmentCount >= 5 && !badge.unlocked) {
        badge.unlocked = true;
        badge.unlockedAt = new Date().toISOString();
        state.points += 25;
      }
    }
    await this.saveGamification(state);
  }

  private async recordQuizPassed(isHighScore: boolean): Promise<void> {
    const state = await this.getGamification();
    state.points += 15; // +15 points per passed quiz
    state.passedQuizCount += 1;

    if (isHighScore) {
      const badge = state.badges.find(b => b.id === 'quiz_master');
      if (badge) {
        badge.progress = Math.min(1, badge.progress + 1 / 3);
        if (badge.progress >= 1 && !badge.unlocked) {
          badge.unlocked = true;
          badge.unlockedAt = new Date().toISOString();
          state.points += 30;
        }
      }
    }
    await this.saveGamification(state);
  }

  private async recordFocusSession(minutes: number): Promise<void> {
    const state = await this.getGamification();
    state.points += Math.max(1, Math.floor(minutes));
    state.focusMinutesTotal += minutes;

    const badge = state.badges.find(b => b.id === 'focus_champion');
    if (badge) {
      badge.progress = Math.min(1, state.focusMinutesTotal / 100);
      if (state.focusMinutesTotal >= 100 && !badge.unlocked) {
        badge.unlocked = true;
        badge.unlockedAt = new Date().toISOString();
        state.points += 25;
      }
    }
    await this.saveGamification(state);
  }

  // --- Backup & Restore ---
  async exportFullBackupJson(): Promise<string> {
    const profile = await this.getProfile();
    const timetable = await this.getTimetable();
    const assignments = await this.getAssignments();
    const lectures = await this.getLectures();
    const notes = await this.getNotes();
    const materials = await this.getMaterials();
    const quizzes = await this.getQuizHistory();
    const focus = await this.getFocusSessions();
    const exams = await this.getExams();
    const goals = await this.getGoals();
    const gamification = await this.getGamification();

    const fullBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile,
      timetable,
      assignments,
      lectures,
      notes,
      materials,
      quizzes,
      focus,
      exams,
      goals,
      gamification
    };

    return JSON.stringify(fullBackup, null, 2);
  }

  async importFullBackupJson(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) await this.saveProfile(data.profile);
      if (data.timetable) await this.saveTimetable(data.timetable);
      if (data.assignments) await this.saveAssignments(data.assignments);
      if (data.lectures) await this.saveLectures(data.lectures);
      if (data.notes) await this.saveNotes(data.notes);
      if (data.materials) await this.saveMaterials(data.materials);
      if (data.exams) await this.saveExams(data.exams);
      if (data.goals) await this.saveGoals(data.goals);
      if (data.gamification) await this.saveGamification(data.gamification);
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }

  async resetAllData(): Promise<void> {
    await AsyncStorage.clear();
  }
}

export const storage = new StorageService();
