const fs = require('fs');
const PptxGenJS = require('pptxgenjs');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'StudyHub Team';
pptx.company = 'StudyHub Mobile';
pptx.title = 'StudyHub - Smart Student Study Assistant';

const C_NAVY = '1C2F44';
const C_TEAL = '5F9BB2';
const C_BG = 'F4F3EF';
const C_WHITE = 'FFFFFF';
const C_GRAY = '64748B';
const C_DARK = '0F172A';
const C_BORDER = 'E2E8F0';

// Helper for standard slide header
function addSlideHeader(slide, title, category = 'STUDYHUB MOBILE APP') {
  slide.background = { color: C_BG };
  
  // Category Tag
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.4,
    w: 8.4,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    color: C_TEAL,
    bold: true
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.65,
    w: 8.4,
    h: 0.5,
    fontSize: 22,
    fontFace: 'Arial',
    color: C_NAVY,
    bold: true
  });

  // Decorative Accent Line
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8,
    y: 1.15,
    w: 1.5,
    h: 0.04,
    fill: { color: C_TEAL },
    line: { color: C_TEAL }
  });
}

// ==========================================
// SLIDE 1: TITLE SLIDE (Dark Elegance)
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: C_NAVY };

  // Decorative top accent bar
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.1,
    fill: { color: C_TEAL },
    line: { color: C_TEAL }
  });

  // Badge
  slide.addText('MOBILE APPLICATION PROJECT', {
    x: 1.0,
    y: 1.3,
    w: 8.0,
    h: 0.35,
    fontSize: 12,
    fontFace: 'Arial',
    color: C_TEAL,
    bold: true
  });

  // Main Title
  slide.addText('StudyHub', {
    x: 1.0,
    y: 1.6,
    w: 8.0,
    h: 0.9,
    fontSize: 48,
    fontFace: 'Arial',
    color: C_WHITE,
    bold: true
  });

  // Subtitle
  slide.addText('Smart Student Study Assistant Android App', {
    x: 1.0,
    y: 2.5,
    w: 8.0,
    h: 0.5,
    fontSize: 22,
    fontFace: 'Arial',
    color: C_TEAL
  });

  // Description Card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.0,
    y: 3.2,
    w: 8.0,
    h: 1.6,
    fill: { color: '243B53' },
    line: { color: '334E68', width: 1 }
  });

  slide.addText(
    'A unified academic companion engineered for university students across 11 disciplines.\nFeatures daily routine planning, timetable conflict detection, assignment tracking, lecture journals with board photos, Pomodoro focus mode, performance analytics, and brain break mini-games.',
    {
      x: 1.3,
      y: 3.4,
      w: 7.4,
      h: 1.2,
      fontSize: 13,
      fontFace: 'Arial',
      color: 'D9E2EC',
      lineSpacing: 20
    }
  );

  // Footer info
  slide.addText('Built with React Native & Expo  •  Snack & Android Compatible  •  Zero-Dependency Architecture', {
    x: 1.0,
    y: 5.0,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    color: '9FB3C8'
  });
}

// ==========================================
// SLIDE 2: THE PROBLEM & SOLUTION
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Problem Statement vs. StudyHub Solution');

  // Left Card: The Challenge
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.4,
    w: 4.0,
    h: 3.6,
    fill: { color: C_WHITE },
    line: { color: 'FCA5A5', width: 1.5 }
  });

  slide.addText('⚠️ The Student Dilemma', {
    x: 1.0,
    y: 1.6,
    w: 3.6,
    h: 0.4,
    fontSize: 16,
    fontFace: 'Arial',
    color: 'DC2626',
    bold: true
  });

  slide.addText(
    [
      { text: '• Fragmented Tools: ', options: { bold: true } },
      { text: 'Students use 5+ different apps for timetable, to-dos, notes, and timers.\n\n' },
      { text: '• Burnout & Overload: ', options: { bold: true } },
      { text: 'Poor study-sleep balance leads to exam fatigue.\n\n' },
      { text: '• Lost Lecture Content: ', options: { bold: true } },
      { text: 'Whiteboard photos get lost in phone galleries.\n\n' },
      { text: '• No Discipline Context: ', options: { bold: true } },
      { text: 'Generic productivity apps lack degree-specific relevance.' }
    ],
    {
      x: 1.0,
      y: 2.1,
      w: 3.6,
      h: 2.7,
      fontSize: 11,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 16
    }
  );

  // Right Card: The Solution
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.2,
    y: 1.4,
    w: 4.0,
    h: 3.6,
    fill: { color: C_WHITE },
    line: { color: C_TEAL, width: 1.5 }
  });

  slide.addText('✨ The StudyHub Solution', {
    x: 5.4,
    y: 1.6,
    w: 3.6,
    h: 0.4,
    fontSize: 16,
    fontFace: 'Arial',
    color: C_TEAL,
    bold: true
  });

  slide.addText(
    [
      { text: '• Unified Ecosystem: ', options: { bold: true } },
      { text: 'Everything managed under one mobile dashboard.\n\n' },
      { text: '• Smart Routine Planner: ', options: { bold: true } },
      { text: 'Auto-balances class hours, free time, and 8h sleep.\n\n' },
      { text: '• Board Photo Journal: ', options: { bold: true } },
      { text: 'Logs notes with up to 6 zoomable board attachments.\n\n' },
      { text: '• 11 Field Specializations: ', options: { bold: true } },
      { text: 'Tailored quizzes, tags, and curriculum subjects.' }
    ],
    {
      x: 5.4,
      y: 2.1,
      w: 3.6,
      h: 2.7,
      fontSize: 11,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 16
    }
  );
}

// ==========================================
// SLIDE 3: SYSTEM ARCHITECTURE
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'System Architecture & Technical Stack');

  const techItems = [
    { title: 'Core Framework', desc: 'React Native & React 19', sub: 'Cross-platform native mobile foundation with responsive layouts.' },
    { title: 'Expo Toolchain', desc: 'Expo SDK 54 / 58', sub: 'Fast Metro bundler, EAS cloud builds, and universal runtime.' },
    { title: 'Zero-Dependency Snack', desc: 'Pure JS + Built-in Modules', sub: 'Zero external crashes on snack.expo.dev; uses built-in StatusBar & Share.' },
    { title: 'Data Persistence', desc: 'Adaptive Storage Engine', sub: 'localStorage on Web preview with memory fallback on native clients.' },
    { title: 'Android Lifecycle', desc: 'Hardware BackHandler', sub: 'Intercepts back presses, manages modal stacks, prevents accidental app quits.' },
    { title: 'Design System', desc: 'StudyHub Theme (#f4f3ef)', sub: 'Navy #1c2f44, Teal #5f9bb2, Slate Gray #64748b, and full Dark Mode.' }
  ];

  techItems.forEach((item, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 0.8 + col * 2.85;
    const y = 1.4 + row * 1.8;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 2.65,
      h: 1.6,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1 }
    });

    slide.addText(item.title.toUpperCase(), {
      x: x + 0.15,
      y: y + 0.15,
      w: 2.35,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      color: C_TEAL,
      bold: true
    });

    slide.addText(item.desc, {
      x: x + 0.15,
      y: y + 0.4,
      w: 2.35,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      color: C_NAVY,
      bold: true
    });

    slide.addText(item.sub, {
      x: x + 0.15,
      y: y + 0.8,
      w: 2.35,
      h: 0.7,
      fontSize: 10,
      fontFace: 'Arial',
      color: C_GRAY,
      lineSpacing: 14
    });
  });
}

// ==========================================
// SLIDE 4: 11 ACADEMIC DISCIPLINES
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, '11 Tailored Academic Fields & Curricula');

  const fields = [
    { name: 'Computer Science', icon: '💻', topics: 'DSA, Operating Systems, DBMS' },
    { name: 'Software Eng.', icon: '⚙️', topics: 'Software Design, Testing, Agile' },
    { name: 'BBA (Business)', icon: '📊', topics: 'Finance, Marketing, Management' },
    { name: 'MBBS (Medicine)', icon: '🩺', topics: 'Anatomy, Physiology, Pathology' },
    { name: 'Pharmacy', icon: '💊', topics: 'Medicinal Chem, Pharmacokinetics' },
    { name: 'Nursing', icon: '🏥', topics: 'Patient Care, Clinical Ethics' },
    { name: 'Electrical Eng.', icon: '⚡', topics: 'Circuits, Electromagnetics, Signals' },
    { name: 'Mechanical Eng.', icon: '🔧', topics: 'Thermodynamics, Fluid Mechanics' },
    { name: 'Civil Engineering', icon: '🏗️', topics: 'Structures, Geotechnical, Survey' },
    { name: 'Physics', icon: '⚛️', topics: 'Quantum Mechanics, Optics, Electrodynamics' },
    { name: 'Chemistry', icon: '🧪', topics: 'Organic, Inorganic, Physical Chem' }
  ];

  fields.forEach((f, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const x = 0.8 + col * 2.15;
    const y = 1.4 + row * 1.25;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 2.0,
      h: 1.1,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1 }
    });

    slide.addText(`${f.icon} ${f.name}`, {
      x: x + 0.1,
      y: y + 0.1,
      w: 1.8,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Arial',
      color: C_NAVY,
      bold: true
    });

    slide.addText(f.topics, {
      x: x + 0.1,
      y: y + 0.45,
      w: 1.8,
      h: 0.55,
      fontSize: 9,
      fontFace: 'Arial',
      color: C_GRAY
    });
  });

  // Callout box on bottom right
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8 + 3 * 2.15,
    y: 1.4 + 2 * 1.25,
    w: 2.0,
    h: 1.1,
    fill: { color: C_NAVY },
    line: { color: C_TEAL, width: 1 }
  });

  slide.addText('🎯 Field Quiz Bank', {
    x: 0.8 + 3 * 2.15 + 0.1,
    y: 1.4 + 2 * 1.25 + 0.15,
    w: 1.8,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    color: C_TEAL,
    bold: true
  });

  slide.addText('132+ curated questions customized for each discipline.', {
    x: 0.8 + 3 * 2.15 + 0.1,
    y: 1.4 + 2 * 1.25 + 0.45,
    w: 1.8,
    h: 0.55,
    fontSize: 9,
    fontFace: 'Arial',
    color: 'D9E2EC'
  });
}

// ==========================================
// SLIDE 5: DASHBOARD & ROUTINE PLANNER
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Smart Dashboard & Daily Routine Planner');

  // Left Card: Dashboard
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.4,
    w: 4.1,
    h: 3.6,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 }
  });

  slide.addText('📱 Centralized Student Dashboard', {
    x: 1.0,
    y: 1.6,
    w: 3.7,
    h: 0.35,
    fontSize: 15,
    fontFace: 'Arial',
    color: C_NAVY,
    bold: true
  });

  slide.addText(
    [
      { text: '• Student Profile & Discipline: ', options: { bold: true } },
      { text: 'Shows name, degree program, and quick switch selector.\n\n' },
      { text: '• Streak & Level Engine: ', options: { bold: true } },
      { text: 'Active daily study streak with flame icon (🔥) and calculated level.\n\n' },
      { text: '• Quick Stat Cards: ', options: { bold: true } },
      { text: 'Today study time vs. goal, upcoming classes, and pending tasks count.\n\n' },
      { text: '• Next Immediate Task: ', options: { bold: true } },
      { text: 'Dynamic banner surfacing what the student needs to attend or study next.' }
    ],
    {
      x: 1.0,
      y: 2.05,
      w: 3.7,
      h: 2.8,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 16
    }
  );

  // Right Card: Planner
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.1,
    y: 1.4,
    w: 4.1,
    h: 3.6,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 }
  });

  slide.addText('🗓️ Automated Daily Routine Planner', {
    x: 5.3,
    y: 1.6,
    w: 3.7,
    h: 0.35,
    fontSize: 15,
    fontFace: 'Arial',
    color: C_NAVY,
    bold: true
  });

  slide.addText(
    [
      { text: '• Auto & Manual Modes: ', options: { bold: true } },
      { text: 'Switch between algorithmic generation and custom item scheduling.\n\n' },
      { text: '• University & Sleep Calculation: ', options: { bold: true } },
      { text: 'Input university start/end times + 8-hour sleep requirement.\n\n' },
      { text: '• Commute & Dinner Blocks: ', options: { bold: true } },
      { text: 'Automatically reserves realistic transit and meal breaks.\n\n' },
      { text: '• Checkable Completion: ', options: { bold: true } },
      { text: 'Interactive routine checkmarks sync live with daily analytics.' }
    ],
    {
      x: 5.3,
      y: 2.05,
      w: 3.7,
      h: 2.8,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 16
    }
  );
}

// ==========================================
// SLIDE 6: TIMETABLE & ASSIGNMENTS
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Academic Scheduling & Coursework Tracking');

  // Box 1: Timetable
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.4,
    w: 4.1,
    h: 3.6,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 }
  });

  slide.addText('📅 University Timetable & Calendar', {
    x: 1.0,
    y: 1.6,
    w: 3.7,
    h: 0.35,
    fontSize: 15,
    fontFace: 'Arial',
    color: C_NAVY,
    bold: true
  });

  slide.addText(
    [
      { text: '• Dual Views: ', options: { bold: true } },
      { text: 'Toggle seamlessly between Daily Timeline and Monthly Calendar.\n\n' },
      { text: '• Conflict Warning Engine: ', options: { bold: true } },
      { text: 'Real-time alert if two scheduled classes overlap in time.\n\n' },
      { text: '• Subject Palette: ', options: { bold: true } },
      { text: '8 distinct color codes for subjects, teachers, and room numbers.\n\n' },
      { text: '• Calendar Indicators: ', options: { bold: true } },
      { text: 'Visual colored dots indicate days with scheduled lectures.' }
    ],
    {
      x: 1.0,
      y: 2.05,
      w: 3.7,
      h: 2.8,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 16
    }
  );

  // Box 2: Assignments
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.1,
    y: 1.4,
    w: 4.1,
    h: 3.6,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 }
  });

  slide.addText('📝 Assignments & Task Management', {
    x: 5.3,
    y: 1.6,
    w: 3.7,
    h: 0.35,
    fontSize: 15,
    fontFace: 'Arial',
    color: C_NAVY,
    bold: true
  });

  slide.addText(
    [
      { text: '• Priority Badges: ', options: { bold: true } },
      { text: 'Categorize tasks by High (Red), Medium (Amber), or Low (Slate).\n\n' },
      { text: '• Deadline & Overdue Alerts: ', options: { bold: true } },
      { text: 'Automated flags highlighting overdue or urgent deadlines.\n\n' },
      { text: '• Filter Tabs: ', options: { bold: true } },
      { text: 'Filter quickly by All, Pending, or Completed tasks.\n\n' },
      { text: '• Report Export: ', options: { bold: true } },
      { text: 'One-click shareable formatted report of all pending coursework.' }
    ],
    {
      x: 5.3,
      y: 2.05,
      w: 3.7,
      h: 2.8,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 16
    }
  );
}

// ==========================================
// SLIDE 7: LECTURE JOURNAL & NOTES
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Lecture Journal & Digital Note Manager');

  // Box 1: Lecture Journal
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.4,
    w: 4.1,
    h: 3.6,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 }
  });

  slide.addText('📸 Lecture Journal with Board Photos', {
    x: 1.0,
    y: 1.6,
    w: 3.7,
    h: 0.35,
    fontSize: 15,
    fontFace: 'Arial',
    color: C_NAVY,
    bold: true
  });

  slide.addText(
    [
      { text: '• Board Photo Attachments: ', options: { bold: true } },
      { text: 'Attach up to 6 classroom whiteboard photos per lecture.\n\n' },
      { text: '• Full-Screen Zoom Modal: ', options: { bold: true } },
      { text: 'Tap any photo thumbnail to inspect equations and diagrams in detail.\n\n' },
      { text: '• Gamification Incentive: ', options: { bold: true } },
      { text: 'Earn +5 points per logged lecture, unlocking Class Regular badge.\n\n' },
      { text: '• Comprehensive Classwork: ', options: { bold: true } },
      { text: 'Save lecture titles, subjects, dates, and detailed explanations.' }
    ],
    {
      x: 1.0,
      y: 2.05,
      w: 3.7,
      h: 2.8,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 16
    }
  );

  // Box 2: Notes
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.1,
    y: 1.4,
    w: 4.1,
    h: 3.6,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 }
  });

  slide.addText('📖 Quick Notes & Study Materials', {
    x: 5.3,
    y: 1.6,
    w: 3.7,
    h: 0.35,
    fontSize: 15,
    fontFace: 'Arial',
    color: C_NAVY,
    bold: true
  });

  slide.addText(
    [
      { text: '• Real-Time Search: ', options: { bold: true } },
      { text: 'Instant search across note titles and content bodies.\n\n' },
      { text: '• Subject Organization: ', options: { bold: true } },
      { text: 'Categorize notes by university subject with timestamps.\n\n' },
      { text: '• Study Materials Hub: ', options: { bold: true } },
      { text: 'Store and view curriculum PDFs, reference docs, and links.\n\n' },
      { text: '• Formatted Sharing: ', options: { bold: true } },
      { text: 'Export individual notes or entire collections with one tap.' }
    ],
    {
      x: 5.3,
      y: 2.05,
      w: 3.7,
      h: 2.8,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 16
    }
  );
}

// ==========================================
// SLIDE 8: AI STUDY ASSISTANT (GEMINI POWERED)
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'AI Study Assistant (Google Gemini Powered)');

  // Box 1: Context-Aware Intelligence
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.4,
    w: 4.1,
    h: 3.6,
    fill: { color: C_WHITE },
    line: { color: C_TEAL, width: 1.5 }
  });

  slide.addText('🤖 Degree-Specific Intelligence', {
    x: 1.0,
    y: 1.6,
    w: 3.7,
    h: 0.35,
    fontSize: 15,
    fontFace: 'Arial',
    color: C_TEAL,
    bold: true
  });

  slide.addText(
    [
      { text: '• Degree Major Awareness: ', options: { bold: true } },
      { text: 'Automatically personalizes explanations for student discipline (CS, MBBS, BBA, Engineering, etc.).\n\n' },
      { text: '• Concept & Formula Deep Dive: ', options: { bold: true } },
      { text: 'Provides structured bullet points, step-by-step math derivations, and code snippets.\n\n' },
      { text: '• Lecture Summarizer: ', options: { bold: true } },
      { text: 'Condenses lengthy classroom notes and board logs into high-yield revision summaries.\n\n' },
      { text: '• Interactive Chat Memory: ', options: { bold: true } },
      { text: 'Multi-turn conversation retains question context for seamless follow-up doubts.' }
    ],
    {
      x: 1.0,
      y: 2.05,
      w: 3.7,
      h: 2.8,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 16
    }
  );

  // Box 2: Quick Prompts & Architecture
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.1,
    y: 1.4,
    w: 4.1,
    h: 3.6,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 }
  });

  slide.addText('⚡ Quick Chips & Obfuscated Security', {
    x: 5.3,
    y: 1.6,
    w: 3.7,
    h: 0.35,
    fontSize: 15,
    fontFace: 'Arial',
    color: C_NAVY,
    bold: true
  });

  slide.addText(
    [
      { text: '• 1-Tap Quick Action Chips: ', options: { bold: true } },
      { text: 'One-click prompts: "Explain Topic", "Generate 3 MCQs", "1-Week Revision Plan", "Key Formulas".\n\n' },
      { text: '• Permanent Obfuscated Key: ', options: { bold: true } },
      { text: 'Google Gemini key is encoded and safely embedded; zero plain-text exposure in Snack editor.\n\n' },
      { text: '• Ultra-Fast Model Cascade: ', options: { bold: true } },
      { text: 'Queries Gemini 3.5 Flash Lite with automatic fallback to Flash for lightning-fast answers.\n\n' },
      { text: '• Zero-Dependency Integration: ', options: { bold: true } },
      { text: 'Uses native fetch() — zero missing module errors on snack.expo.dev!' }
    ],
    {
      x: 5.3,
      y: 2.05,
      w: 3.7,
      h: 2.8,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 16
    }
  );
}

// ==========================================
// SLIDE 9: FOCUS MODE & ANALYTICS
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Focus Mode (Pomodoro) & Performance Analytics');

  // Box 1: Focus Mode
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.4,
    w: 4.1,
    h: 3.6,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 }
  });

  slide.addText('⏱️ Pomodoro Focus Timer', {
    x: 1.0,
    y: 1.6,
    w: 3.7,
    h: 0.35,
    fontSize: 15,
    fontFace: 'Arial',
    color: C_NAVY,
    bold: true
  });

  slide.addText(
    [
      { text: '• Scientifically Proven Rhythm: ', options: { bold: true } },
      { text: '25-minute focus intervals followed by 5-minute restorative breaks.\n\n' },
      { text: '• Long Break Support: ', options: { bold: true } },
      { text: '15-minute extended break after completing 4 consecutive intervals.\n\n' },
      { text: '• Distraction-Free Display: ', options: { bold: true } },
      { text: 'Bold countdown timer with quick Play, Pause, and Reset controls.\n\n' },
      { text: '• Auto Session Logging: ', options: { bold: true } },
      { text: 'Focus minutes automatically accrue towards daily and weekly goals.' }
    ],
    {
      x: 1.0,
      y: 2.05,
      w: 3.7,
      h: 2.8,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 16
    }
  );

  // Box 2: Analytics
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.1,
    y: 1.4,
    w: 4.1,
    h: 3.6,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 }
  });

  slide.addText('📊 Insights & Weak Subject Detection', {
    x: 5.3,
    y: 1.6,
    w: 3.7,
    h: 0.35,
    fontSize: 15,
    fontFace: 'Arial',
    color: C_NAVY,
    bold: true
  });

  slide.addText(
    [
      { text: '• 7-Day Study Bar Chart: ', options: { bold: true } },
      { text: 'Visual weekly breakdown of completed study hours day-by-day.\n\n' },
      { text: '• Subject Score Distribution: ', options: { bold: true } },
      { text: 'Tracks percentage mastery across all academic subjects.\n\n' },
      { text: '• Weak Subject Flagging: ', options: { bold: true } },
      { text: 'Highlights subjects scoring under 60% with targeted alerts.\n\n' },
      { text: '• Exam Readiness: ', options: { bold: true } },
      { text: 'Combines quiz scores, logged lectures, and remaining exam days.' }
    ],
    {
      x: 5.3,
      y: 2.05,
      w: 3.7,
      h: 2.8,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 16
    }
  );
}

// ==========================================
// SLIDE 9: GAMIFICATION & MINI-GAMES
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Gamification System & Brain Break Games');

  // Left: 12 Badges & Streaks
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.4,
    w: 4.1,
    h: 3.6,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 }
  });

  slide.addText('🏆 12 Achievement Badges', {
    x: 1.0,
    y: 1.6,
    w: 3.7,
    h: 0.35,
    fontSize: 15,
    fontFace: 'Arial',
    color: C_NAVY,
    bold: true
  });

  slide.addText(
    [
      { text: '• Daily Streak (🔥): ', options: { bold: true } },
      { text: 'Tracks consecutive days of academic study.\n\n' },
      { text: '• Badges Unlocked: \n', options: { bold: true } },
      { text: '🌱 First Step · 🚀 Fast Learner · 📚 Class Regular (5 lectures)\n⚡ Streak Master (7 days) · 🎯 Quiz Champ · 🦉 Night Owl\n📖 Bookworm · 🏆 High Achiever · ⏳ Focus Master · and more.\n\n' },
      { text: '• Real-Time Toast Notifications: ', options: { bold: true } },
      { text: 'Celebratory popups trigger the moment a badge criteria is met.' }
    ],
    {
      x: 1.0,
      y: 2.05,
      w: 3.7,
      h: 2.8,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 16
    }
  );

  // Right: 3 Mini-Games
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.1,
    y: 1.4,
    w: 4.1,
    h: 3.6,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 }
  });

  slide.addText('🎮 Brain Break Mini-Games', {
    x: 5.3,
    y: 1.6,
    w: 3.7,
    h: 0.35,
    fontSize: 15,
    fontFace: 'Arial',
    color: C_NAVY,
    bold: true
  });

  slide.addText(
    [
      { text: '1. Sliding Tile Puzzle: \n', options: { bold: true } },
      { text: 'Classic numbered grid puzzle with 3x3 and 4x4 difficulty modes and real-time move counter.\n\n' },
      { text: '2. Memory Card Match: \n', options: { bold: true } },
      { text: '16-card emoji matching game testing working memory and visual recall under 5 minutes.\n\n' },
      { text: '3. Quick Curriculum Quiz: \n', options: { bold: true } },
      { text: '12 field-specific multiple choice questions with immediate scoring and explanations.' }
    ],
    {
      x: 5.3,
      y: 2.05,
      w: 3.7,
      h: 2.8,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 16
    }
  );
}

// ==========================================
// SLIDE 10: ANDROID BACK BUTTON & LIFECYCLE
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Android Back Navigation & App Stability');

  const lifecycleCards = [
    {
      step: '1. MODAL PRIORITY',
      icon: '🛡️',
      title: 'Close Active Popups',
      desc: 'If Search, Add Assignment, Add Lecture, Photo Zoom, or Field Selector is open, hardware back closes ONLY the popup.'
    },
    {
      step: '2. SUB-SCREEN NAVIGATION',
      icon: '↩️',
      title: 'Return to Dashboard',
      desc: 'Pressing back on Lectures, Exams, Materials, Focus, Games, or Settings returns students safely to the Home Dashboard.'
    },
    {
      step: '3. TAB STACK HANDLING',
      icon: '📱',
      title: 'Tab Navigation Stack',
      desc: 'If user is on Timetable, Tasks, or Notes tab, pressing back navigates directly to the Home Dashboard without exiting.'
    },
    {
      step: '4. EXIT SAFEGUARD',
      icon: '🔒',
      title: 'Double-Tap Exit Toast',
      desc: 'On Dashboard, back press displays "Press BACK again to exit". App only exits if tapped twice within 2s, preventing data loss.'
    }
  ];

  lifecycleCards.forEach((c, idx) => {
    const x = 0.8 + idx * 2.15;
    const y = 1.6;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 2.0,
      h: 3.3,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1 }
    });

    slide.addText(c.step, {
      x: x + 0.1,
      y: y + 0.2,
      w: 1.8,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      color: C_TEAL,
      bold: true
    });

    slide.addText(`${c.icon}`, {
      x: x + 0.1,
      y: y + 0.5,
      w: 1.8,
      h: 0.5,
      fontSize: 26,
      fontFace: 'Arial'
    });

    slide.addText(c.title, {
      x: x + 0.1,
      y: y + 1.1,
      w: 1.8,
      h: 0.45,
      fontSize: 12,
      fontFace: 'Arial',
      color: C_NAVY,
      bold: true
    });

    slide.addText(c.desc, {
      x: x + 0.1,
      y: y + 1.6,
      w: 1.8,
      h: 1.5,
      fontSize: 10,
      fontFace: 'Arial',
      color: C_GRAY,
      lineSpacing: 15
    });
  });
}

// ==========================================
// SLIDE 11: HOW TO RUN & BUILD APK
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Deployment & Execution Guide');

  const guides = [
    {
      title: 'A. Run on snack.expo.dev',
      badge: 'INSTANT WEB & ANDROID',
      steps: [
        '1. Open snack.expo.dev in your browser.',
        '2. Open StudyHub_Snack_Code.txt from your Desktop.',
        '3. Select all (Ctrl+A) and copy (Ctrl+C).',
        '4. Paste (Ctrl+V) into App.js in Snack.',
        '5. Enjoy full app preview on Android or Web with 0 errors!'
      ]
    },
    {
      title: 'B. Local Metro Dev Server',
      badge: 'DEVELOPER WORKSPACE',
      steps: [
        '1. Open terminal in project root.',
        '2. Run: npx expo start',
        '3. Press "a" to launch on Android emulator, or',
        '4. Scan the QR code using the Expo Go mobile app.',
        '5. Full hot-reloading enabled for active development.'
      ]
    },
    {
      title: 'C. Build Standalone Android APK',
      badge: 'PRODUCTION INSTALLABLE',
      steps: [
        '1. Configure EAS CLI: npx eas-cli login',
        '2. Configure build profile in eas.json.',
        '3. Run: eas build -p android --profile preview',
        '4. EAS builds the APK in the cloud.',
        '5. Download and install the .apk on any Android phone!'
      ]
    }
  ];

  guides.forEach((g, idx) => {
    const x = 0.8 + idx * 2.85;
    const y = 1.4;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 2.65,
      h: 3.6,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1 }
    });

    slide.addText(g.badge, {
      x: x + 0.15,
      y: y + 0.2,
      w: 2.35,
      h: 0.25,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: C_TEAL,
      bold: true
    });

    slide.addText(g.title, {
      x: x + 0.15,
      y: y + 0.45,
      w: 2.35,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Arial',
      color: C_NAVY,
      bold: true
    });

    slide.addText(g.steps.join('\n\n'), {
      x: x + 0.15,
      y: y + 0.95,
      w: 2.35,
      h: 2.5,
      fontSize: 10,
      fontFace: 'Arial',
      color: C_DARK,
      lineSpacing: 15
    });
  });
}

// ==========================================
// SLIDE 12: CONCLUSION & SUMMARY (Dark Theme)
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: C_NAVY };

  // Decorative top accent bar
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.1,
    fill: { color: C_TEAL },
    line: { color: C_TEAL }
  });

  slide.addText('PROJECT SUMMARY & CONCLUSION', {
    x: 1.0,
    y: 1.0,
    w: 8.0,
    h: 0.35,
    fontSize: 12,
    fontFace: 'Arial',
    color: C_TEAL,
    bold: true
  });

  slide.addText('Empowering University Students Worldwide', {
    x: 1.0,
    y: 1.35,
    w: 8.0,
    h: 0.6,
    fontSize: 32,
    fontFace: 'Arial',
    color: C_WHITE,
    bold: true
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.0,
    y: 2.2,
    w: 8.0,
    h: 2.3,
    fill: { color: '243B53' },
    line: { color: '334E68', width: 1 }
  });

  slide.addText(
    [
      { text: '✓ Complete Feature Parity: ', options: { bold: true, color: C_WHITE } },
      { text: '100% of studyhub features implemented: Timetable, Planner, Notes, Assignments, Quizzes, Focus Mode & Games.\n\n', options: { color: 'D9E2EC' } },
      { text: '✓ 11 Academic Disciplines: ', options: { bold: true, color: C_WHITE } },
      { text: 'Specialized support for Engineering, Medical, Business, and Science students.\n\n', options: { color: 'D9E2EC' } },
      { text: '✓ Snack & Mobile Native: ', options: { bold: true, color: C_WHITE } },
      { text: 'Zero-dependency design running flawlessly in Snack preview and on physical Android devices.\n\n', options: { color: 'D9E2EC' } },
      { text: '✓ Resilient Navigation: ', options: { bold: true, color: C_WHITE } },
      { text: 'Hardware BackHandler guarantees smooth modal dismissals and prevents accidental exits.', options: { color: 'D9E2EC' } }
    ],
    {
      x: 1.3,
      y: 2.4,
      w: 7.4,
      h: 1.9,
      fontSize: 11,
      fontFace: 'Arial',
      lineSpacing: 18
    }
  );

  slide.addText('Thank You!  •  Questions & Feedback Welcome  •  StudyHub 2026', {
    x: 1.0,
    y: 4.8,
    w: 8.0,
    h: 0.4,
    fontSize: 13,
    fontFace: 'Arial',
    color: C_TEAL,
    align: 'center',
    bold: true
  });
}

// Write to Desktop
const outputPath = 'C:\\Users\\DELL\\OneDrive\\Desktop\\StudyHub_Presentation.pptx';
pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log('PowerPoint Presentation successfully created at: ' + outputPath);
}).catch(err => {
  console.error('Error generating pptx:', err);
});
