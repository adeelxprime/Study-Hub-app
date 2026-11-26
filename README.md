# 🎓 StudyHub - AI Student Study Assistant Mobile App

![React Native](https://img.shields.io/badge/React_Native-0.88.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo_SDK-58.0-000020?style=for-the-badge&logo=expo&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.5_Flash_Lite-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy_Ready-black?style=for-the-badge&logo=vercel&logoColor=white)
![Android](https://img.shields.io/badge/Android-APK_Ready-3DDC84?style=for-the-badge&logo=android&logoColor=white)

A university-grade, all-in-one AI-powered student assistant application built with **React Native (Expo)**. StudyHub unifies class scheduling, deadline management, offline-first lecture notes, an automated Pomodoro focus timer, interactive quizzes, and a **discipline-aware Google Gemini AI tutor** into one seamless mobile and web experience.

---

## 👥 Project Team & Contributors

* **Adeel Ahmed** - Full-Stack Architecture, State Management, and Snack/EAS Deployment
* **Azain Butt** - UI/UX Design, 5-Tab Navigation, and Mobile-First Responsive Layout
* **Noor Muqadas** - Google Gemini 3.5 Flash-Lite AI Integration & Field-Aware Prompt Engineering
* **Azhan khan Lodhi** - Quality Assurance, Android BackHandler Security, and Unit Testing

---

## 🌟 Core App Features

1. **Authentication & Student Profiling:**
   - Sign in, account registration, password toggling, and 1-Tap Quick Demo Student Login (`student@studyhub.edu`).
   - Academic major selection across 11 disciplines (Computer Science, Software Engineering, BBA, MBBS, Electrical Engineering, etc.).

2. **Discipline-Aware Google Gemini AI Assistant:**
   - Powered by `gemini-3.5-flash-lite` via direct REST API calls.
   - Dynamic prompt injection tailors explanations, formulas, code snippets, and practice MCQs to the student's selected major.

3. **University Timetable & Schedule:**
   - Day-wise and weekly class schedules with room numbers, instructor details, and timing tags.

4. **Assignment & Task Manager:**
   - Priority tagging (High, Medium, Low), deadlines, completion checklists, and points calculation.

5. **Lecture Notes & Materials:**
   - Organized by subject with tags, timestamps, search filtering, and whiteboard photo attachments.

6. **Focus Pomodoro Timer & Gamification:**
   - 25-minute focus intervals with 5-minute break cycles.
   - Gamified streak counters (🔥), study points, and level progression badges.

7. **Mobile-First Responsive Layout:**
   - 5 core bottom navigation tabs with a top-right slide-out drawer menu (`SidebarContent`).
   - Strict Flexbox wrapping (`flexShrink: 1`) preventing any screen clipping or horizontal overflow.

---

## 🚀 How to Run Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [Expo Go](https://expo.dev/client) app installed on your Android phone (optional, for real-time mobile preview)

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/studyhub-ai-student-assistant.git
cd studyhub-ai-student-assistant

# 2. Install dependencies
npm install

# 3. Start Expo development server
npx expo start
```
* Scan the QR code using your Android camera or the **Expo Go** app to test instantly on your phone.
* Press `w` to open the web version in your desktop browser.

---

## 🌐 How to Deploy Live on Vercel (Web Version)

StudyHub is pre-configured with `vercel.json` for one-click deployment:

1. Push this project to your **GitHub** account.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `studyhub-ai-student-assistant` repository.
4. Vercel automatically detects the build command:
   * **Build Command:** `npx expo export -p web`
   * **Output Directory:** `dist`
5. Click **Deploy**. Your app will be live with a URL like `https://your-studyhub.vercel.app`!

---

## 📱 How to Build the Android APK (`.apk` File)

You can build a standalone installable Android APK file using Expo's cloud build system (EAS Build) without needing Android Studio installed:

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Log In to Expo
```bash
npx eas-cli login
```
*(If you don't have an Expo account, create one for free at [expo.dev](https://expo.dev/signup))*

### Step 3: Configure Project for EAS
```bash
npx eas-cli build:configure
```

### Step 4: Run the Android APK Build
```bash
npx eas-cli build -p android --profile preview
```

### Step 5: Download & Install APK
* EAS will build the APK on Expo's high-speed cloud servers (takes 5-10 minutes).
* When complete, the terminal provides a direct **download link** and a **QR Code**.
* Open the link on your Android phone, download the `.apk` file, and tap **Install**!

---

## 📁 Repository Structure

```
├── assets/                  # App icons, splash screens, and adaptive icons
├── src/                     # Modular components, navigation, and theme definitions
├── App.js                   # Main application code (Single-file Snack & standalone compatible)
├── App.tsx                  # TypeScript mirror of the application
├── index.ts                 # Application root entry point
├── app.json                 # Expo application configuration & native permissions
├── eas.json                 # EAS build configuration (APK build profile)
├── vercel.json              # Vercel deployment configuration
├── package.json             # NPM dependencies and project scripts
├── tsconfig.json            # TypeScript compiler configuration
└── LICENSE                  # MIT License
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
