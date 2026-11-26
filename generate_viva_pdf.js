const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>StudyHub - Presentation Viva Q&A & Libraries Guide</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 16mm 16mm 16mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 10pt;
      background: #ffffff;
    }

    .page-break {
      page-break-before: always;
    }

    /* Header Bar */
    .doc-header {
      border-bottom: 3px solid #1c2f44;
      padding-bottom: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .doc-title {
      font-size: 20pt;
      font-weight: 800;
      color: #1c2f44;
    }

    .doc-title span {
      color: #5f9bb2;
      font-style: italic;
    }

    .doc-sub {
      font-size: 10.5pt;
      color: #64748b;
      font-weight: 600;
      margin-top: 2px;
    }

    .team-badge {
      background: #e0f2fe;
      border: 1px solid #bae6fd;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 8.5pt;
      color: #0369a1;
      font-weight: 700;
      text-align: right;
    }

    /* Section Headings */
    h2 {
      font-size: 13pt;
      color: #1c2f44;
      font-weight: 800;
      border-left: 4px solid #5f9bb2;
      padding-left: 8px;
      margin-top: 14px;
      margin-bottom: 8px;
      background: #f8fafc;
      padding-top: 4px;
      padding-bottom: 4px;
      border-radius: 0 4px 4px 0;
    }

    /* Question Card */
    .qa-card {
      border: 1px solid #e2e8f0;
      background: #ffffff;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 10px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }

    .q-title {
      font-size: 10.5pt;
      font-weight: 700;
      color: #1c2f44;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .q-badge {
      background: #1c2f44;
      color: #ffffff;
      font-size: 8pt;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .ans-box {
      font-size: 9.5pt;
      color: #334155;
      background: #f8fafc;
      border-left: 3px solid #10b981;
      padding: 6px 10px;
      border-radius: 0 4px 4px 0;
      line-height: 1.45;
    }

    .ans-box strong {
      color: #0f172a;
    }

    /* Table Styles */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 9pt;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
    }

    th {
      background: #1c2f44;
      color: #ffffff;
      font-weight: 700;
      font-size: 8.5pt;
    }

    tr:nth-child(even) {
      background: #f8fafc;
    }

    .pill {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 10px;
      font-size: 8pt;
      font-weight: 700;
    }

    .pill-blue { background: #e0f2fe; color: #0369a1; }
    .pill-green { background: #dcfce7; color: #15803d; }
    .pill-purple { background: #f3e8ff; color: #7e22ce; }

    .role-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 8px 0;
    }

    .role-card {
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      padding: 8px 10px;
      border-radius: 6px;
    }

    .role-card strong {
      color: #1c2f44;
      font-size: 9.5pt;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="doc-header">
    <div>
      <div class="doc-title">study<span>hub</span> <span style="font-size: 14pt; color: #64748b; font-weight: 600;">· Viva & Technical Guide</span></div>
      <div class="doc-sub">University Project Defense · Short & To-The-Point Answers</div>
    </div>
    <div class="team-badge">
      Group Members:<br>
      Adeel Ahmed · Azain Butt<br>
      Noor Muqadas · Azhan khan Lodhi
    </div>
  </div>

  <!-- SECTION 1: LIBRARIES & TECHNOLOGIES -->
  <h2>📦 1. Libraries & Technologies Used in StudyHub</h2>
  <p style="font-size: 9pt; color: #64748b; margin-bottom: 6px;">
    StudyHub was deliberately built with a <strong>Zero-External-Bloat Architecture</strong> so it runs 100% reliably on Snack (Web & Android) without native module crashes:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Package / Library</th>
        <th style="width: 20%;">Version / Type</th>
        <th style="width: 55%;">Role in StudyHub App</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>react</strong></td>
        <td><span class="pill pill-blue">Core Dependency</span></td>
        <td>Provides component architecture and hooks: <code>useState</code> (state tracking), <code>useEffect</code> (lifecycle/sync), and <code>useMemo</code> (fast recalculations).</td>
      </tr>
      <tr>
        <td><strong>react-native</strong></td>
        <td><span class="pill pill-blue">Mobile Framework</span></td>
        <td>Core UI & Mobile APIs: <code>View</code>, <code>Text</code>, <code>ScrollView</code>, <code>TextInput</code>, <code>TouchableOpacity</code>, <code>Modal</code>, <code>Alert</code>, <code>Share</code>, <code>SafeAreaView</code>, <code>StatusBar</code>, <code>BackHandler</code>, <code>Dimensions</code>, <code>useWindowDimensions</code>.</td>
      </tr>
      <tr>
        <td><strong>@expo/vector-icons</strong></td>
        <td><span class="pill pill-green">Icon Pack</span></td>
        <td>Provides <code>Ionicons</code> for the bottom navigation bar, top-right menu drawer, AI sparkles, and module indicators.</td>
      </tr>
      <tr>
        <td><strong>Universal Safe Storage</strong></td>
        <td><span class="pill pill-purple">Custom In-House</span></td>
        <td>Custom zero-dependency storage engine combining browser <code>localStorage</code> with memory fallback. Eliminates <code>@react-native-async-storage</code> crashes on Snack!</td>
      </tr>
      <tr>
        <td><strong>Google Gemini REST API</strong></td>
        <td><span class="pill pill-green">Cloud AI Service</span></td>
        <td>Direct HTTPS calls to <code>gemini-3.5-flash-lite</code> for fast AI responses, concept explanations, and MCQ generation. (No heavy external SDKs!).</td>
      </tr>
      <tr>
        <td><strong>Babel JSX Compiler</strong></td>
        <td><span class="pill pill-blue">Build Tool</span></td>
        <td>Standard JSX compiler ensuring 100% ECMAScript module compliance with 0 syntax errors.</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 2: CORE VIVA QUESTIONS & TO-THE-POINT ANSWERS -->
  <h2>🎯 2. Top Viva & Presentation Questions (Quick Answers)</h2>

  <div class="qa-card">
    <div class="q-title"><span class="q-badge">Q1</span> Why StudyHub when apps like Notion or Google Keep already exist?</div>
    <div class="ans-box">
      <strong>Answer:</strong> Notion and Google Keep are generic note apps. StudyHub is <strong>purpose-built for university students</strong>: class timetable links directly to automatic daily study routines, exam countdowns schedule revision blocks, whiteboard photos attach to notes, and it has a <strong>discipline-aware Gemini AI tutor</strong> that generic apps lack.
    </div>
  </div>

  <div class="qa-card">
    <div class="q-title"><span class="q-badge">Q2</span> Why did you choose React Native (Expo) instead of Flutter or Java/Kotlin?</div>
    <div class="ans-box">
      <strong>Answer:</strong> <strong>"Write Once, Run Everywhere."</strong> React Native with Expo allows StudyHub to run seamlessly on Android phones and directly inside a web browser (snack.expo.dev) with a single unified codebase, saving development time and maintenance costs.
    </div>
  </div>

  <div class="qa-card">
    <div class="q-title"><span class="q-badge">Q3</span> Where is the data stored? Is there a database?</div>
    <div class="ans-box">
      <strong>Answer:</strong> In this phase, data is stored locally using <strong>Universal Safe Storage</strong> (combining web <code>localStorage</code> and mobile memory storage). It guarantees <strong>offline-first functionality</strong>, zero server lag, and allows instant testing without setting up external database credentials.
    </div>
  </div>

  <div class="qa-card">
    <div class="q-title"><span class="q-badge">Q4</span> Which AI model is used and how is it integrated?</div>
    <div class="ans-box">
      <strong>Answer:</strong> We use Google’s <strong>Gemini-3.5-Flash-Lite</strong> model via direct <strong>HTTPS REST API</strong> calls. It is optimized for ultra-fast token streaming, low latency, and lightweight JSON payloads.
    </div>
  </div>

  <div class="qa-card">
    <div class="q-title"><span class="q-badge">Q5</span> How is the AI Assistant "Discipline-Aware"?</div>
    <div class="ans-box">
      <strong>Answer:</strong> Through <strong>Prompt Engineering</strong>! When a student selects their major (e.g. Computer Science or Pre-Medical), our system prompt dynamically injects the student’s name and major into the API call so Gemini generates field-specific examples, terms, and MCQs.
    </div>
  </div>

  <div class="page-break"></div>

  <div class="doc-header">
    <div>
      <div class="doc-title">study<span>hub</span> <span style="font-size: 14pt; color: #64748b; font-weight: 600;">· Viva & Technical Guide (Page 2)</span></div>
    </div>
    <div class="team-badge">Group: Adeel, Azain, Noor, Azhan</div>
  </div>

  <div class="qa-card">
    <div class="q-title"><span class="q-badge">Q6</span> How did you handle screen adaptability between Mobile and Web?</div>
    <div class="ans-box">
      <strong>Answer:</strong> We engineered a <strong>Mobile-First Responsive Layout</strong>: 5 core tabs at the bottom, an overlay <strong>Menu Drawer in the top-right corner</strong>, and strict Flexbox constraints (<code>flexShrink: 1</code>, <code>minHeight: 0</code>) to prevent text or input boxes from overflowing the screen.
    </div>
  </div>

  <div class="qa-card">
    <div class="q-title"><span class="q-badge">Q7</span> How does the Android Hardware Back Button behave?</div>
    <div class="ans-box">
      <strong>Answer:</strong> We integrated React Native's native <strong><code>BackHandler</code> API</strong>: pressing Back first closes any open modal/drawer; if on a sub-screen, it navigates to Dashboard; and on Dashboard, it requires a <strong>double-tap within 2 seconds</strong> to prevent accidental app exit.
    </div>
  </div>

  <div class="qa-card">
    <div class="q-title"><span class="q-badge">Q8</span> What happens if the internet disconnects while chatting with the AI?</div>
    <div class="ans-box">
      <strong>Answer:</strong> The app utilizes graceful <code>try-catch</code> error handling. It alerts the student with a friendly warning (<em>"⚠️ Failed to connect. Check internet & try again"</em>) without crashing the application.
    </div>
  </div>

  <div class="qa-card">
    <div class="q-title"><span class="q-badge">Q9</span> Why is there no cloud database (like Firebase) yet?</div>
    <div class="ans-box">
      <strong>Answer:</strong> Phase 1 prioritized a <strong>zero-dependency, lightweight, offline-first client architecture</strong> that any examiner or student can run instantly on Snack without database setup. Cloud synchronization (Firebase/Supabase) is scheduled for <strong>Phase 2</strong>.
    </div>
  </div>

  <div class="qa-card">
    <div class="q-title"><span class="q-badge">Q10</span> How does StudyHub motivate students to study consistently?</div>
    <div class="ans-box">
      <strong>Answer:</strong> Through <strong>Gamification</strong>: Pomodoro study sessions earn points, daily app usage builds <strong>flame streaks (🔥)</strong>, and milestone completions award level badges (e.g., Level 1 to 5).
    </div>
  </div>

  <!-- SECTION 3: INDIVIDUAL MEMBER RESPONSIBILITIES -->
  <h2>👥 3. Member-Specific Viva Roles</h2>
  <div class="role-grid">
    <div class="role-card">
      <strong>1. Adeel Ahmed (Full-Stack & Lead)</strong><br>
      <span style="font-size: 8.5pt; color: #64748b;">• State management architecture (useState, useEffect)<br>• Centralized data updates & storage synchronization<br>• Project deployment on snack.expo.dev</span>
    </div>
    <div class="role-card">
      <strong>2. Azain Butt (UI/UX & Layout)</strong><br>
      <span style="font-size: 8.5pt; color: #64748b;">• 5-tab bottom navigation & top-right Menu drawer<br>• Text auto-wrapping (flexShrink: 1, flexWrap: wrap)<br>• Palette design: Navy (#1c2f44), Teal (#5f9bb2)</span>
    </div>
    <div class="role-card">
      <strong>3. Noor Muqadas (AI & Logic)</strong><br>
      <span style="font-size: 8.5pt; color: #64748b;">• Google Gemini 3.5 Flash-Lite REST integration<br>• Discipline-aware prompt engineering (CS, Medical, etc.)<br>• Automated 3-question MCQ quiz & study plan generator</span>
    </div>
    <div class="role-card">
      <strong>4. Azhan khan Lodhi (QA & Testing)</strong><br>
      <span style="font-size: 8.5pt; color: #64748b;">• Test cases TC-01 to TC-06 verification (100% Passed)<br>• Android BackHandler double-tap exit safety<br>• Babel AST syntax parsing (5,380+ lines, 0 errors)</span>
    </div>
  </div>

  <!-- SUMMARY BOX -->
  <div style="background: #1c2f44; color: #ffffff; padding: 10px 14px; border-radius: 6px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 9pt;">
    <div>
      <strong>Presentation Tip:</strong> Start with the <strong>"1-Tap Quick Demo Student Login"</strong> to show the working app in 5 seconds!
    </div>
    <div style="color: #5f9bb2; font-weight: 700;">
      StudyHub · Session 2025–2026
    </div>
  </div>

</body>
</html>
`;

// Write HTML file and convert to PDF using Chrome Headless
const htmlPath = path.resolve('StudyHub_Viva.html');
const pdfPath = 'C:\\Users\\DELL\\OneDrive\\Desktop\\StudyHub_Viva_Questions_and_Libraries.pdf';

fs.writeFileSync(htmlPath, htmlContent, 'utf8');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
const cmd = `"${chromePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${fileUrl}"`;

try {
  execSync(cmd);
  console.log('Viva PDF successfully generated at: ' + pdfPath);
  console.log('File size: ' + fs.statSync(pdfPath).size + ' bytes');
} catch (err) {
  console.error('Error generating Viva PDF:', err.message);
}

// Clean up temporary HTML
if (fs.existsSync(htmlPath)) {
  fs.unlinkSync(htmlPath);
}
