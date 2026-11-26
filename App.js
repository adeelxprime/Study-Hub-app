import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Share,
  Dimensions,
  SafeAreaView,
  Image,
  StatusBar,
  BackHandler,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Universal Safe Storage (Memory + LocalStorage fallback for Snack & Web)
const _memStore = {};
const Storage = {
  getItem: async (k) => {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(k);
        if (val !== null) return val;
      }
    } catch (e) {}
    return _memStore[k] || null;
  },
  setItem: async (k, v) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(k, v);
      }
    } catch (e) {}
    _memStore[k] = v;
  },
  clear: async () => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
    } catch (e) {}
    for (let key in _memStore) delete _memStore[key];
  }
};
const AsyncStorage = Storage;

// Universal Share / Export (Zero external dependencies)
const safeExportPDF = async (title, htmlContent, fallbackText) => {
  try {
    const message = (title ? title + '\n\n' : '') + (fallbackText || '');
    await Share.share({ title, message });
  } catch (err) {
    Alert.alert(title, (fallbackText || '').slice(0, 300));
  }
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==========================================
// GOOGLE GEMINI AI CONFIGURATION (OBFUSCATED)
// ==========================================
const _DEFAULT_AI_KEY = (function() {
  const _enc = 'QVEuQWI4Uk42TE00cU5OUm9EUFEycVdKSU00OVUwdWE5cXlQSW1zQVF5WWJSODVqOUdoSXc=';
  try {
    if (typeof atob !== 'undefined') return atob(_enc);
    if (typeof Buffer !== 'undefined') return Buffer.from(_enc, 'base64').toString('utf-8');
  } catch (e) {}
  return ['AQ', '.', 'Ab8RN6LM4q', 'NNRoDPQ2qWJ', 'IM49U0ua9qyP', 'ImsAQyYbR85', 'j9GhIw'].join('');
})();

const callGeminiAI = async (messagesHistory, studentProfile, studentField, customKey) => {
  const apiKey = (customKey && customKey.trim()) ? customKey.trim() : _DEFAULT_AI_KEY;
  const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
  
  const field = studentField || studentProfile?.cls || 'General University Studies';
  const name = studentProfile?.name || 'Student';
  
  const systemPrompt = `You are StudyHub AI, an intelligent, empathetic, and expert university academic assistant for ${name}, currently studying ${field}.
Your mission is to help them understand concepts deeply, prepare for exams, summarize lecture content, and solve problems.
Guidelines:
- If asked to explain a topic, provide clear explanations with structured bullet points, key definitions, and real-world examples.
- If asked for formulas or calculations, explain step-by-step.
- If asked for quizzes, provide 3 challenging multiple-choice questions with answer keys and concise explanations.
- Tailor all examples, analogies, and context specifically to the field of ${field}.
- Keep responses encouraging, clear, and focused on student academic success.`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemPrompt + '\n\nPlease confirm you are ready.' }]
    },
    {
      role: 'model',
      parts: [{ text: `Understood! I am StudyHub AI, ready to assist ${name} in ${field}. What would you like to study or revise today?` }]
    }
  ];

  messagesHistory.forEach(m => {
    contents.push({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    });
  });

  let lastError = null;
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastError = errJson?.error?.message || `HTTP ${response.status}`;
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  throw new Error(lastError || 'Could not connect to Gemini AI. Please check internet connection.');
};


export const ACADEMIC_FIELDS = [
    ['Computer Science', '💻'],
    ['BBA', '📊'],
    ['Software Engineering', '🛠️'],
    ['Chemistry', '⚗️'],
    ['Physics', '⚛️'],
    ['Pharmacy', '💊'],
    ['Nursing', '🩺'],
    ['Civil Engineering', '🏗️'],
    ['Mechanical Engineering', '⚙️'],
    ['Electrical Engineering', '⚡'],
    ['MBBS', '🫀'],
];
export const getFieldIcon = (field) => {
    const found = ACADEMIC_FIELDS.find(([name]) => name === field);
    return found ? found[1] : '🎓';
};
export const SUBJECT_PALETTE = [
    '#5f9bb2', '#6366f1', '#06b6d4', '#10b981',
    '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6',
];
export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const QUIZ_BANK = {
    'Computer Science': [
        'Which data structure uses FIFO order?|Queue|Stack|Tree|Graph',
        'Time complexity of binary search?|O(log n)|O(n)|O(n²)|O(1)',
        'Which OSI layer handles routing?|Network|Transport|Session|Data link',
        'SQL command to remove a whole table?|DROP|DELETE|REMOVE|CUT',
        'What does RAM stand for?|Random Access Memory|Read Active Memory|Rapid Access Module|Run Allocated Memory',
        'Which sort is divide-and-conquer with O(n log n)?|Merge sort|Bubble sort|Insertion sort|Selection sort',
        'Which protocol loads web pages securely?|HTTPS|FTP|SMTP|Telnet',
        'A stack follows which principle?|LIFO|FIFO|Priority order|Random order',
        'Which is NOT an OOP pillar?|Compilation|Encapsulation|Inheritance|Polymorphism',
        'Binary 1010 equals which decimal number?|10|5|12|8',
        'Which key uniquely identifies each row?|Primary key|Foreign key|Backup key|Sort key',
        'Which language styles web pages?|CSS|SQL|Python|Java',
    ],
    'BBA': [
        'What does ROI stand for?|Return on Investment|Rate of Income|Return on Inventory|Ratio of Interest',
        'Accounting equation?|Assets = Liabilities + Equity|Assets = Liabilities - Equity|Equity = Assets + Liabilities|Liabilities = Assets + Equity',
        'The 4 Ps of marketing are…|Product, Price, Place, Promotion|Product, Profit, People, Plan|Price, Plan, Power, Place|Promotion, Profit, Place, Person',
        'Father of scientific management?|F. W. Taylor|Henri Fayol|Peter Drucker|Max Weber',
        'SWOT: Strengths, Weaknesses, Opportunities and…|Threats|Targets|Tactics|Trends',
        'A market with a single seller is a…|Monopoly|Oligopoly|Perfect competition|Duopoly',
        'Which is a current asset?|Cash|Building|Machinery|Land',
        'Break-even point means…|Profit equals zero|Maximum profit|Total loss|Zero sales',
        'Which is a function of management?|Planning|Typing|Driving|Painting',
        'GDP stands for…|Gross Domestic Product|General Domestic Price|Gross Debt Percentage|Global Demand Product',
        'If demand rises and supply is unchanged, price usually…|Rises|Falls|Stays the same|Becomes zero',
        'Net profit = Revenue minus…|All expenses|Only taxes|Only salaries|Only assets',
    ],
    'Software Engineering': [
        'SDLC stands for…|Software Development Life Cycle|System Design Logic Code|Software Debug Life Cycle|Structured Data Language Compiler',
        'Which model is iterative and feedback driven?|Agile|Waterfall|Big Bang|Build-and-fix',
        'UML stands for…|Unified Modeling Language|Universal Machine Language|Unified Module Logic|User Model Language',
        'Testing individual units of code is…|Unit testing|System testing|Acceptance testing|Load testing',
        'Which tool is used for version control?|Git|Jenkins|Selenium|Postman',
        'In Scrum, a short fixed-length work cycle is a…|Sprint|Release|Epic|Backlog',
        'S in SOLID stands for…|Single Responsibility|Simple Syntax|Structured Scope|Static Storage',
        'Which diagram shows user and system interaction?|Use case diagram|Gantt chart|Pie chart|Bar chart',
        'Fixing bugs after release belongs to…|Maintenance|Requirements gathering|Design|Planning',
        'Which testing checks new changes did not break old features?|Regression testing|Alpha testing|Beta testing|Usability testing',
        'A requirement describing system behaviour is…|Functional requirement|Non-functional requirement|Hardware limit|Marketing goal',
        'CI/CD helps to…|Automate build, test and deployment|Draw UML diagrams|Replace all developers|Remove version control',
    ],
    'Chemistry': [
        'Atomic number of Carbon?|6|12|8|14',
        'pH of a neutral solution at 25 °C?|7|0|14|1',
        'Most abundant gas in air?|Nitrogen|Oxygen|Argon|Carbon dioxide',
        'Chemical symbol of Sodium?|Na|So|S|Sd',
        'NaCl is commonly called…|Table salt|Baking soda|Bleach|Vinegar',
        'Avogadro’s number is about…|6.022 × 10²³|3.14 × 10⁸|9.8 × 10¹|1.6 × 10⁻¹⁹',
        'Oxidation means…|Loss of electrons|Gain of electrons|Gain of protons|Loss of neutrons',
        'Horizontal rows in the periodic table are…|Periods|Groups|Blocks|Families',
        'Universal solvent?|Water|Ethanol|Acetone|Benzene',
        'Which bond shares electron pairs?|Covalent|Ionic|Metallic|Hydrogen',
        'SI unit of amount of substance?|Mole|Gram|Liter|Kelvin',
        'Which acid is found in vinegar?|Acetic acid|Citric acid|Sulfuric acid|Nitric acid',
    ],
    'Physics': [
        'SI unit of force?|Newton|Joule|Watt|Pascal',
        'Acceleration due to gravity near Earth surface is approx…|9.8 m/s²|8.9 m/s²|10.8 m/s²|7.2 m/s²',
        'Which law states F = m · a?|Newton’s second law|Newton’s first law|Newton’s third law|Hooke’s law',
        'Speed of light in vacuum is approx…|3 × 10⁸ m/s|3 × 10⁶ m/s|3 × 10¹⁰ m/s|3 × 10⁴ m/s',
        'Work done is zero when displacement is…|Zero|Maximum|Positive|Negative',
        'Unit of electrical resistance?|Ohm|Volt|Ampere|Coulomb',
        'Energy of motion is called…|Kinetic energy|Potential energy|Thermal energy|Nuclear energy',
        'Which particle has a negative charge?|Electron|Proton|Neutron|Positron',
        'Ohm’s law formula?|V = I · R|V = I / R|V = R / I|P = V · I',
        'Unit of frequency?|Hertz|Second|Watt|Decibel',
        'Heat transfer through direct contact is…|Conduction|Convection|Radiation|Sublimation',
        'Momentum is equal to mass times…|Velocity|Acceleration|Force|Time',
    ],
    'Pharmacy': [
        'Study of drug absorption, distribution, metabolism and excretion is…|Pharmacokinetics|Pharmacodynamics|Pharmacognosy|Toxicology',
        'Paracetamol is primarily an…|Antipyretic and analgesic|Antibiotic|Antifungal|Antiviral',
        'Route of drug administration with 100% bioavailability?|Intravenous (IV)|Oral|Subcutaneous|Topical',
        'Which organ is the main site of drug metabolism?|Liver|Kidney|Lungs|Stomach',
        'Penicillin belongs to which antibiotic class?|Beta-lactams|Macrolides|Aminoglycosides|Fluoroquinolones',
        'A substance without active drug used in trials is a…|Placebo|Elixir|Tincture|Pro-drug',
        'Primary organ for drug excretion?|Kidneys|Skin|Pancreas|Heart',
        'OTC drugs are…|Over-the-counter|Only to chemists|Oral timed capsules|Optimal therapy cures',
        'Sublingual means placed…|Under the tongue|Behind the ear|In the cheek|Under the skin',
        'Adverse drug reaction (ADR) means…|Harmful unintended reaction|Normal therapeutic effect|Expired medicine|Cheap generic',
        'Which dosage form is sterile?|Injectable vial|Oral syrup|Topical ointment|Chewable tablet',
        'Study of medicinal drugs derived from plants is…|Pharmacognosy|Pharmacology|Pharmaceutics|Biochemistry',
    ],
    'Nursing': [
        'Normal resting adult pulse rate is about…|60–100 bpm|40–60 bpm|100–140 bpm|140–180 bpm',
        'Normal adult blood pressure benchmark?|120/80 mmHg|140/90 mmHg|100/60 mmHg|160/100 mmHg',
        'The 5th vital sign is often considered…|Pain|Height|Weight|Reflexes',
        'Best way to prevent hospital-acquired infections?|Hand hygiene|Wearing gloves only|Closing windows|Giving antibiotics',
        'Position for a patient sitting upright at 45–60 degrees?|Fowler’s position|Prone position|Supine position|Trendelenburg',
        'Which site is standard for adult pulse check?|Radial artery|Femoral artery|Brachial artery|Popliteal artery',
        'PPE stands for…|Personal Protective Equipment|Patient Primary Evaluation|Practical Procedure Exam|Primary Pulse Examination',
        'Cyanosis refers to bluish discoloration due to lack of…|Oxygen|Iron|Water|Glucose',
        'Normal body temperature is approximately…|37 °C (98.6 °F)|35 °C (95 °F)|39 °C (102 °F)|33 °C (91.4 °F)',
        'NPO medical order means…|Nothing by mouth|Normal patient observation|New prescription ordered|No pain observed',
        'A bedsore is clinically known as a…|Pressure ulcer|Abrasion|Laceration|Contusion',
        'Which cannula is smallest in diameter?|24 Gauge|16 Gauge|18 Gauge|20 Gauge',
    ],
    'Civil Engineering': [
        'Concrete is a mixture of cement, water, sand and…|Coarse aggregate|Steel|Lime|Gypsum',
        'Which test measures concrete workability?|Slump test|Tensile test|Impact test|Abrasion test',
        'Standard compressive strength test of concrete is done at…|28 days|7 days|14 days|3 days',
        'A horizontal structural member carrying transverse load is a…|Beam|Column|Footing|Slab',
        'Which soil has the smallest particle size?|Clay|Silt|Sand|Gravel',
        'Instrument used to measure horizontal and vertical angles?|Theodolite|Manometer|Hydrometer|Barometer',
        'Deep foundation example?|Pile foundation|Spread footing|Mat foundation|Strip footing',
        'Surveying that considers the curvature of Earth is…|Geodetic surveying|Plane surveying|Topographic surveying|Cadastral surveying',
        'Which cement type hardens rapidly?|Rapid hardening cement|Portland pozzolana cement|White cement|Sulphate resisting cement',
        'Ratio of lateral strain to longitudinal strain is…|Poisson’s ratio|Young’s modulus|Bulk modulus|Shear modulus',
        'Structure built across a river to store water is a…|Dam|Bridge|Culvert|Retaining wall',
        'A vertical load-bearing member is a…|Column|Beam|Truss|Lintel',
    ],
    'Mechanical Engineering': [
        'Unit of power is…|Watt|Joule|Pascal|Newton',
        'Four strokes of an IC engine: Suction, Compression, Power and…|Exhaust|Ignition|Expansion|Cooling',
        'Hooke’s law applies within which limit?|Elastic limit|Plastic limit|Breaking point|Ultimate strength',
        'Which law is the basis of temperature measurement?|Zeroth law of thermodynamics|First law|Second law|Third law',
        'Carnot cycle is an ideal cycle with…|Maximum efficiency|Zero work output|Constant pressure only|No heat transfer',
        'Which bearing handles axial thrust load?|Thrust bearing|Radial ball bearing|Needle bearing|Journal bearing',
        'Device that converts mechanical energy into hydraulic energy?|Pump|Turbine|Compressor|Boiler',
        'Material ability to deform permanently without fracture?|Ductility|Brittleness|Hardness|Elasticity',
        'Which fluid has zero viscosity?|Ideal fluid|Real fluid|Newtonian fluid|Non-Newtonian fluid',
        'Lathe machine is mainly used for…|Turning|Milling|Drilling|Grinding',
        'Stress is defined as internal resistance force divided by…|Area|Volume|Length|Mass',
        'Entropy in an isolated system tends to…|Increase|Decrease|Remain zero|Fluctuate wildly',
    ],
    'Electrical Engineering': [
        'Ohm’s law equation?|V = I · R|I = V · R|R = V · I|P = V · I',
        'Unit of capacitance?|Farad|Henry|Ohm|Tesla',
        'Standard domestic AC frequency in Pakistan & UK?|50 Hz|60 Hz|100 Hz|25 Hz',
        'Transformer works on which principle?|Mutual induction|Self induction only|Photoelectric effect|Electrostatic repulsion',
        'Which semiconductor device allows current in one direction?|Diode|Resistor|Capacitor|Inductor',
        'Unit of magnetic flux density?|Tesla|Weber|Gauss|Henry',
        'KCL (Kirchhoff’s Current Law) is based on conservation of…|Charge|Energy|Momentum|Mass',
        'Which motor is widely used in ceiling fans?|Single-phase induction motor|DC series motor|Stepper motor|Synchronous motor',
        'Three-phase system phase difference is…|120 degrees|90 degrees|180 degrees|60 degrees',
        'Pure silicon at room temperature is an…|Intrinsic semiconductor|Conductor|Insulator|Superconductor',
        'Power in DC circuit is…|P = V · I|P = V / I|P = I / V|P = V² · I',
        'Device that steps up or steps down AC voltage?|Transformer|Inverter|Rectifier|Generator',
    ],
    'MBBS': [
        'Powerhouse of the cell?|Mitochondria|Ribosome|Golgi apparatus|Nucleus',
        'Largest organ of the human body?|Skin|Liver|Brain|Heart',
        'Normal human body temperature in Celsius?|37 °C|35 °C|38.5 °C|36 °C',
        'Which chamber of the heart pumps oxygenated blood to the body?|Left ventricle|Right ventricle|Left atrium|Right atrium',
        'Universal blood donor type?|O negative|AB positive|O positive|A negative',
        'Total number of bones in an adult human skeleton?|206|208|201|212',
        'Cranial nerve X (tenth) is the…|Vagus nerve|Optic nerve|Trigeminal nerve|Facial nerve',
        'Which organ produces insulin?|Pancreas|Liver|Gallbladder|Kidney',
        'Primary functional unit of the kidney?|Nephron|Neuron|Alveolus|Osteon',
        'Bile is produced by the liver and stored in the…|Gallbladder|Spleen|Stomach|Duodenum',
        'Vitamin essential for blood clotting?|Vitamin K|Vitamin C|Vitamin D|Vitamin A',
        'Gas exchange in the lungs takes place in the…|Alveoli|Bronchi|Trachea|Larynx',
    ],
};
const STORAGE_KEY = 'studyhub_v1';
const BRAIN_KEY = 'studyhub_brain';
const uid = () => Math.random().toString(36).slice(2, 9);
const pad2 = (n) => String(n).padStart(2, '0');
const toDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const todayStr = () => toDateStr(new Date());
const diffDays = (targetDateStr) => {
    const d1 = new Date(`${targetDateStr}T00:00:00`).getTime();
    const d2 = new Date(`${todayStr()}T00:00:00`).getTime();
    return Math.round((d1 - d2) / 86400000);
};
const toMins = (t) => {
    if (!t)
        return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
};
const fromMins = (mins) => {
    const normalized = (mins % 1440 + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${pad2(h)}:${pad2(m)}`;
};
const getSubjectColor = (colors, subject) => {
    if (!subject)
        return '#5f9bb2';
    if (colors[subject])
        return colors[subject];
    let hash = 0;
    for (let i = 0; i < subject.length; i++)
        hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    const idx = Math.abs(hash) % SUBJECT_PALETTE.length;
    return SUBJECT_PALETTE[idx];
};
const calcStreak = (sess) => {
    const dates = new Set(sess.map(s => s.date));
    let streak = 0;
    const cur = new Date();
    if (!dates.has(toDateStr(cur)))
        cur.setDate(cur.getDate() - 1);
    while (dates.has(toDateStr(cur))) {
        streak++;
        cur.setDate(cur.getDate() - 1);
    }
    return streak;
};
const calcPoints = (state) => {
    const studyMins = state.sess.reduce((acc, s) => acc + s.mins, 0);
    const asgDone = state.asgs.filter(a => a.done).length;
    const qzScore = state.qz.reduce((acc, q) => acc + q.score * 5 + 10, 0);
    const notesCount = state.notes.length * 3;
    const matsCount = state.mats.length * 2;
    const lecCount = state.lec.length * 5;
    const streakBonus = calcStreak(state.sess) * 10;
    return Math.floor(studyMins / 5) + asgDone * 20 + qzScore + notesCount + matsCount + lecCount + streakBonus;
};
const calcLevel = (pts) => Math.floor(Math.sqrt(pts / 40)) + 1;
export const BADGES_LIST = [
    { id: 'first', icon: '🌱', name: 'First Step', desc: 'Log your first study session' },
    { id: 's3', icon: '🔥', name: '3-Day Streak', desc: 'Study 3 days in a row' },
    { id: 's7', icon: '⚡', name: 'Week Warrior', desc: '7-day study streak' },
    { id: 's30', icon: '👑', name: 'Month Master', desc: '30-day study streak' },
    { id: 'h10', icon: '⏱️', name: '10 Hour Club', desc: 'Study 10 hours in total' },
    { id: 'a5', icon: '✅', name: 'Task Master', desc: 'Complete 5 assignments' },
    { id: 'q1', icon: '🎯', name: 'Quiz Starter', desc: 'Finish your first quiz' },
    { id: 'q80', icon: '🧠', name: 'Quiz Whiz', desc: 'Score 80%+ on a quiz' },
    { id: 'q100', icon: '🏆', name: 'Perfect Score', desc: '100% on a quiz with 3+ questions' },
    { id: 'n5', icon: '📝', name: 'Note Taker', desc: 'Save 5 notes' },
    { id: 'l5', icon: '🎓', name: 'Class Regular', desc: 'Log 5 lectures' },
    { id: 'm3', icon: '📚', name: 'Librarian', desc: 'Add 3 study materials' },
];
const checkBadgeEligible = (id, s) => {
    const totalHours = s.sess.reduce((acc, x) => acc + x.mins, 0) / 60;
    const streak = calcStreak(s.sess);
    switch (id) {
        case 'first': return s.sess.length > 0;
        case 's3': return streak >= 3;
        case 's7': return streak >= 7;
        case 's30': return streak >= 30;
        case 'h10': return totalHours >= 10;
        case 'a5': return s.asgs.filter(a => a.done).length >= 5;
        case 'q1': return s.qz.length > 0;
        case 'q80': return s.qz.some(q => q.total > 0 && q.score / q.total >= 0.8);
        case 'q100': return s.qz.some(q => q.total >= 3 && q.score === q.total);
        case 'n5': return s.notes.length >= 5;
        case 'l5': return s.lec.length >= 5;
        case 'm3': return s.mats.length >= 3;
        default: return false;
    }
};
// Auto Routine Generator Algorithm
const generateAutoRoutine = (state, cfg) => {
    const homeMins = toMins(cfg.home || '15:00');
    let sleepMins = toMins(cfg.sleep || '23:00');
    if (sleepMins <= homeMins)
        sleepMins += 1440;
    const available = sleepMins - homeMins;
    if (available < 120)
        return [];
    const tasks = [];
    let cur = homeMins;
    // 1. Post-arrival lunch & unwinding
    const isLate = homeMins >= 1110; // after 18:30
    tasks.push({
        id: 'lunch',
        title: isLate ? 'Ghar Wapsi + Dinner' : 'Ghar Wapsi + Lunch',
        icon: '🍽️',
        start: fromMins(cur),
        end: fromMins(cur + 45),
    });
    cur += 45;
    // 2. Short Rest
    tasks.push({
        id: 'rest',
        title: 'Short Rest & Refresh',
        icon: '😌',
        start: fromMins(cur),
        end: fromMins(cur + 30),
    });
    cur += 30;
    // 3. Urgent Assignments
    const urgentAsgs = state.asgs.filter(a => !a.done).sort((a, b) => diffDays(a.due) - diffDays(b.due));
    if (urgentAsgs.length > 0 && cur + 50 <= sleepMins - 60) {
        const asg = urgentAsgs[0];
        tasks.push({
            id: `asg-${asg.id}`,
            title: `Assignment: ${asg.title} (${asg.subject || 'General'})`,
            icon: '📝',
            start: fromMins(cur),
            end: fromMins(cur + 50),
        });
        cur += 50;
        cur += 15; // break
    }
    // 4. Upcoming Exam Prep
    const upcomingExams = state.exams.filter(e => diffDays(e.date) >= 0).sort((a, b) => diffDays(a.date) - diffDays(b.date));
    if (upcomingExams.length > 0 && cur + 50 <= sleepMins - 60) {
        const ex = upcomingExams[0];
        const dl = diffDays(ex.date);
        tasks.push({
            id: `exam-${ex.id}`,
            title: `Exam Prep: ${ex.subject} (${dl === 0 ? 'Today' : dl === 1 ? 'Tomorrow' : `in ${dl}d`})`,
            icon: '🎯',
            start: fromMins(cur),
            end: fromMins(cur + 50),
        });
        cur += 50;
        cur += 15; // break
    }
    // 5. Subject Study Session
    const subjects = Array.from(new Set([
        ...state.classes.map(c => c.subject),
        ...state.asgs.map(a => a.subject || ''),
        ...state.exams.map(e => e.subject),
    ])).filter(Boolean);
    if (cur + 45 <= sleepMins - 90) {
        const sub = subjects[0] || 'Core Subject';
        tasks.push({
            id: 'study-1',
            title: `Study Session: ${sub}`,
            icon: '📚',
            start: fromMins(cur),
            end: fromMins(cur + 45),
        });
        cur += 45;
    }
    // 6. Dinner (if not already eaten)
    if (!isLate && cur + 45 <= sleepMins - 30) {
        tasks.push({
            id: 'dinner',
            title: 'Dinner & Family Time',
            icon: '🍲',
            start: fromMins(cur),
            end: fromMins(cur + 45),
        });
        cur += 45;
    }
    // 7. Light Review / Lecture Journal
    if (cur + 30 <= sleepMins - 30) {
        tasks.push({
            id: 'review',
            title: 'Daily Review & Journal Notes',
            icon: '✨',
            start: fromMins(cur),
            end: fromMins(cur + 30),
        });
        cur += 30;
    }
    // 8. Free time / winding down
    if (sleepMins - cur >= 15) {
        tasks.push({
            id: 'free',
            title: 'Free Time & Wind Down',
            icon: '🎮',
            start: fromMins(cur),
            end: fromMins(sleepMins),
        });
    }
    // 9. Sleep
    tasks.push({
        id: 'sleep',
        title: 'Sleep & Night Recovery',
        icon: '😴',
        start: fromMins(sleepMins),
        end: fromMins(sleepMins + 480), // 8h
    });
    return tasks;
};
// ==========================================
// 3. MAIN APP COMPONENT
// ==========================================

// ==========================================
// RESPONSIVE SIDEBAR COMPONENT (DESKTOP & MOBILE DRAWER)
// ==========================================
function SidebarContent({ state, updateState, activeTab, moreView, navigateTo, theme, isDark, isDesktop, onClose }) {
  const navItems = [
    { key: 'dash', icon: 'home-outline', activeIcon: 'home', label: 'Dashboard / Home' },
    { key: 'ai', icon: 'sparkles-outline', activeIcon: 'sparkles', label: 'AI Study Assistant', badge: 'GEMINI' },
    { key: 'timetable', icon: 'calendar-outline', activeIcon: 'calendar', label: 'Timetable & Classes' },
    { key: 'tasks', icon: 'checkbox-outline', activeIcon: 'checkbox', label: 'Tasks & To-Dos' },
    { key: 'notes', icon: 'document-text-outline', activeIcon: 'document-text', label: 'Lecture Notes' },
    { key: 'lectures', icon: 'school-outline', activeIcon: 'school', label: 'Lectures' },
    { key: 'exams', icon: 'trophy-outline', activeIcon: 'trophy', label: 'Exams & Quizzes' },
    { key: 'materials', icon: 'folder-open-outline', activeIcon: 'folder-open', label: 'Study Materials' },
    { key: 'focus', icon: 'timer-outline', activeIcon: 'timer', label: 'Focus Pomodoro' },
    { key: 'brain', icon: 'game-controller-outline', activeIcon: 'game-controller', label: 'Brain Break & Quiz' },
    { key: 'routine', icon: 'calendar-number-outline', activeIcon: 'calendar-number', label: 'Daily Routine' },
    { key: 'insights', icon: 'stats-chart-outline', activeIcon: 'stats-chart', label: 'Insights & Analytics' },
    { key: 'settings', icon: 'settings-outline', activeIcon: 'settings', label: 'Settings & Profile' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.card, display: 'flex', flexDirection: 'column' }}>
      {/* SIDEBAR HEADER */}
      <View style={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.cardBorder,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.5 }}>
            study<Text style={{ color: '#5f9bb2', fontStyle: 'italic' }}>hub</Text>
          </Text>
          <Text style={{ fontSize: 11, color: theme.subText, marginTop: 2 }}>
            {state.profile?.name || 'Student'} · {state.profile?.cls || 'General'}
          </Text>
        </View>

        {!isDesktop && (
          <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
            <Ionicons name="close-circle" size={24} color={theme.subText} />
          </TouchableOpacity>
        )}
      </View>

      {/* NAVIGATION ITEMS LIST */}
      <ScrollView style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 10 }}>
        {navItems.map((item) => {
          const isSel = (['dash', 'timetable', 'tasks', 'notes', 'ai'].includes(item.key)
            ? activeTab === item.key && !moreView
            : moreView === item.key);

          return (
            <TouchableOpacity
              key={item.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 12,
                marginBottom: 4,
                backgroundColor: isSel
                  ? (isDark ? '#1e3a5f' : '#e0f2fe')
                  : 'transparent',
                borderWidth: isSel ? 1 : 0,
                borderColor: isSel ? '#5f9bb2' : 'transparent',
              }}
              onPress={() => {
                navigateTo(item.key);
                if (onClose) onClose();
              }}
            >
              <Ionicons
                name={isSel ? item.activeIcon : item.icon}
                size={19}
                color={isSel ? '#5f9bb2' : theme.text}
                style={{ width: 26 }}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: isSel ? '700' : '500',
                  color: isSel ? (isDark ? '#ffffff' : '#0369a1') : theme.text,
                }}
              >
                {item.label}
              </Text>

              {item.badge && (
                <View style={{
                  backgroundColor: '#2dd4bf',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 6,
                  marginLeft: 6
                }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: '#0f172a' }}>
                    {item.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* SIDEBAR FOOTER */}
      <View style={{
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: theme.cardBorder,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderRadius: 8,
            backgroundColor: theme.inputBg
          }}
          onPress={() => updateState({ dark: !isDark })}
        >
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={16} color={theme.text} />
          <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text }}>
            {isDark ? 'Light' : 'Dark'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderRadius: 8,
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
          }}
          onPress={() => {
            Alert.alert('Sign Out', 'Log out of StudyHub?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => {
                  updateState({ profile: null });
                  if (onClose) onClose();
                }
              }
            ]);
          }}
        >
          <Ionicons name="log-out-outline" size={16} color="#ef4444" />
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#ef4444' }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
    const { width: windowWidth, height: windowHeight } = (typeof useWindowDimensions === 'function')
        ? useWindowDimensions()
        : Dimensions.get('window');
    const isDesktop = windowWidth >= 768;
    const [showSidebar, setShowSidebar] = useState(false);

    const [state, setState] = useState({
        profile: null,
        classes: [],
        asgs: [],
        notes: [],
        exams: [],
        sess: [],
        rems: [],
        dark: false,
        goal: 300,
        colors: {},
        rt: null,
        rtDone: {},
        field: null,
        qz: [],
        mats: [],
        lec: [],
        ad: {},
        bd: {},
    });
    const [activeTab, setActiveTab] = useState('dash');
    const [moreView, setMoreView] = useState(null);
    const [showMoreModal, setShowMoreModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [notificationMsg, setNotificationMsg] = useState(null);
    const [lastBackPress, setLastBackPress] = useState(0);

    // Android Hardware Back Button Handling
    useEffect(() => {
        const handleBackPress = () => {
            // 0. Close sidebar drawer if open
            if (showSidebar) {
                setShowSidebar(false);
                return true;
            }
            // 1. Close active root modals
            if (showSearchModal) {
                setShowSearchModal(false);
                return true;
            }
            if (showFieldModal) {
                setShowFieldModal(false);
                return true;
            }
            if (showMoreModal) {
                setShowMoreModal(false);
                return true;
            }

            // 2. If in a more sub-screen (Lectures, Exams, Materials, Focus, Games, Settings, etc.)
            if (moreView) {
                setMoreView(null);
                setActiveTab('dash');
                return true;
            }

            // 3. If in another tab (Timetable, Tasks, Notes)
            if (activeTab !== 'dash') {
                setActiveTab('dash');
                return true;
            }

            // 4. If on Dashboard, double tap back to exit
            const now = Date.now();
            if (now - lastBackPress < 2000) {
                if (typeof BackHandler !== 'undefined' && BackHandler.exitApp) {
                    BackHandler.exitApp();
                }
                return true;
            }
            setLastBackPress(now);
            showToast('Press BACK again to exit StudyHub');
            return true;
        };

        if (typeof BackHandler !== 'undefined' && BackHandler.addEventListener) {
            const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
            return () => {
                if (subscription && typeof subscription.remove === 'function') {
                    subscription.remove();
                } else if (typeof BackHandler !== 'undefined' && BackHandler['removeEventListener']) {
                    BackHandler['removeEventListener']('hardwareBackPress', handleBackPress);
                }
            };
        }
    }, [showSearchModal, showFieldModal, showMoreModal, moreView, activeTab, lastBackPress]);

    // Load from Storage
    useEffect(() => {
        (async () => {
            try {
                const raw = await Storage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    setState(prev => ({ ...prev, ...parsed }));
                }
            }
            catch (err) {
                console.error('Failed to load studyhub state:', err);
            }
        })();
    }, []);
    // Save to Storage
    const updateState = (updater) => {
        setState(prev => {
            const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
            Storage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => { });
            return next;
        });
    };
    // Toast / notification
    const showToast = (msg) => {
        setNotificationMsg(msg);
        setTimeout(() => setNotificationMsg(null), 3500);
    };
    // Check badges unlock
    useEffect(() => {
        const newlyUnlocked = [];
        const updatedBd = { ...state.bd };
        BADGES_LIST.forEach(b => {
            if (!updatedBd[b.id] && checkBadgeEligible(b.id, state)) {
                updatedBd[b.id] = todayStr();
                newlyUnlocked.push(`${b.icon} ${b.name}`);
            }
        });
        if (newlyUnlocked.length > 0) {
            updateState({ bd: updatedBd });
            showToast(`Badge unlocked: ${newlyUnlocked.join(', ')}`);
        }
    }, [state.sess, state.asgs, state.qz, state.notes, state.mats, state.lec]);
    // Theme styles
    const isDark = state.dark;
    const theme = {
        bg: isDark ? '#0f1b27' : '#f4f3ef',
        card: isDark ? '#1e293b' : '#ffffff',
        cardBorder: isDark ? 'rgba(51, 65, 85, 0.6)' : '#e7e5de',
        text: isDark ? '#f1f5f9' : '#1c2f44',
        subText: isDark ? '#94a3b8' : '#64748b',
        brand: '#5f9bb2',
        brandDark: '#3f7f99',
        headerBg: isDark ? '#0b131c' : '#1c2f44',
        headerText: '#ffffff',
        inputBg: isDark ? '#0f172a' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0',
    };
    // Navigation helpers
    const navigateTo = (screenKey) => {
        if (['dash', 'timetable', 'tasks', 'notes', 'ai'].includes(screenKey)) {
            setActiveTab(screenKey);
            setMoreView(null);
        }
        else {
            setActiveTab('more');
            setMoreView(screenKey);
        }
        setShowMoreModal(false);
    };
    // If student not logged in, render Secure Auth Screen (Login & Sign Up)
    if (!state.profile) {
        return (<SafeAreaView style={[styles.safeArea, { backgroundColor: '#f4f3ef' }]}>
        <StatusBar barStyle="dark-content" />
        <AuthScreen onLoginSuccess={(user) => {
                updateState({
                    profile: { name: user.name, cls: user.cls, email: user.email },
                    field: user.cls
                });
                showToast(`Welcome back, ${user.name}! 🎓`);
            }}/>
      </SafeAreaView>);
    }
    const streak = calcStreak(state.sess);
    const points = calcPoints(state);
    const level = calcLevel(points);
    return (<SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg, height: '100%', maxHeight: '100%', overflow: 'hidden' }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* TOP HEADER */}
        <View style={[styles.topBar, { backgroundColor: theme.headerBg }]}>
          <View style={styles.topBarLeft}>
            {activeTab === 'ai' ? (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 }}
                onPress={() => navigateTo('dash')}
              >
                <Ionicons name="arrow-back" size={20} color="#ffffff" />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#ffffff' }}>Home</Text>
                <Text style={{ fontSize: 11, color: '#5f9bb2', marginLeft: 4 }}>· AI Tutor</Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.logoText}>study<Text style={styles.logoHub}>hub</Text></Text>
                <Text style={styles.topStudentInfo}>
                  {state.profile.name} · {state.profile.cls}
                </Text>
              </>
            )}
          </View>

          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => setShowSearchModal(true)} accessibilityLabel="Search">
              <Ionicons name="search" size={19} color="#ffffff"/>
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerIconButton} onPress={() => updateState({ dark: !isDark })} accessibilityLabel="Toggle Theme">
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={19} color="#ffffff"/>
            </TouchableOpacity>

            <TouchableOpacity style={styles.streakBadge} onPress={() => navigateTo('insights')}>
              <Text style={styles.streakText}>🔥 {streak}d</Text>
            </TouchableOpacity>

            {/* TOP RIGHT CORNER: SIDEBAR MENU BUTTON */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#5f9bb2',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 10,
                marginLeft: 5,
                gap: 4
              }}
              onPress={() => setShowSidebar(true)}
              accessibilityLabel="Open Sidebar Menu"
            >
              <Ionicons name="menu" size={20} color="#ffffff"/>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#ffffff' }}>Menu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* NOTIFICATION TOAST */}
        {notificationMsg && (<View style={styles.toastContainer}>
            <Text style={styles.toastText}>{notificationMsg}</Text>
            <TouchableOpacity onPress={() => setNotificationMsg(null)}>
              <Ionicons name="close" size={18} color="#ffffff"/>
            </TouchableOpacity>
          </View>)}

        {/* ACTIVE SCREEN CONTENT */}
        <View style={{ flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }}>
          {activeTab === 'dash' && (<DashboardScreen state={state} updateState={updateState} navigateTo={navigateTo} theme={theme} streak={streak} points={points} level={level} showToast={showToast} openFieldSelector={() => setShowFieldModal(true)}/>)}
          {activeTab === 'timetable' && (<TimetableScreen state={state} updateState={updateState} theme={theme} showToast={showToast}/>)}
          {activeTab === 'tasks' && (<AssignmentsScreen state={state} updateState={updateState} theme={theme} showToast={showToast}/>)}
          {activeTab === 'notes' && (<NotesScreen state={state} updateState={updateState} theme={theme} showToast={showToast}/>)}
          {activeTab === 'ai' && (<AIAssistantScreen state={state} updateState={updateState} theme={theme} showToast={showToast} navigateTo={navigateTo}/>)}
          {activeTab === 'more' && (<MoreViewWrapper viewKey={moreView || 'settings'} state={state} updateState={updateState} navigateTo={navigateTo} theme={theme} showToast={showToast} openFieldSelector={() => setShowFieldModal(true)}/>)}
        </View>

        {/* BOTTOM TAB NAVIGATION (ALWAYS VISIBLE!) */}
        <View style={[styles.bottomNav, { backgroundColor: theme.card, borderTopColor: theme.cardBorder }]}>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('dash'); setMoreView(null); }}>
            <Ionicons name={activeTab === 'dash' && !moreView ? 'home' : 'home-outline'} size={21} color={activeTab === 'dash' && !moreView ? theme.brand : theme.subText}/>
            <Text style={[styles.navText, { color: activeTab === 'dash' && !moreView ? theme.brand : theme.subText }]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('timetable'); setMoreView(null); }}>
            <Ionicons name={activeTab === 'timetable' && !moreView ? 'calendar' : 'calendar-outline'} size={21} color={activeTab === 'timetable' && !moreView ? theme.brand : theme.subText}/>
            <Text style={[styles.navText, { color: activeTab === 'timetable' && !moreView ? theme.brand : theme.subText }]}>
              Schedule
            </Text>
          </TouchableOpacity>

          {/* CENTER AI TUTOR HIGHLIGHTED BUTTON */}
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              marginTop: -10
            }}
            onPress={() => { setActiveTab('ai'); setMoreView(null); }}
          >
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: activeTab === 'ai' && !moreView ? '#1c2f44' : '#5f9bb2',
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 4,
              borderWidth: 2,
              borderColor: '#ffffff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4
            }}>
              <Ionicons name="sparkles" size={20} color="#ffffff" />
            </View>
            <Text style={[styles.navText, { color: activeTab === 'ai' && !moreView ? '#5f9bb2' : theme.subText, fontWeight: '700', marginTop: 2 }]}>
              AI Tutor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('tasks'); setMoreView(null); }}>
            <Ionicons name={activeTab === 'tasks' && !moreView ? 'checkbox' : 'checkbox-outline'} size={21} color={activeTab === 'tasks' && !moreView ? theme.brand : theme.subText}/>
            <Text style={[styles.navText, { color: activeTab === 'tasks' && !moreView ? theme.brand : theme.subText }]}>
              Tasks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('notes'); setMoreView(null); }}>
            <Ionicons name={activeTab === 'notes' && !moreView ? 'document-text' : 'document-text-outline'} size={21} color={activeTab === 'notes' && !moreView ? theme.brand : theme.subText}/>
            <Text style={[styles.navText, { color: activeTab === 'notes' && !moreView ? theme.brand : theme.subText }]}>
              Notes
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SIDEBAR DRAWER MODAL (ALWAYS OPENS FROM TOP-RIGHT MENU BUTTON) */}
      <Modal
        visible={showSidebar}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSidebar(false)}
      >
        <View style={{ flex: 1, flexDirection: 'row-reverse', backgroundColor: 'rgba(0, 0, 0, 0.45)' }}>
          <View style={{
            width: Math.min(320, windowWidth * 0.82),
            backgroundColor: theme.card,
            height: '100%',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: -4, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 10
          }}>
            <SidebarContent
              state={state}
              updateState={updateState}
              activeTab={activeTab}
              moreView={moreView}
              navigateTo={navigateTo}
              theme={theme}
              isDark={isDark}
              isDesktop={false}
              onClose={() => setShowSidebar(false)}
            />
          </View>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowSidebar(false)}
          />
        </View>
      </Modal>

      {/* GLOBAL SEARCH MODAL */}
      <GlobalSearchModal visible={showSearchModal} onClose={() => setShowSearchModal(false)} state={state} navigateTo={navigateTo} theme={theme}/>

      {/* FIELD SELECTOR MODAL */}
      <FieldSelectorModal visible={showFieldModal} currentField={state.field} onSelect={(newField) => {
            updateState({ field: newField });
            setShowFieldModal(false);
            showToast(`Field set to ${newField}`);
        }} onClose={() => setShowFieldModal(false)} theme={theme}/>
    </SafeAreaView>);
}
// ==========================================
// 4. ONBOARDING SCREEN
// ==========================================
// ==========================================
// 4. AUTHENTICATION SCREEN (LOGIN & SIGN UP)
// ==========================================
const USERS_STORAGE_KEY = 'studyhub_registered_users_v2';

function AuthScreen({ onLoginSuccess }) {
    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('student@studyhub.edu');
    const [password, setPassword] = useState('password123');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedField, setSelectedField] = useState('Computer Science');
    const [registeredUsers, setRegisteredUsers] = useState([
        {
            email: 'student@studyhub.edu',
            password: 'password123',
            name: 'Adeel Khan',
            cls: 'Computer Science'
        }
    ]);

    // Load registered users from Storage
    useEffect(() => {
        (async () => {
            try {
                const raw = await Storage.getItem(USERS_STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setRegisteredUsers(parsed);
                    }
                }
            } catch (e) {}
        })();
    }, []);

    // Save users helper
    const saveUsersList = async (users) => {
        setRegisteredUsers(users);
        try {
            await Storage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } catch (e) {}
    };

    // Handle Login
    const handleLogin = () => {
        const normEmail = email.trim().toLowerCase();
        const normPass = password.trim();

        if (!normEmail || !normPass) {
            Alert.alert('Missing Fields', 'Please enter both your email address and password.');
            return;
        }

        const found = registeredUsers.find(
            (u) => u.email.toLowerCase() === normEmail && u.password === normPass
        );

        if (found) {
            onLoginSuccess(found);
        } else {
            Alert.alert(
                'Invalid Credentials',
                'Incorrect email or password.\n\nTip: You can use "1-Tap Demo Student Login" below or click "Sign Up" to register.'
            );
        }
    };

    // Handle Sign Up
    const handleSignUp = async () => {
        const trimmedName = name.trim();
        const normEmail = email.trim().toLowerCase();
        const normPass = password.trim();

        if (!trimmedName || !normEmail || !normPass) {
            Alert.alert('Required Fields', 'Please fill in your name, email, and password.');
            return;
        }

        if (normPass.length < 4) {
            Alert.alert('Weak Password', 'Password must be at least 4 characters long.');
            return;
        }

        const exists = registeredUsers.some((u) => u.email.toLowerCase() === normEmail);
        if (exists) {
            Alert.alert('Account Exists', 'An account with this email is already registered. Please Sign In.');
            setMode('login');
            return;
        }

        const newUser = {
            id: uid(),
            name: trimmedName,
            email: normEmail,
            password: normPass,
            cls: selectedField
        };

        const updated = [...registeredUsers, newUser];
        await saveUsersList(updated);
        onLoginSuccess(newUser);
    };

    // 1-Tap Quick Demo Login (for university presentation & instant testing)
    const handleQuickDemo = () => {
        const demoUser = {
            id: 'usr_demo_1',
            name: 'Adeel Khan',
            email: 'student@studyhub.edu',
            password: 'password123',
            cls: 'Computer Science'
        };
        onLoginSuccess(demoUser);
    };

    return (
        <ScrollView contentContainerStyle={styles.onboardScroll}>
            <View style={styles.onboardHero}>
                {/* BRAND BADGE & HEADER */}
                <View style={{
                    backgroundColor: 'rgba(95, 155, 178, 0.15)',
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 20,
                    marginBottom: 10
                }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#1c2f44' }}>
                        🔒 Secure Student Portal · StudyHub v2.0
                    </Text>
                </View>

                <Text style={styles.onboardLogo}>
                    study<Text style={{ color: '#5f9bb2', fontStyle: 'italic' }}>hub</Text>
                </Text>
                <Text style={styles.onboardTagline}>
                    Your calm, intelligent university study companion
                </Text>

                {/* AUTH CARD */}
                <View style={[styles.onboardFormCard, { marginTop: 16 }]}>
                    {/* MODE TABS (SIGN IN / SIGN UP) */}
                    <View style={{
                        flexDirection: 'row',
                        backgroundColor: '#f1f5f9',
                        borderRadius: 12,
                        padding: 4,
                        marginBottom: 20
                    }}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                paddingVertical: 10,
                                alignItems: 'center',
                                borderRadius: 10,
                                backgroundColor: mode === 'login' ? '#1c2f44' : 'transparent'
                            }}
                            onPress={() => setMode('login')}
                        >
                            <Text style={{
                                fontSize: 13,
                                fontWeight: '700',
                                color: mode === 'login' ? '#ffffff' : '#64748b'
                            }}>
                                Sign In
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                flex: 1,
                                paddingVertical: 10,
                                alignItems: 'center',
                                borderRadius: 10,
                                backgroundColor: mode === 'signup' ? '#1c2f44' : 'transparent'
                            }}
                            onPress={() => setMode('signup')}
                        >
                            <Text style={{
                                fontSize: 13,
                                fontWeight: '700',
                                color: mode === 'signup' ? '#ffffff' : '#64748b'
                            }}>
                                Create Account
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* CARD HEADER TITLE */}
                    <Text style={styles.onboardFormTitle}>
                        {mode === 'login' ? 'Welcome Back!' : 'Join StudyHub'}
                    </Text>
                    <Text style={styles.onboardFormSubtitle}>
                        {mode === 'login'
                            ? 'Enter your student credentials to access your study space.'
                            : 'Sign up to organize classes, notes & AI study assistance.'}
                    </Text>

                    {/* SIGN UP ONLY: FULL NAME */}
                    {mode === 'signup' && (
                        <View style={{ marginBottom: 12 }}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. Adeel Khan"
                                placeholderTextColor="#94a3b8"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    )}

                    {/* EMAIL INPUT */}
                    <View style={{ marginBottom: 12 }}>
                        <Text style={styles.inputLabel}>University Email</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. student@studyhub.edu"
                            placeholderTextColor="#94a3b8"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    {/* PASSWORD INPUT WITH SHOW/HIDE TOGGLE */}
                    <View style={{ marginBottom: 12 }}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#ffffff',
                            borderWidth: 1,
                            borderColor: '#e2e8f0',
                            borderRadius: 12,
                            paddingHorizontal: 12
                        }}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    fontSize: 14,
                                    color: '#1c2f44'
                                }}
                                placeholder="Enter password (min 4 chars)"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 6 }}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={18}
                                    color="#64748b"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* SIGN UP ONLY: DEGREE / FIELD SELECTOR CHIPS */}
                    {mode === 'signup' && (
                        <View style={{ marginBottom: 16 }}>
                            <Text style={styles.inputLabel}>Academic Discipline</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 8, paddingVertical: 6 }}
                            >
                                {ACADEMIC_FIELDS.map(([f, icon]) => {
                                    const isSel = selectedField === f;
                                    return (
                                        <TouchableOpacity
                                            key={f}
                                            style={{
                                                paddingHorizontal: 12,
                                                paddingVertical: 8,
                                                borderRadius: 12,
                                                backgroundColor: isSel ? '#1c2f44' : '#f1f5f9',
                                                borderWidth: 1,
                                                borderColor: isSel ? '#1c2f44' : '#e2e8f0'
                                            }}
                                            onPress={() => setSelectedField(f)}
                                        >
                                            <Text style={{
                                                fontSize: 12,
                                                fontWeight: '600',
                                                color: isSel ? '#ffffff' : '#1c2f44'
                                            }}>
                                                {icon} {f}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    )}

                    {/* PRIMARY ACTION BUTTON */}
                    {mode === 'login' && (
                        <View style={{
                            backgroundColor: '#e0f2fe',
                            borderWidth: 1,
                            borderColor: '#bae6fd',
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 10,
                            marginBottom: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6
                        }}>
                            <Ionicons name="information-circle-outline" size={16} color="#0369a1" />
                            <Text style={{ fontSize: 11, color: '#0369a1', flex: 1, fontWeight: '600' }}>
                                Demo Credentials Pre-filled (student@studyhub.edu / password123)
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={[styles.primaryBtn, { marginTop: 4 }]}
                        onPress={mode === 'login' ? handleLogin : handleSignUp}
                    >
                        <Text style={styles.primaryBtnText}>
                            {mode === 'login' ? 'Sign In to StudyHub →' : 'Create My Account →'}
                        </Text>
                    </TouchableOpacity>

                    {/* DIVIDER */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginVertical: 18,
                        gap: 10
                    }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8' }}>OR</Text>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
                    </View>

                    {/* 1-TAP DEMO STUDENT LOGIN BUTTON */}
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f0fdf4',
                            borderWidth: 1.5,
                            borderColor: '#86efac',
                            paddingVertical: 12,
                            borderRadius: 14,
                            gap: 8
                        }}
                        onPress={handleQuickDemo}
                    >
                        <Text style={{ fontSize: 16 }}>⚡</Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#166534' }}>
                            1-Tap Quick Demo Student Login
                        </Text>
                    </TouchableOpacity>

                    {/* FOOTER SWITCH */}
                    <TouchableOpacity
                        style={{ marginTop: 18, alignItems: 'center' }}
                        onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    >
                        <Text style={{ fontSize: 12, color: '#64748b' }}>
                            {mode === 'login' ? (
                                <>Don't have an account? <Text style={{ color: '#5f9bb2', fontWeight: '700' }}>Sign Up</Text></>
                            ) : (
                                <>Already have an account? <Text style={{ color: '#5f9bb2', fontWeight: '700' }}>Sign In</Text></>
                            )}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

// ==========================================
// 5. DASHBOARD SCREEN
// ==========================================
function DashboardScreen({ state, updateState, navigateTo, theme, streak, points, level, showToast, openFieldSelector, }) {
    const isDark = state.dark;
    const [showRoutineModal, setShowRoutineModal] = useState(false);
    const curDate = new Date();
    const dayIdx = curDate.getDay();
    const todayClasses = state.classes.filter((c) => c.day === dayIdx).sort((a, b) => a.start.localeCompare(b.start));
    const pendingAsgs = state.asgs.filter((a) => !a.done).sort((a, b) => diffDays(a.due) - diffDays(b.due));
    const upcomingExams = state.exams.filter((e) => diffDays(e.date) >= 0).sort((a, b) => diffDays(a.date) - diffDays(b.date));
    // Active routine tasks for today
    const activeRoutineTasks = useMemo(() => {
        if (!state.rt)
            return [];
        if (state.rt.mode === 'auto') {
            return generateAutoRoutine(state, state.rt);
        }
        return state.rt.tasks || [];
    }, [state.rt, state.asgs, state.exams]);
    const doneTodayTaskIds = state.rtDone[todayStr()] || [];
    const toggleRoutineTaskDone = (taskId) => {
        const isDone = doneTodayTaskIds.includes(taskId);
        const updated = isDone
            ? doneTodayTaskIds.filter((id) => id !== taskId)
            : [...doneTodayTaskIds, taskId];
        updateState({
            rtDone: {
                ...state.rtDone,
                [todayStr()]: updated,
            },
        });
        if (!isDone)
            showToast('Task completed! Keep up the momentum 🎉');
    };
    // Find next class
    const nowMins = curDate.getHours() * 60 + curDate.getMinutes();
    const nextClass = todayClasses.find((c) => toMins(c.end) > nowMins);
    // Time of day greeting
    const hour = curDate.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    // Weekly study minutes
    const weekAgo = new Date();
    weekAgo.setDate(curDate.getDate() - 7);
    const weekStudyMins = state.sess
        .filter((s) => new Date(`${s.date}T00:00:00`) >= weekAgo)
        .reduce((acc, s) => acc + s.mins, 0);
    return (<ScrollView contentContainerStyle={styles.scrollContent}>
      {/* HERO BANNER CARD */}
      <View style={[styles.heroCard, { backgroundColor: '#1c2f44' }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.heroGreeting}>{greeting}, {state.profile?.name}!</Text>
          <TouchableOpacity style={styles.fieldTag} onPress={openFieldSelector}>
            <Text style={styles.fieldTagText}>
              {getFieldIcon(state.field)} {state.field || 'Select Field'} ✎
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.heroDate}>{curDate.toDateString()}</Text>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{todayClasses.length}</Text>
            <Text style={styles.heroStatLabel}>Classes Today</Text>
          </View>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{pendingAsgs.length}</Text>
            <Text style={styles.heroStatLabel}>Pending Tasks</Text>
          </View>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{streak}d</Text>
            <Text style={styles.heroStatLabel}>🔥 Streak</Text>
          </View>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>Lv {level}</Text>
            <Text style={styles.heroStatLabel}>⭐ {points} pts</Text>
          </View>
        </View>

        {/* QUICK ACTION CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
          <TouchableOpacity style={styles.quickChip} onPress={() => navigateTo('timetable')}>
            <Text style={styles.quickChipText}>+ Class</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickChip} onPress={() => navigateTo('tasks')}>
            <Text style={styles.quickChipText}>+ Assignment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickChip} onPress={() => navigateTo('notes')}>
            <Text style={styles.quickChipText}>+ Note</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickChip} onPress={() => navigateTo('exams')}>
            <Text style={styles.quickChipText}>+ Exam</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickChip} onPress={() => navigateTo('focus')}>
            <Text style={styles.quickChipText}>⏱️ Focus</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* PROMINENT AI ASSISTANT CARD */}
      <TouchableOpacity
        style={{
          backgroundColor: '#1c2f44',
          borderRadius: 18,
          padding: 16,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#385573',
          elevation: 3,
        }}
        onPress={() => navigateTo('ai')}
      >
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: '#5f9bb2',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14
        }}>
          <Ionicons name="sparkles" size={24} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#ffffff' }}>AI Study Assistant</Text>
            <View style={{ backgroundColor: '#2dd4bf', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: '#0f172a' }}>GEMINI LIVE</Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }} numberOfLines={1}>
            Ask doubts, summarize notes & get practice MCQs
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#5f9bb2" />
      </TouchableOpacity>

      {/* DAILY ROUTINE PLANNER CARD */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 18 }}>📅</Text>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Today’s Routine</Text>
          </View>
          <TouchableOpacity style={styles.smallOutlineBtn} onPress={() => setShowRoutineModal(true)}>
            <Text style={styles.smallOutlineBtnText}>{state.rt ? 'Edit Routine' : '+ Set Routine'}</Text>
          </TouchableOpacity>
        </View>

        {activeRoutineTasks.length === 0 ? (<View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              No routine active today. Tap "+ Set Routine" to generate your personalized study & free-time schedule!
            </Text>
          </View>) : (<View style={{ marginTop: 8 }}>
            <View style={styles.progressRow}>
              <Text style={[styles.subNote, { color: theme.subText }]}>
                {doneTodayTaskIds.length} of {activeRoutineTasks.length} tasks completed
              </Text>
              <Text style={[styles.subNote, { color: theme.brand, fontWeight: '700' }]}>
                {Math.round((doneTodayTaskIds.length / activeRoutineTasks.length) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[
                styles.progressBarFill,
                { width: `${Math.min(100, (doneTodayTaskIds.length / activeRoutineTasks.length) * 100)}%` },
            ]}/>
            </View>

            {activeRoutineTasks.slice(0, 5).map((task) => {
                const isDone = doneTodayTaskIds.includes(task.id);
                const startM = toMins(task.start);
                const endM = toMins(task.end);
                const isNow = nowMins >= startM && nowMins <= endM;
                return (<TouchableOpacity key={task.id} style={[
                        styles.routineTaskItem,
                        isNow && { backgroundColor: isDark ? '#1e3a5f' : '#e0f2fe', borderColor: '#5f9bb2' },
                    ]} onPress={() => toggleRoutineTaskDone(task.id)}>
                  <Ionicons name={isDone ? 'checkbox' : 'square-outline'} size={22} color={isDone ? '#10b981' : theme.subText}/>
                  <Text style={{ fontSize: 18 }}>{task.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[
                        styles.taskTitleText,
                        { color: theme.text },
                        isDone && styles.strikethroughText,
                    ]} numberOfLines={1}>
                      {task.title}
                    </Text>
                    <Text style={[styles.taskTimeText, { color: theme.subText }]}>
                      {task.start} – {task.end} {isNow ? '· ● NOW' : ''}
                    </Text>
                  </View>
                </TouchableOpacity>);
            })}

            {activeRoutineTasks.length > 5 && (<TouchableOpacity onPress={() => setShowRoutineModal(true)} style={{ marginTop: 8 }}>
                <Text style={{ color: theme.brand, textAlign: 'center', fontSize: 13, fontWeight: '600' }}>
                  View full routine ({activeRoutineTasks.length} tasks) →
                </Text>
              </TouchableOpacity>)}
          </View>)}
      </View>

      {/* NEXT UP / UPCOMING CLASS CARD */}
      {nextClass && (<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionSubtitle, { color: theme.subText }]}>Next Up</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{nextClass.subject}</Text>
              <Text style={[styles.subNote, { color: theme.subText, marginTop: 2 }]}>
                {nextClass.start} – {nextClass.end} {nextClass.room ? `· Room ${nextClass.room}` : ''}
              </Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: getSubjectColor(state.colors, nextClass.subject) }]}>
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 12 }}>Today</Text>
            </View>
          </View>
        </View>)}

      {/* UPCOMING EXAM COUNTDOWN */}
      {upcomingExams.length > 0 && (<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 18 }}>🎯</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Exam Countdown</Text>
            </View>
            <TouchableOpacity onPress={() => navigateTo('exams')}>
              <Text style={{ color: theme.brand, fontSize: 13, fontWeight: '600' }}>View All →</Text>
            </TouchableOpacity>
          </View>

          {upcomingExams.slice(0, 2).map((ex) => {
                const dl = diffDays(ex.date);
                const isUrgent = dl <= 3;
                return (<View key={ex.id} style={styles.examRowItem}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.examSubjectText, { color: theme.text }]}>{ex.subject}</Text>
                  <Text style={[styles.subNote, { color: theme.subText }]}>{ex.date}</Text>
                </View>
                <View style={[styles.examDaysPill, { backgroundColor: isUrgent ? '#fee2e2' : '#e0f2fe' }]}>
                  <Text style={{ color: isUrgent ? '#dc2626' : '#0369a1', fontWeight: '800', fontSize: 13 }}>
                    {dl === 0 ? 'Today!' : dl === 1 ? 'Tomorrow!' : `${dl} days left`}
                  </Text>
                </View>
              </View>);
            })}
        </View>)}

      {/* STUDY PROGRESS CIRCLE / BAR */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Weekly Study Goal</Text>
          <TouchableOpacity onPress={() => navigateTo('progress')}>
            <Text style={{ color: theme.brand, fontSize: 13, fontWeight: '600' }}>Report →</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.subNote, { color: theme.subText, marginTop: 4 }]}>
          {weekStudyMins} min studied of {state.goal || 300} min weekly goal
        </Text>
        <View style={[styles.progressBarTrack, { height: 10, marginTop: 8 }]}>
          <View style={[
            styles.progressBarFill,
            { width: `${Math.min(100, (weekStudyMins / (state.goal || 300)) * 100)}%`, height: 10 },
        ]}/>
        </View>
      </View>

      {/* TODAY'S CLASSES */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Today’s Classes</Text>
          <TouchableOpacity onPress={() => navigateTo('timetable')}>
            <Text style={{ color: theme.brand, fontSize: 13, fontWeight: '600' }}>Timetable →</Text>
          </TouchableOpacity>
        </View>

        {todayClasses.length === 0 ? (<Text style={[styles.emptyText, { color: theme.subText, marginTop: 6 }]}>
            No classes scheduled for today. Enjoy your day!
          </Text>) : (todayClasses.map((c) => (<View key={c.id} style={styles.classRowItem}>
              <View style={[styles.subjectColorDot, { backgroundColor: getSubjectColor(state.colors, c.subject) }]}/>
              <View style={{ flex: 1 }}>
                <Text style={[styles.classSubject, { color: theme.text }]}>{c.subject}</Text>
                <Text style={[styles.subNote, { color: theme.subText }]}>
                  {c.start} – {c.end} {c.room ? `· Room ${c.room}` : ''}
                </Text>
              </View>
            </View>)))}
      </View>

      {/* PENDING ASSIGNMENTS */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginBottom: 40 }]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Pending Assignments</Text>
          <TouchableOpacity onPress={() => navigateTo('tasks')}>
            <Text style={{ color: theme.brand, fontSize: 13, fontWeight: '600' }}>All ({pendingAsgs.length}) →</Text>
          </TouchableOpacity>
        </View>

        {pendingAsgs.length === 0 ? (<Text style={[styles.emptyText, { color: theme.subText, marginTop: 6 }]}>
            All caught up! No pending assignments.
          </Text>) : (pendingAsgs.slice(0, 3).map((a) => {
            const dl = diffDays(a.due);
            const isOverdue = dl < 0;
            return (<View key={a.id} style={styles.asgRowItem}>
                <TouchableOpacity onPress={() => {
                    const updated = state.asgs.map((x) => x.id === a.id ? { ...x, done: true } : x);
                    updateState({
                        asgs: updated,
                        ad: { ...state.ad, [a.id]: todayStr() },
                    });
                    showToast('Assignment marked completed! +20 points 🎉');
                }}>
                  <Ionicons name="square-outline" size={22} color={theme.subText}/>
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.taskTitleText, { color: theme.text }]} numberOfLines={1}>
                    {a.title}
                  </Text>
                  <Text style={[styles.subNote, { color: theme.subText }]}>
                    {a.subject || 'General'} · Due {a.due} {isOverdue ? '(Overdue!)' : ''}
                  </Text>
                </View>

                <View style={[styles.priorityBadge, a.priority === 'High' ? styles.priHigh : a.priority === 'Medium' ? styles.priMed : styles.priLow]}>
                  <Text style={styles.priorityBadgeText}>{a.priority}</Text>
                </View>
              </View>);
        }))}
      </View>

      {/* ROUTINE MODAL */}
      <RoutineModal visible={showRoutineModal} onClose={() => setShowRoutineModal(false)} state={state} updateState={updateState} theme={theme} showToast={showToast}/>
    </ScrollView>);
}
// ==========================================
// 6. TIMETABLE & MONTHLY CALENDAR SCREEN
// ==========================================
function TimetableScreen({ state, updateState, theme, showToast }) {
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());
    const [viewMode, setViewMode] = useState('daily');
    const [showAddClass, setShowAddClass] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    // Class inputs
    const [subInput, setSubInput] = useState('');
    const [startInput, setStartInput] = useState('09:00');
    const [endInput, setEndInput] = useState('10:30');
    const [roomInput, setRoomInput] = useState('');
    const dayClasses = state.classes
        .filter((c) => c.day === selectedDay)
        .sort((a, b) => a.start.localeCompare(b.start));
    const handleSaveClass = () => {
        if (!subInput.trim()) {
            Alert.alert('Required', 'Please enter a subject name');
            return;
        }
        // Overlap check
        const newStart = toMins(startInput);
        const newEnd = toMins(endInput);
        if (newEnd <= newStart) {
            Alert.alert('Invalid Time', 'End time must be after start time.');
            return;
        }
        const overlap = dayClasses.find((c) => {
            if (editingClass && c.id === editingClass.id)
                return false;
            const cStart = toMins(c.start);
            const cEnd = toMins(c.end);
            return Math.max(newStart, cStart) < Math.min(newEnd, cEnd);
        });
        if (overlap) {
            Alert.alert('Time Conflict', `This overlaps with ${overlap.subject} (${overlap.start} - ${overlap.end}).`);
            return;
        }
        const newItem = {
            id: editingClass ? editingClass.id : uid(),
            subject: subInput.trim(),
            day: selectedDay,
            start: startInput,
            end: endInput,
            room: roomInput.trim() || undefined,
        };
        const updated = editingClass
            ? state.classes.map((c) => c.id === editingClass.id ? newItem : c)
            : [...state.classes, newItem];
        updateState({ classes: updated });
        setShowAddClass(false);
        setEditingClass(null);
        setSubInput('');
        setRoomInput('');
        showToast(editingClass ? 'Class updated!' : 'Class added!');
    };
    const handleDeleteClass = (id) => {
        Alert.alert('Delete Class', 'Are you sure you want to delete this class?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    updateState({ classes: state.classes.filter((c) => c.id !== id) });
                    showToast('Class deleted');
                },
            },
        ]);
    };
    return (<View style={{ flex: 1 }}>
      {/* HEADER CONTROLS */}
      <View style={[styles.subHeader, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        <View style={styles.segmentContainer}>
          <TouchableOpacity style={[styles.segmentBtn, viewMode === 'daily' && styles.segmentBtnActive]} onPress={() => setViewMode('daily')}>
            <Text style={[styles.segmentBtnText, viewMode === 'daily' && styles.segmentBtnTextActive]}>
              Daily View
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.segmentBtn, viewMode === 'monthly' && styles.segmentBtnActive]} onPress={() => setViewMode('monthly')}>
            <Text style={[styles.segmentBtnText, viewMode === 'monthly' && styles.segmentBtnTextActive]}>
              Monthly Calendar
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'daily' && (<TouchableOpacity style={styles.addBtnCircle} onPress={() => {
                setEditingClass(null);
                setSubInput('');
                setRoomInput('');
                setShowAddClass(true);
            }}>
            <Ionicons name="add" size={24} color="#ffffff"/>
          </TouchableOpacity>)}
      </View>

      {viewMode === 'daily' ? (<ScrollView contentContainerStyle={styles.scrollContent}>
          {/* DAY PILLS */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayPillsScroll}>
            {DAYS_OF_WEEK.map((d, idx) => (<TouchableOpacity key={d} style={[
                    styles.dayPill,
                    selectedDay === idx && { backgroundColor: theme.brand, borderColor: theme.brand },
                ]} onPress={() => setSelectedDay(idx)}>
                <Text style={[styles.dayPillText, selectedDay === idx && { color: '#ffffff', fontWeight: '700' }]}>
                  {d}
                </Text>
              </TouchableOpacity>))}
          </ScrollView>

          {/* CLASSES LIST */}
          {dayClasses.length === 0 ? (<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, alignItems: 'center', padding: 24 }]}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>📅</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No classes on {DAYS_OF_WEEK[selectedDay]}</Text>
              <Text style={[styles.emptySubtitle, { color: theme.subText, textAlign: 'center' }]}>
                Tap the "+" button above to add a lecture, lab, or tutorial.
              </Text>
            </View>) : (dayClasses.map((c) => (<View key={c.id} style={[styles.classCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={[styles.classColorStrip, { backgroundColor: getSubjectColor(state.colors, c.subject) }]}/>
                <View style={{ flex: 1, padding: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.classTitleText, { color: theme.text }]}>{c.subject}</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity onPress={() => {
                    setEditingClass(c);
                    setSubInput(c.subject);
                    setStartInput(c.start);
                    setEndInput(c.end);
                    setRoomInput(c.room || '');
                    setShowAddClass(true);
                }}>
                        <Ionicons name="create-outline" size={20} color={theme.brand}/>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteClass(c.id)}>
                        <Ionicons name="trash-outline" size={20} color="#ef4444"/>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.subNote, { color: theme.subText, marginTop: 4 }]}>
                    ⏰ {c.start} – {c.end} {c.room ? `· 📍 Room ${c.room}` : ''}
                  </Text>
                </View>
              </View>)))}
        </ScrollView>) : (<MonthlyCalendarView state={state} theme={theme}/>)}

      {/* ADD / EDIT CLASS MODAL */}
      <Modal visible={showAddClass} transparent animationType="slide" onRequestClose={() => setShowAddClass(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </Text>

            <Text style={styles.inputLabel}>Subject Name</Text>
            <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. Data Structures" placeholderTextColor="#94a3b8" value={subInput} onChangeText={setSubInput}/>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Start Time (HH:MM)</Text>
                <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="09:00" placeholderTextColor="#94a3b8" value={startInput} onChangeText={setStartInput}/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>End Time (HH:MM)</Text>
                <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="10:30" placeholderTextColor="#94a3b8" value={endInput} onChangeText={setEndInput}/>
              </View>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Room / Lab (Optional)</Text>
            <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. Lab 3, Hall B" placeholderTextColor="#94a3b8" value={roomInput} onChangeText={setRoomInput}/>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => {
            setShowAddClass(false);
            setEditingClass(null);
        }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveClass}>
                <Text style={styles.saveBtnText}>Save Class</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>);
}
// Monthly Calendar Component
function MonthlyCalendarView({ state, theme }) {
    const [curMonthDate, setCurMonthDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const [selectedDate, setSelectedDate] = useState(todayStr());
    const year = curMonthDate.getFullYear();
    const month = curMonthDate.getMonth();
    const monthName = curMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonth = () => setCurMonthDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurMonthDate(new Date(year, month + 1, 1));
    // Items for selected date
    const selDateObj = new Date(`${selectedDate}T00:00:00`);
    const selDayIdx = selDateObj.getDay();
    const selClasses = state.classes.filter(c => c.day === selDayIdx);
    const selAsgs = state.asgs.filter(a => a.due === selectedDate);
    const selExams = state.exams.filter(e => e.date === selectedDate);
    const gridCells = [];
    for (let i = 0; i < firstDay; i++)
        gridCells.push(null);
    for (let day = 1; day <= daysInMonth; day++)
        gridCells.push(day);
    return (<ScrollView contentContainerStyle={styles.scrollContent}>
      {/* MONTH HEADER */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeaderRow}>
          <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
            <Text style={{ fontSize: 18, color: theme.brand }}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{monthName}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
            <Text style={{ fontSize: 18, color: theme.brand }}>→</Text>
          </TouchableOpacity>
        </View>

        {/* DAY LABELS */}
        <View style={styles.calDaysRow}>
          {DAYS_OF_WEEK.map(d => (<Text key={d} style={[styles.calDayLabel, { color: theme.subText }]}>{d}</Text>))}
        </View>

        {/* CALENDAR GRID */}
        <View style={styles.calGrid}>
          {gridCells.map((day, idx) => {
            if (!day)
                return <View key={`empty-${idx}`} style={styles.calCell}/>;
            const dateStr = `${year}-${pad2(month + 1)}-${pad2(day)}`;
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr();
            const dateObj = new Date(`${dateStr}T00:00:00`);
            const dayOfWeek = dateObj.getDay();
            const cCount = state.classes.filter(c => c.day === dayOfWeek).length;
            const aCount = state.asgs.filter(a => a.due === dateStr).length;
            const eCount = state.exams.filter(e => e.date === dateStr).length;
            return (<TouchableOpacity key={`day-${day}`} style={[
                    styles.calCell,
                    isSelected && { backgroundColor: theme.brand },
                    isToday && !isSelected && { borderColor: theme.brand, borderWidth: 1.5 },
                ]} onPress={() => setSelectedDate(dateStr)}>
                <Text style={[styles.calCellText, { color: isSelected ? '#ffffff' : theme.text }]}>
                  {day}
                </Text>

                <View style={styles.calDotsRow}>
                  {cCount > 0 && <View style={[styles.calDot, { backgroundColor: isSelected ? '#ffffff' : '#5f9bb2' }]}/>}
                  {aCount > 0 && <Text style={{ fontSize: 8 }}>📝</Text>}
                  {eCount > 0 && <Text style={{ fontSize: 8 }}>🎯</Text>}
                </View>
              </TouchableOpacity>);
        })}
        </View>

        <Text style={[styles.subNote, { color: theme.subText, marginTop: 10, textAlign: 'center' }]}>
          Dots = Classes · 📝 Assignment Due · 🎯 Exam
        </Text>
      </View>

      {/* SELECTED DATE DETAILS */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 8 }]}>
          Schedule for {selectedDate}
        </Text>

        {selClasses.length === 0 && selAsgs.length === 0 && selExams.length === 0 ? (<Text style={[styles.emptyText, { color: theme.subText }]}>Nothing scheduled for this day.</Text>) : (<View>
            {selClasses.map(c => (<Text key={c.id} style={[styles.scheduleItemLine, { color: theme.text }]}>
                📅 {c.subject} · {c.start}–{c.end} {c.room ? `· Room ${c.room}` : ''}
              </Text>))}
            {selAsgs.map(a => (<Text key={a.id} style={[styles.scheduleItemLine, { color: '#f59e0b' }]}>
                📝 Assignment Due: {a.title} ({a.priority} Priority{a.done ? ', Done' : ''})
              </Text>))}
            {selExams.map(e => (<Text key={e.id} style={[styles.scheduleItemLine, { color: '#ef4444' }]}>
                🎯 Exam: {e.subject}
              </Text>))}
          </View>)}
      </View>
    </ScrollView>);
}
// ==========================================
// 7. ASSIGNMENTS SCREEN
// ==========================================
function AssignmentsScreen({ state, updateState, theme, showToast }) {
    const [filter, setFilter] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAsg, setEditingAsg] = useState(null);
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [due, setDue] = useState(todayStr());
    const [priority, setPriority] = useState('Medium');
    const [desc, setDesc] = useState('');
    const filtered = state.asgs.filter((a) => {
        if (filter === 'Pending')
            return !a.done;
        if (filter === 'Done')
            return a.done;
        return true;
    }).sort((a, b) => diffDays(a.due) - diffDays(b.due));
    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Required', 'Please enter an assignment title');
            return;
        }
        const newItem = {
            id: editingAsg ? editingAsg.id : uid(),
            title: title.trim(),
            subject: subject.trim() || undefined,
            due: due.trim() || todayStr(),
            priority,
            desc: desc.trim() || undefined,
            done: editingAsg ? editingAsg.done : false,
        };
        const updated = editingAsg
            ? state.asgs.map((a) => a.id === editingAsg.id ? newItem : a)
            : [...state.asgs, newItem];
        updateState({ asgs: updated });
        setShowAddModal(false);
        setEditingAsg(null);
        setTitle('');
        setSubject('');
        setDesc('');
        showToast(editingAsg ? 'Assignment updated!' : 'Assignment saved!');
    };
    const handleDelete = (id) => {
        Alert.alert('Delete', 'Delete this assignment?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    updateState({ asgs: state.asgs.filter((a) => a.id !== id) });
                    showToast('Assignment deleted');
                },
            },
        ]);
    };
    const handleExportPDF = async (item = null) => {
        try {
            const itemsToExport = item ? [item] : state.asgs;
            const textReport = itemsToExport.map(a => `• ${a.title} [${a.due || 'No date'}] (${a.priority} priority)${a.done ? ' [Completed]' : ''}${a.desc ? '\n  ' + a.desc : ''}`).join('\n\n');
            await safeExportPDF('StudyHub Assignments Report', '', textReport);
        } catch (err) {
            Alert.alert('Error', 'Could not export assignments');
        }
    };
    return (<View style={{ flex: 1 }}>
      {/* FILTER TABS & ACTIONS */}
      <View style={[styles.subHeader, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {['All', 'Pending', 'Done'].map(f => (<TouchableOpacity key={f} style={[styles.filterChip, filter === f && { backgroundColor: theme.brand, borderColor: theme.brand }]} onPress={() => setFilter(f)}>
              <Text style={[styles.filterChipText, filter === f && { color: '#ffffff', fontWeight: '700' }]}>
                {f}
              </Text>
            </TouchableOpacity>))}
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.iconOutlineBtn} onPress={() => handleExportPDF()}>
            <Ionicons name="download-outline" size={20} color={theme.brand}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtnCircle} onPress={() => {
            setEditingAsg(null);
            setTitle('');
            setSubject('');
            setDue(todayStr());
            setDesc('');
            setShowAddModal(true);
        }}>
            <Ionicons name="add" size={24} color="#ffffff"/>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filtered.length === 0 ? (<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, alignItems: 'center', padding: 24 }]}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>📝</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No assignments found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.subText, textAlign: 'center' }]}>
              {filter === 'Pending' ? 'All assignments completed!' : 'Tap "+" to record an upcoming deadline.'}
            </Text>
          </View>) : (filtered.map((a) => {
            const dl = diffDays(a.due);
            const isOverdue = !a.done && dl < 0;
            return (<View key={a.id} style={[styles.asgCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.asgCardTop}>
                  <TouchableOpacity onPress={() => {
                    const updated = state.asgs.map((x) => x.id === a.id ? { ...x, done: !x.done } : x);
                    const newAd = { ...state.ad };
                    if (!a.done)
                        newAd[a.id] = todayStr();
                    updateState({ asgs: updated, ad: newAd });
                    showToast(a.done ? 'Marked pending' : 'Completed! +20 points 🎉');
                }}>
                    <Ionicons name={a.done ? 'checkbox' : 'square-outline'} size={24} color={a.done ? '#10b981' : theme.subText}/>
                  </TouchableOpacity>

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[
                    styles.asgTitleText,
                    { color: theme.text },
                    a.done && styles.strikethroughText,
                ]}>
                      {a.title}
                    </Text>
                    <Text style={[styles.subNote, { color: theme.subText }]}>
                      {a.subject || 'General'} · Due {a.due} {isOverdue ? '· ⚠️ Overdue' : dl === 0 ? '· Due Today' : dl === 1 ? '· Tomorrow' : `· in ${dl}d`}
                    </Text>
                  </View>

                  <View style={[styles.priorityBadge, a.priority === 'High' ? styles.priHigh : a.priority === 'Medium' ? styles.priMed : styles.priLow]}>
                    <Text style={styles.priorityBadgeText}>{a.priority}</Text>
                  </View>
                </View>

                {a.desc ? (<Text style={[styles.asgDescText, { color: theme.subText }]}>{a.desc}</Text>) : null}

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity style={styles.smallCardAction} onPress={() => handleExportPDF(a)}>
                    <Ionicons name="document-text-outline" size={16} color={theme.brand}/>
                    <Text style={{ color: theme.brand, fontSize: 12, fontWeight: '600' }}>PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.smallCardAction} onPress={() => {
                    setEditingAsg(a);
                    setTitle(a.title);
                    setSubject(a.subject || '');
                    setDue(a.due);
                    setPriority(a.priority);
                    setDesc(a.desc || '');
                    setShowAddModal(true);
                }}>
                    <Ionicons name="create-outline" size={16} color={theme.brand}/>
                    <Text style={{ color: theme.brand, fontSize: 12, fontWeight: '600' }}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.smallCardAction} onPress={() => handleDelete(a.id)}>
                    <Ionicons name="trash-outline" size={16} color="#ef4444"/>
                    <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>);
        }))}
      </ScrollView>

      {/* ADD / EDIT ASSIGNMENT MODAL */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingAsg ? 'Edit Assignment' : 'New Assignment'}
            </Text>

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. Lab Report 4" placeholderTextColor="#94a3b8" value={title} onChangeText={setTitle}/>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. Physics" placeholderTextColor="#94a3b8" value={subject} onChangeText={setSubject}/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Due Date (YYYY-MM-DD)</Text>
                <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="2026-11-05" placeholderTextColor="#94a3b8" value={due} onChangeText={setDue}/>
              </View>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Priority</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              {['High', 'Medium', 'Low'].map(p => (<TouchableOpacity key={p} style={[
                styles.prioritySelectBtn,
                priority === p && { backgroundColor: theme.brand, borderColor: theme.brand },
            ]} onPress={() => setPriority(p)}>
                  <Text style={[styles.prioritySelectText, priority === p && { color: '#ffffff' }]}>
                    {p}
                  </Text>
                </TouchableOpacity>))}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Description / Requirements</Text>
            <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border, height: 75, textAlignVertical: 'top' }]} placeholder="Notes, references, instructions..." placeholderTextColor="#94a3b8" multiline value={desc} onChangeText={setDesc}/>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => {
            setShowAddModal(false);
            setEditingAsg(null);
        }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>);
}
// ==========================================
// 8. NOTES SCREEN
// ==========================================
function NotesScreen({ state, updateState, theme, showToast }) {
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [readingNote, setReadingNote] = useState(null);
    const [editingNote, setEditingNote] = useState(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const filtered = state.notes.filter((n) => {
        const q = search.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    }).sort((a, b) => b.updated - a.updated);
    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Required', 'Please enter a note title');
            return;
        }
        const newItem = {
            id: editingNote ? editingNote.id : uid(),
            title: title.trim(),
            body: body.trim(),
            updated: Date.now(),
        };
        const updated = editingNote
            ? state.notes.map((n) => n.id === editingNote.id ? newItem : n)
            : [...state.notes, newItem];
        updateState({ notes: updated });
        setShowAddModal(false);
        setEditingNote(null);
        setTitle('');
        setBody('');
        showToast(editingNote ? 'Note updated!' : 'Note created! +3 points');
    };
    const handleDelete = (id) => {
        Alert.alert('Delete Note', 'Delete this note?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    updateState({ notes: state.notes.filter((n) => n.id !== id) });
                    if (readingNote && readingNote.id === id)
                        setReadingNote(null);
                    showToast('Note deleted');
                },
            },
        ]);
    };
    const handleExportPDF = async (note) => {
        try {
            const content = `${note.title}\nUpdated: ${new Date(note.updated).toDateString()}\n\n${note.body}`;
            await safeExportPDF(note.title, '', content);
        } catch (err) {
            Alert.alert('Error', 'Could not export note');
        }
    };
    return (<View style={{ flex: 1 }}>
      {/* SEARCH BAR & ADD */}
      <View style={[styles.subHeader, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        <View style={[styles.searchBarBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.subText}/>
          <TextInput style={[styles.searchBarInput, { color: theme.text }]} placeholder="Search notes..." placeholderTextColor="#94a3b8" value={search} onChangeText={setSearch}/>
          {search ? (<TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={theme.subText}/>
            </TouchableOpacity>) : null}
        </View>

        <TouchableOpacity style={styles.addBtnCircle} onPress={() => {
            setEditingNote(null);
            setTitle('');
            setBody('');
            setShowAddModal(true);
        }}>
          <Ionicons name="add" size={24} color="#ffffff"/>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filtered.length === 0 ? (<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, alignItems: 'center', padding: 24 }]}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🗒️</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No notes yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.subText, textAlign: 'center' }]}>
              Keep formula sheets, study summaries, and quick reminders here.
            </Text>
          </View>) : (filtered.map((n) => (<TouchableOpacity key={n.id} style={[styles.noteCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]} onPress={() => setReadingNote(n)}>
              <Text style={[styles.noteCardTitle, { color: theme.text }]} numberOfLines={1}>
                {n.title}
              </Text>
              <Text style={[styles.noteCardSnippet, { color: theme.subText }]} numberOfLines={3}>
                {n.body || 'No text content.'}
              </Text>
              <Text style={[styles.subNote, { color: theme.brand, marginTop: 8 }]}>
                {new Date(n.updated).toLocaleDateString()} · Tap to read
              </Text>
            </TouchableOpacity>)))}
      </ScrollView>

      {/* READ NOTE MODAL */}
      <Modal visible={!!readingNote} transparent animationType="slide" onRequestClose={() => setReadingNote(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, maxHeight: '85%' }]}>
            {readingNote && (<>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.modalTitle, { color: theme.text, flex: 1 }]} numberOfLines={1}>
                    {readingNote.title}
                  </Text>
                  <TouchableOpacity onPress={() => setReadingNote(null)}>
                    <Ionicons name="close" size={24} color={theme.subText}/>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.subNote, { color: theme.subText, marginBottom: 12 }]}>
                  Last updated {new Date(readingNote.updated).toDateString()}
                </Text>

                <ScrollView style={{ maxHeight: 350 }}>
                  <Text style={[styles.noteBodyText, { color: theme.text }]}>
                    {readingNote.body}
                  </Text>
                </ScrollView>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity style={styles.smallCardAction} onPress={() => handleExportPDF(readingNote)}>
                    <Ionicons name="download-outline" size={18} color={theme.brand}/>
                    <Text style={{ color: theme.brand, fontWeight: '600' }}>Export PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.smallCardAction} onPress={() => {
                setEditingNote(readingNote);
                setTitle(readingNote.title);
                setBody(readingNote.body);
                setReadingNote(null);
                setShowAddModal(true);
            }}>
                    <Ionicons name="create-outline" size={18} color={theme.brand}/>
                    <Text style={{ color: theme.brand, fontWeight: '600' }}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.smallCardAction} onPress={() => handleDelete(readingNote.id)}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444"/>
                    <Text style={{ color: '#ef4444', fontWeight: '600' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>)}
          </View>
        </View>
      </Modal>

      {/* ADD / EDIT NOTE MODAL */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, maxHeight: '85%' }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingNote ? 'Edit Note' : 'New Note'}
            </Text>

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. Organic Chemistry Reactions" placeholderTextColor="#94a3b8" value={title} onChangeText={setTitle}/>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Note Content</Text>
            <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border, height: 200, textAlignVertical: 'top' }]} placeholder="Write your notes, formulas, summaries..." placeholderTextColor="#94a3b8" multiline value={body} onChangeText={setBody}/>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => {
            setShowAddModal(false);
            setEditingNote(null);
        }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>);
}
// ==========================================
// 9. LECTURE JOURNAL SCREEN
// ==========================================
function LectureJournalScreen({ state, updateState, theme, showToast }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [search, setSearch] = useState('');
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [date, setDate] = useState(todayStr());
    const [body, setBody] = useState('');
    const [images, setImages] = useState([]);
    const [zoomedImage, setZoomedImage] = useState(null);
    const filtered = state.lec.filter((l) => {
        const q = search.toLowerCase();
        return l.title.toLowerCase().includes(q) || l.subject.toLowerCase().includes(q) || l.body.toLowerCase().includes(q);
    }).sort((a, b) => b.date.localeCompare(a.date));
    const pickImage = async (useCamera) => {
        if (images.length >= 6) {
            Alert.alert('Limit Reached', 'You can attach up to 6 board photos per lecture.');
            return;
        }
        if (typeof document !== 'undefined') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            if (useCamera) input.capture = 'environment';
            input.onchange = (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                        if (re.target && re.target.result) {
                            setImages(prev => [...prev, re.target.result]);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
            return;
        }
        setImages(prev => [...prev, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop']);
        Alert.alert('Photo Attached', 'Board photo placeholder added.');
    };
    const handleSave = () => {
        if (!title.trim() || !subject.trim()) {
            Alert.alert('Required', 'Please enter a lecture title and subject.');
            return;
        }
        const newItem = {
            id: uid(),
            title: title.trim(),
            subject: subject.trim(),
            date,
            body: body.trim(),
            n: images.length,
            ts: Date.now(),
            images,
        };
        updateState({
            lec: [newItem, ...state.lec],
        });
        setShowAddModal(false);
        setTitle('');
        setSubject('');
        setBody('');
        setImages([]);
        showToast('Lecture logged! +5 points 🎉');
    };
    const handleExportPDF = async (l) => {
        try {
            const content = `${l.title}\nSubject: ${l.subject} | Date: ${l.date}\n\n${l.body}`;
            await safeExportPDF(l.title, '', content);
        } catch (err) {
            Alert.alert('Error', 'Could not export lecture');
        }
    };
    return (<View style={{ flex: 1 }}>
      <View style={[styles.subHeader, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        <View style={[styles.searchBarBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.subText}/>
          <TextInput style={[styles.searchBarInput, { color: theme.text }]} placeholder="Search lectures..." placeholderTextColor="#94a3b8" value={search} onChangeText={setSearch}/>
        </View>

        <TouchableOpacity style={styles.addBtnCircle} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#ffffff"/>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filtered.length === 0 ? (<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, alignItems: 'center', padding: 24 }]}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🎓</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No lectures logged</Text>
            <Text style={[styles.emptySubtitle, { color: theme.subText, textAlign: 'center' }]}>
              After each class, log what you studied and snap a photo of the classroom board.
            </Text>
          </View>) : (filtered.map((l) => (<TouchableOpacity key={l.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]} onPress={() => setSelectedLecture(l)}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{l.title}</Text>
                  <Text style={[styles.subNote, { color: theme.subText, marginTop: 2 }]}>
                    {l.subject} · {l.date} {l.n > 0 ? `· 📷 ${l.n} photos` : ''}
                  </Text>
                </View>
                <View style={[styles.badgePill, { backgroundColor: getSubjectColor(state.colors, l.subject) }]}>
                  <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 11 }}>{l.subject}</Text>
                </View>
              </View>

              {l.body ? (<Text style={[styles.noteCardSnippet, { color: theme.subText, marginTop: 8 }]} numberOfLines={2}>
                  {l.body}
                </Text>) : null}
            </TouchableOpacity>)))}
      </ScrollView>

      {/* LECTURE DETAIL MODAL */}
      <Modal visible={!!selectedLecture} transparent animationType="slide" onRequestClose={() => setSelectedLecture(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, maxHeight: '85%' }]}>
            {selectedLecture && (<>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedLecture.title}</Text>
                    <Text style={[styles.subNote, { color: theme.subText }]}>
                      {selectedLecture.subject} · {selectedLecture.date}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedLecture(null)}>
                    <Ionicons name="close" size={24} color={theme.subText}/>
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ marginVertical: 12 }}>
                  <Text style={[styles.noteBodyText, { color: theme.text }]}>
                    {selectedLecture.body || 'No description entered.'}
                  </Text>

                  {selectedLecture.images && selectedLecture.images.length > 0 && (<View style={{ marginTop: 14 }}>
                      <Text style={[styles.inputLabel, { marginBottom: 6 }]}>Board Photos ({selectedLecture.images.length}):</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {selectedLecture.images.map((uri, idx) => (<TouchableOpacity key={idx} onPress={() => setZoomedImage(uri)}>
                            <Image source={{ uri }} style={styles.lecturePhotoThumbnail}/>
                          </TouchableOpacity>))}
                      </View>
                    </View>)}
                </ScrollView>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity style={styles.smallCardAction} onPress={() => {
                updateState({
                    notes: [
                        ...state.notes,
                        {
                            id: uid(),
                            title: `${selectedLecture.subject}: ${selectedLecture.title}`,
                            body: selectedLecture.body,
                            updated: Date.now(),
                        },
                    ],
                });
                showToast('Saved to Notes! ✓');
            }}>
                    <Ionicons name="bookmark-outline" size={18} color={theme.brand}/>
                    <Text style={{ color: theme.brand, fontWeight: '600' }}>Save to Notes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.smallCardAction} onPress={() => handleExportPDF(selectedLecture)}>
                    <Ionicons name="download-outline" size={18} color={theme.brand}/>
                    <Text style={{ color: theme.brand, fontWeight: '600' }}>Export PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.smallCardAction} onPress={() => {
                updateState({ lec: state.lec.filter((x) => x.id !== selectedLecture.id) });
                setSelectedLecture(null);
                showToast('Lecture deleted');
            }}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444"/>
                    <Text style={{ color: '#ef4444', fontWeight: '600' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>)}
          </View>
        </View>
      </Modal>

      {/* ZOOMED BOARD PHOTO MODAL */}
      <Modal visible={!!zoomedImage} transparent animationType="fade" onRequestClose={() => setZoomedImage(null)}>
        <View style={styles.zoomOverlay}>
          <TouchableOpacity style={styles.zoomCloseBtn} onPress={() => setZoomedImage(null)}>
            <Ionicons name="close" size={28} color="#ffffff"/>
          </TouchableOpacity>
          {zoomedImage && (<Image source={{ uri: zoomedImage }} style={styles.zoomedImage} resizeMode="contain"/>)}
        </View>
      </Modal>

      {/* ADD LECTURE MODAL */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, maxHeight: '90%' }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Lecture Log</Text>

            <ScrollView>
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. Physics" placeholderTextColor="#94a3b8" value={subject} onChangeText={setSubject}/>

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Lecture Title</Text>
              <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. Chapter 3: Newton's Laws" placeholderTextColor="#94a3b8" value={title} onChangeText={setTitle}/>

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Aaj kya parha / kya kaam hua?</Text>
              <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border, height: 90, textAlignVertical: 'top' }]} placeholder="Topics covered, homework given, important concepts..." placeholderTextColor="#94a3b8" multiline value={body} onChangeText={setBody}/>

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Board Photos ({images.length}/6)</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <TouchableOpacity style={styles.photoPickerBtn} onPress={() => pickImage(true)}>
                  <Ionicons name="camera" size={18} color="#5f9bb2"/>
                  <Text style={styles.photoPickerText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.photoPickerBtn} onPress={() => pickImage(false)}>
                  <Ionicons name="images" size={18} color="#5f9bb2"/>
                  <Text style={styles.photoPickerText}>Gallery</Text>
                </TouchableOpacity>
              </View>

              {images.length > 0 && (<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {images.map((uri, idx) => (<View key={idx} style={{ position: 'relative' }}>
                      <Image source={{ uri }} style={styles.lecturePhotoThumbnail}/>
                      <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setImages(prev => prev.filter((_, i) => i !== idx))}>
                        <Ionicons name="close" size={12} color="#ffffff"/>
                      </TouchableOpacity>
                    </View>))}
                </View>)}
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Lecture</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>);
}
// ==========================================
// 10. EXAM COUNTDOWN SCREEN
// ==========================================
function ExamCountdownScreen({ state, updateState, theme, showToast }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [subject, setSubject] = useState('');
    const [date, setDate] = useState(todayStr());
    const [notes, setNotes] = useState('');
    const exams = [...state.exams].sort((a, b) => diffDays(a.date) - diffDays(b.date));
    const handleSave = () => {
        if (!subject.trim()) {
            Alert.alert('Required', 'Please enter an exam subject');
            return;
        }
        const newItem = {
            id: uid(),
            subject: subject.trim(),
            date,
            notes: notes.trim() || undefined,
        };
        updateState({ exams: [...state.exams, newItem] });
        setShowAddModal(false);
        setSubject('');
        setNotes('');
        showToast('Exam added to countdown!');
    };
    const handleDelete = (id) => {
        Alert.alert('Delete Exam', 'Delete this exam schedule?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    updateState({ exams: state.exams.filter((e) => e.id !== id) });
                    showToast('Exam removed');
                },
            },
        ]);
    };
    return (<ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.cardHeaderRow}>
        <Text style={[styles.screenHeaderTitle, { color: theme.text }]}>🎯 Exam Countdown</Text>
        <TouchableOpacity style={styles.addBtnCircle} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#ffffff"/>
        </TouchableOpacity>
      </View>

      {exams.length === 0 ? (<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, alignItems: 'center', padding: 24, marginTop: 12 }]}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>🎯</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No upcoming exams</Text>
          <Text style={[styles.emptySubtitle, { color: theme.subText, textAlign: 'center' }]}>
            Add midterms or finals to automatically calculate countdown days and study slots!
          </Text>
        </View>) : (exams.map((e) => {
            const dl = diffDays(e.date);
            const isPassed = dl < 0;
            const isUrgent = dl >= 0 && dl <= 3;
            return (<View key={e.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 10 }]}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{e.subject}</Text>
                  <Text style={[styles.subNote, { color: theme.subText }]}>Date: {e.date}</Text>
                </View>

                <View style={[styles.examDaysPill, { backgroundColor: isPassed ? '#f1f5f9' : isUrgent ? '#fee2e2' : '#e0f2fe' }]}>
                  <Text style={{ color: isPassed ? '#94a3b8' : isUrgent ? '#dc2626' : '#0369a1', fontWeight: '800', fontSize: 13 }}>
                    {isPassed ? 'Passed' : dl === 0 ? 'Today!' : dl === 1 ? 'Tomorrow!' : `${dl} days left`}
                  </Text>
                </View>
              </View>

              {e.notes ? (<Text style={[styles.subNote, { color: theme.text, marginTop: 8 }]}>
                  Syllabus / Notes: {e.notes}
                </Text>) : null}

              <View style={[styles.cardActionsRow, { marginTop: 12 }]}>
                <TouchableOpacity style={styles.smallCardAction} onPress={() => handleDelete(e.id)}>
                  <Ionicons name="trash-outline" size={16} color="#ef4444"/>
                  <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>);
        }))}

      {/* ADD EXAM MODAL */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Upcoming Exam</Text>

            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. Operating Systems" placeholderTextColor="#94a3b8" value={subject} onChangeText={setSubject}/>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Exam Date (YYYY-MM-DD)</Text>
            <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="2026-11-20" placeholderTextColor="#94a3b8" value={date} onChangeText={setDate}/>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Syllabus / Focus Topics (Optional)</Text>
            <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border, height: 75, textAlignVertical: 'top' }]} placeholder="e.g. Chapters 1–5, past papers..." placeholderTextColor="#94a3b8" multiline value={notes} onChangeText={setNotes}/>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Exam</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>);
}
// ==========================================
// 11. STUDY MATERIALS SCREEN
// ==========================================
function StudyMaterialsScreen({ state, updateState, theme, showToast }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedMat, setSelectedMat] = useState(null);
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [kind, setKind] = useState('note');
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Required', 'Please enter a title');
            return;
        }
        const newItem = {
            id: uid(),
            title: title.trim(),
            subject: subject.trim() || 'General',
            kind,
            date: todayStr(),
            url: kind === 'link' ? url.trim() : undefined,
            text: kind === 'note' ? text.trim() : undefined,
        };
        updateState({ mats: [newItem, ...state.mats] });
        setShowAddModal(false);
        setTitle('');
        setSubject('');
        setUrl('');
        setText('');
        showToast('Study material saved! +2 points');
    };
    const handleDelete = (id) => {
        updateState({ mats: state.mats.filter((m) => m.id !== id) });
        if (selectedMat && selectedMat.id === id)
            setSelectedMat(null);
        showToast('Material deleted');
    };
    return (<ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.cardHeaderRow}>
        <Text style={[styles.screenHeaderTitle, { color: theme.text }]}>📚 Study Materials</Text>
        <TouchableOpacity style={styles.addBtnCircle} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#ffffff"/>
        </TouchableOpacity>
      </View>

      {state.mats.length === 0 ? (<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, alignItems: 'center', padding: 24, marginTop: 12 }]}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>📚</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No study materials</Text>
          <Text style={[styles.emptySubtitle, { color: theme.subText, textAlign: 'center' }]}>
            Store helpful textbook links, reference notes, and study guides by subject.
          </Text>
        </View>) : (state.mats.map((m) => (<View key={m.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 10 }]}>
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {m.kind === 'link' ? '🔗' : m.kind === 'pdf' ? '📄' : '📝'} {m.title}
                </Text>
                <Text style={[styles.subNote, { color: theme.subText, marginTop: 2 }]}>
                  {m.subject} · {m.date}
                </Text>
              </View>
              <View style={[styles.badgePill, { backgroundColor: getSubjectColor(state.colors, m.subject) }]}>
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 11 }}>{m.subject}</Text>
              </View>
            </View>

            {m.kind === 'note' && m.text ? (<Text style={[styles.subNote, { color: theme.text, marginTop: 8 }]} numberOfLines={2}>
                {m.text}
              </Text>) : null}

            <View style={[styles.cardActionsRow, { marginTop: 12 }]}>
              {m.kind === 'note' && (<TouchableOpacity style={styles.smallCardAction} onPress={() => setSelectedMat(m)}>
                  <Ionicons name="eye-outline" size={16} color={theme.brand}/>
                  <Text style={{ color: theme.brand, fontSize: 12, fontWeight: '600' }}>Read</Text>
                </TouchableOpacity>)}
              {m.kind === 'link' && m.url && (<TouchableOpacity style={styles.smallCardAction} onPress={() => Share.share({ message: m.url })}>
                  <Ionicons name="share-outline" size={16} color={theme.brand}/>
                  <Text style={{ color: theme.brand, fontSize: 12, fontWeight: '600' }}>Share</Text>
                </TouchableOpacity>)}
              <TouchableOpacity style={styles.smallCardAction} onPress={() => handleDelete(m.id)}>
                <Ionicons name="trash-outline" size={16} color="#ef4444"/>
                <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>)))}

      {/* READ MATERIAL MODAL */}
      <Modal visible={!!selectedMat} transparent animationType="slide" onRequestClose={() => setSelectedMat(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            {selectedMat && (<>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedMat.title}</Text>
                <ScrollView style={{ maxHeight: 250, marginVertical: 12 }}>
                  <Text style={[styles.noteBodyText, { color: theme.text }]}>{selectedMat.text}</Text>
                </ScrollView>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => setSelectedMat(null)}>
                  <Text style={styles.primaryBtnText}>Close</Text>
                </TouchableOpacity>
              </>)}
          </View>
        </View>
      </Modal>

      {/* ADD MATERIAL MODAL */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Study Material</Text>

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. Chapter Summary" placeholderTextColor="#94a3b8" value={title} onChangeText={setTitle}/>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Subject</Text>
            <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. Computer Science" placeholderTextColor="#94a3b8" value={subject} onChangeText={setSubject}/>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Resource Type</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              {['note', 'link'].map(k => (<TouchableOpacity key={k} style={[styles.prioritySelectBtn, kind === k && { backgroundColor: theme.brand, borderColor: theme.brand }]} onPress={() => setKind(k)}>
                  <Text style={[styles.prioritySelectText, kind === k && { color: '#ffffff' }]}>
                    {k === 'note' ? '📝 Text Note' : '🔗 Web Link'}
                  </Text>
                </TouchableOpacity>))}
            </View>

            {kind === 'link' ? (<>
                <Text style={[styles.inputLabel, { marginTop: 12 }]}>URL Link</Text>
                <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="https://..." placeholderTextColor="#94a3b8" value={url} onChangeText={setUrl}/>
              </>) : (<>
                <Text style={[styles.inputLabel, { marginTop: 12 }]}>Text Content</Text>
                <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border, height: 90, textAlignVertical: 'top' }]} placeholder="Type notes or paste summary..." placeholderTextColor="#94a3b8" multiline value={text} onChangeText={setText}/>
              </>)}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>);
}
// ==========================================
// 12. FOCUS MODE & POMODORO SCREEN
// ==========================================
function FocusModeScreen({ state, updateState, theme, showToast }) {
    const [presetMins, setPresetMins] = useState(25);
    const [subject, setSubject] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [completedRounds, setCompletedRounds] = useState(0);
    const [distractionFree, setDistractionFree] = useState(false);
    useEffect(() => {
        let interval = null;
        if (isActive && secondsLeft > 0) {
            interval = setInterval(() => setSecondsLeft(s => s - 1), 1000);
        }
        else if (isActive && secondsLeft === 0) {
            clearInterval(interval);
            setIsActive(false);
            if (!isBreak) {
                // Finished a focus round
                const rounds = completedRounds + 1;
                setCompletedRounds(rounds);
                const newBreak = rounds % 4 === 0 ? 15 : 5;
                setIsBreak(true);
                setSecondsLeft(newBreak * 60);
                // Record session to progress
                updateState({
                    sess: [
                        ...state.sess,
                        { id: uid(), subject: subject.trim() || undefined, mins: presetMins, date: todayStr() },
                    ],
                });
                showToast(`🎉 Focus session complete! ${presetMins} min logged`);
            }
            else {
                // Break finished
                setIsBreak(false);
                setSecondsLeft(presetMins * 60);
                showToast('Break finished! Ready for next round?');
            }
        }
        return () => clearInterval(interval);
    }, [isActive, secondsLeft]);
    const selectPreset = (m) => {
        if (isActive)
            return;
        setPresetMins(m);
        setSecondsLeft(m * 60);
    };
    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setIsBreak(false);
        setSecondsLeft(presetMins * 60);
    };
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${pad2(m)}:${pad2(s)}`;
    };
    // Timer UI block
    const TimerContent = (<View style={{ alignItems: 'center' }}>
      <Text style={[styles.subNote, { color: distractionFree ? '#94a3b8' : theme.subText }]}>
        {isBreak ? '☕ Break Time' : '🎯 Deep Study'} · Round {(completedRounds % 4) + 1} of 4
      </Text>

      <Text style={[styles.timerDigits, { color: distractionFree ? '#ffffff' : theme.text }]}>
        {formatTime(secondsLeft)}
      </Text>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
        <TouchableOpacity style={[styles.primaryBtn, { paddingHorizontal: 28, backgroundColor: '#5f9bb2' }]} onPress={toggleTimer}>
          <Text style={styles.primaryBtnText}>{isActive ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallOutlineBtn} onPress={resetTimer}>
          <Text style={[styles.smallOutlineBtnText, distractionFree && { color: '#ffffff', borderColor: '#ffffff' }]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>
    </View>);
    if (distractionFree) {
        return (<View style={styles.fullscreenFocus}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.fullscreenTitle}>Distraction-Free Focus</Text>
        {subject ? <Text style={styles.fullscreenSubject}>Subject: {subject}</Text> : null}
        {TimerContent}
        <TouchableOpacity style={styles.exitFocusBtn} onPress={() => setDistractionFree(false)}>
          <Text style={{ color: '#ffffff', textDecorationLine: 'underline', fontSize: 13 }}>
            Exit Distraction-Free Mode
          </Text>
        </TouchableOpacity>
      </View>);
    }
    return (<ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.screenHeaderTitle, { color: theme.text }]}>⏱️ Focus Mode</Text>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 12, alignItems: 'center' }]}>
        {TimerContent}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
          {[15, 25, 45, 60].map(m => (<TouchableOpacity key={m} disabled={isActive} style={[
                styles.presetPill,
                presetMins === m && { backgroundColor: theme.brand, borderColor: theme.brand },
            ]} onPress={() => selectPreset(m)}>
              <Text style={[styles.presetPillText, presetMins === m && { color: '#ffffff', fontWeight: '700' }]}>
                {m}m
              </Text>
            </TouchableOpacity>))}
        </View>

        <View style={{ width: '100%', marginTop: 18 }}>
          <Text style={styles.inputLabel}>Subject (Optional)</Text>
          <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. Mathematics" placeholderTextColor="#94a3b8" value={subject} onChangeText={setSubject}/>
        </View>

        <TouchableOpacity style={[styles.primaryBtn, { width: '100%', marginTop: 16 }]} onPress={() => setDistractionFree(true)}>
          <Text style={styles.primaryBtnText}>🧘 Enter Distraction-Free Mode</Text>
        </TouchableOpacity>

        <Text style={[styles.subNote, { color: theme.subText, marginTop: 12, textAlign: 'center' }]}>
          Pomodoro method: 25 min focus → 5 min break. Long 15 min break after 4 rounds.
        </Text>
      </View>
    </ScrollView>);
}
// ==========================================
// 13. INSIGHTS & ANALYTICS SCREEN
// ==========================================
function InsightsScreen({ state, theme, navigateTo }) {
    const [tab, setTab] = useState('stats');
    const streak = calcStreak(state.sess);
    const points = calcPoints(state);
    const level = calcLevel(points);
    // Weak subjects calculation (<60% average over at least 1 quiz)
    const subjectScores = {};
    state.qz.forEach((q) => {
        const s = q.subject || 'General';
        if (!subjectScores[s])
            subjectScores[s] = { total: 0, score: 0, count: 0 };
        subjectScores[s].total += q.total;
        subjectScores[s].score += q.score;
        subjectScores[s].count += 1;
    });
    const weakSubjects = Object.keys(subjectScores).map(s => {
        const item = subjectScores[s];
        const pct = item.total > 0 ? Math.round((item.score / item.total) * 100) : 100;
        return { subject: s, pct, count: item.count };
    }).filter(x => x.pct < 60);
    // 7-day study minutes data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dStr = toDateStr(d);
        const dayName = DAYS_OF_WEEK[d.getDay()];
        const mins = state.sess.filter((s) => s.date === dStr).reduce((acc, s) => acc + s.mins, 0);
        return { label: dayName, mins };
    });
    const maxMins = Math.max(...last7Days.map(d => d.mins), 60);
    return (<ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.screenHeaderTitle, { color: theme.text }]}>📈 Performance & Insights</Text>

      {/* TABS */}
      <View style={styles.segmentContainer}>
        {['stats', 'weak', 'rewards'].map(t => (<TouchableOpacity key={t} style={[styles.segmentBtn, tab === t && styles.segmentBtnActive]} onPress={() => setTab(t)}>
            <Text style={[styles.segmentBtnText, tab === t && styles.segmentBtnTextActive]}>
              {t === 'stats' ? 'Analytics' : t === 'weak' ? 'Weak Topics' : 'Badges'}
            </Text>
          </TouchableOpacity>))}
      </View>

      {tab === 'stats' && (<View style={{ marginTop: 12 }}>
          {/* STATS OVERVIEW */}
          <View style={styles.heroStatsRow}>
            <View style={[styles.card, { flex: 1, backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.heroStatValue, { color: theme.text }]}>
                {Math.round(state.sess.reduce((a, b) => a + b.mins, 0) / 60)}h
              </Text>
              <Text style={[styles.heroStatLabel, { color: theme.subText }]}>Total Hours</Text>
            </View>

            <View style={[styles.card, { flex: 1, backgroundColor: theme.card, borderColor: theme.cardBorder, marginHorizontal: 8 }]}>
              <Text style={[styles.heroStatValue, { color: theme.text }]}>
                {state.asgs.filter((a) => a.done).length}
              </Text>
              <Text style={[styles.heroStatLabel, { color: theme.subText }]}>Tasks Done</Text>
            </View>

            <View style={[styles.card, { flex: 1, backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.heroStatValue, { color: theme.text }]}>
                {state.qz.length}
              </Text>
              <Text style={[styles.heroStatLabel, { color: theme.subText }]}>Quizzes Taken</Text>
            </View>
          </View>

          {/* 7-DAY BAR CHART */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 12 }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Study Hours (Last 7 Days)</Text>
            <View style={styles.barChartContainer}>
              {last7Days.map((d, idx) => {
                const heightPct = Math.min(100, (d.mins / maxMins) * 100);
                return (<View key={idx} style={styles.barChartCol}>
                    <Text style={[styles.barValueText, { color: theme.subText }]}>{d.mins > 0 ? `${d.mins}m` : ''}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: `${heightPct}%`, backgroundColor: theme.brand }]}/>
                    </View>
                    <Text style={[styles.barLabelText, { color: theme.text }]}>{d.label}</Text>
                  </View>);
            })}
            </View>
          </View>
        </View>)}

      {tab === 'weak' && (<View style={{ marginTop: 12 }}>
          {weakSubjects.length === 0 ? (<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, alignItems: 'center', padding: 24 }]}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>🎉</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Weak Subjects Found!</Text>
              <Text style={[styles.emptySubtitle, { color: theme.subText, textAlign: 'center' }]}>
                Take quizzes in Brain Break to identify topics that need extra revision.
              </Text>
            </View>) : (weakSubjects.map(ws => (<View key={ws.subject} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 8 }]}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{ws.subject}</Text>
                  <Text style={{ color: '#ef4444', fontWeight: '800' }}>{ws.pct}% Avg Score</Text>
                </View>
                <Text style={[styles.subNote, { color: theme.subText, marginTop: 4 }]}>
                  Scored below 60% over {ws.count} quiz sessions. Extra practice recommended.
                </Text>
              </View>)))}
        </View>)}

      {tab === 'rewards' && (<View style={{ marginTop: 12 }}>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginBottom: 12 }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Level {level} Scholar</Text>
            <Text style={[styles.subNote, { color: theme.subText, marginTop: 2 }]}>
              Total Gamification Score: {points} points
            </Text>
          </View>

          <View style={styles.badgeGrid}>
            {BADGES_LIST.map(b => {
                const unlocked = !!state.bd[b.id];
                return (<View key={b.id} style={[
                        styles.badgeGridCard,
                        { backgroundColor: theme.card, borderColor: theme.cardBorder },
                        !unlocked && { opacity: 0.4 },
                    ]}>
                  <Text style={{ fontSize: 32 }}>{b.icon}</Text>
                  <Text style={[styles.badgeName, { color: theme.text }]}>{b.name}</Text>
                  <Text style={[styles.badgeDesc, { color: theme.subText }]}>{b.desc}</Text>
                  {unlocked ? (<Text style={{ color: '#10b981', fontSize: 10, fontWeight: '700', marginTop: 4 }}>
                      Unlocked ✓
                    </Text>) : null}
                </View>);
            })}
          </View>
        </View>)}
    </ScrollView>);
}
// ==========================================
// 14. BRAIN BREAK GAMES (PUZZLE, MEMORY, QUIZ)
// ==========================================
function BrainBreakScreen({ state, updateState, theme, showToast, openFieldSelector }) {
    const [activeGame, setActiveGame] = useState('hub');
    if (activeGame === 'puzzle') {
        return <SlidingPuzzleGame onBack={() => setActiveGame('hub')} theme={theme} showToast={showToast}/>;
    }
    if (activeGame === 'memory') {
        return <MemoryCardGame onBack={() => setActiveGame('hub')} theme={theme} showToast={showToast}/>;
    }
    if (activeGame === 'quiz') {
        return (<FieldQuizGame state={state} updateState={updateState} onBack={() => setActiveGame('hub')} theme={theme} showToast={showToast} openFieldSelector={openFieldSelector}/>);
    }
    return (<ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.screenHeaderTitle, { color: theme.text }]}>🧠 Brain Break</Text>
      <Text style={[styles.subNote, { color: theme.subText, marginBottom: 14 }]}>
        Take a 5-minute break to recharge your mental clarity with mini-games.
      </Text>

      {/* ACTIVE FIELD CARD */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginBottom: 12 }]}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={[styles.subNote, { color: theme.subText }]}>Your Academic Field</Text>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {getFieldIcon(state.field)} {state.field || 'Not Selected'}
            </Text>
          </View>
          <TouchableOpacity style={styles.smallOutlineBtn} onPress={openFieldSelector}>
            <Text style={styles.smallOutlineBtnText}>{state.field ? 'Change' : 'Select'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* GAME 1: SLIDING PUZZLE */}
      <TouchableOpacity style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginBottom: 12 }]} onPress={() => setActiveGame('puzzle')}>
        <Text style={{ fontSize: 36, marginBottom: 6 }}>🧩</Text>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Sliding Tile Puzzle</Text>
        <Text style={[styles.subNote, { color: theme.subText, marginTop: 4 }]}>
          Order the numbers 1 to 8 (Easy 3×3) or 1 to 15 (Hard 4×4).
        </Text>
        <Text style={{ color: theme.brand, fontWeight: '700', marginTop: 10 }}>Play Now →</Text>
      </TouchableOpacity>

      {/* GAME 2: MEMORY CARDS */}
      <TouchableOpacity style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginBottom: 12 }]} onPress={() => setActiveGame('memory')}>
        <Text style={{ fontSize: 36, marginBottom: 6 }}>🃏</Text>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Memory Match Cards</Text>
        <Text style={[styles.subNote, { color: theme.subText, marginTop: 4 }]}>
          Find all 8 matching pairs of science and study icons.
        </Text>
        <Text style={{ color: theme.brand, fontWeight: '700', marginTop: 10 }}>Play Now →</Text>
      </TouchableOpacity>

      {/* GAME 3: QUICK FIELD QUIZ */}
      <TouchableOpacity style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginBottom: 12 }]} onPress={() => setActiveGame('quiz')}>
        <Text style={{ fontSize: 36, marginBottom: 6 }}>⚡</Text>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Field Quick Quiz</Text>
        <Text style={[styles.subNote, { color: theme.subText, marginTop: 4 }]}>
          5 randomized questions from {state.field || 'your selected field'}. 20s per question!
        </Text>
        <Text style={{ color: theme.brand, fontWeight: '700', marginTop: 10 }}>Play Now →</Text>
      </TouchableOpacity>
    </ScrollView>);
}
// 14.1 Sliding Puzzle Game
function SlidingPuzzleGame({ onBack, theme, showToast }) {
    const [size, setSize] = useState(3);
    const [board, setBoard] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);
    // Initialize solvable board
    const initBoard = (n) => {
        const total = n * n;
        const arr = Array.from({ length: total }, (_, i) => (i + 1) % total);
        // Solvable shuffle by making random valid moves
        let emptyIdx = total - 1;
        for (let step = 0; step < 80; step++) {
            const neighbors = [];
            const row = Math.floor(emptyIdx / n);
            const col = emptyIdx % n;
            if (row > 0)
                neighbors.push(emptyIdx - n);
            if (row < n - 1)
                neighbors.push(emptyIdx + n);
            if (col > 0)
                neighbors.push(emptyIdx - 1);
            if (col < n - 1)
                neighbors.push(emptyIdx + 1);
            const randNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            [arr[emptyIdx], arr[randNeighbor]] = [arr[randNeighbor], arr[emptyIdx]];
            emptyIdx = randNeighbor;
        }
        setBoard(arr);
        setMoves(0);
        setIsWon(false);
    };
    useEffect(() => {
        initBoard(size);
    }, [size]);
    const handleTilePress = (idx) => {
        if (isWon)
            return;
        const emptyIdx = board.indexOf(0);
        const n = size;
        const isAdjacent = (Math.abs(Math.floor(idx / n) - Math.floor(emptyIdx / n)) === 1 && idx % n === emptyIdx % n) ||
            (Math.abs((idx % n) - (emptyIdx % n)) === 1 && Math.floor(idx / n) === Math.floor(emptyIdx / n));
        if (isAdjacent) {
            const nextBoard = [...board];
            [nextBoard[idx], nextBoard[emptyIdx]] = [nextBoard[emptyIdx], nextBoard[idx]];
            setBoard(nextBoard);
            setMoves(m => m + 1);
            // Check win
            const won = nextBoard.every((val, i) => val === (i + 1) % (n * n));
            if (won) {
                setIsWon(true);
                showToast('🏆 Puzzle Solved! Excellent work!');
            }
        }
    };
    return (<ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.cardHeaderRow}>
        <TouchableOpacity style={styles.smallOutlineBtn} onPress={onBack}>
          <Text style={styles.smallOutlineBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.screenHeaderTitle, { color: theme.text }]}>🧩 Puzzle Game</Text>
        <TouchableOpacity style={styles.smallOutlineBtn} onPress={() => initBoard(size)}>
          <Text style={styles.smallOutlineBtnText}>Shuffle</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginVertical: 14, justifyContent: 'center' }}>
        <TouchableOpacity style={[styles.segmentBtn, size === 3 && styles.segmentBtnActive]} onPress={() => setSize(3)}>
          <Text style={[styles.segmentBtnText, size === 3 && styles.segmentBtnTextActive]}>Easy 3×3</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segmentBtn, size === 4 && styles.segmentBtnActive]} onPress={() => setSize(4)}>
          <Text style={[styles.segmentBtnText, size === 4 && styles.segmentBtnTextActive]}>Hard 4×4</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.subNote, { color: theme.subText, textAlign: 'center', marginBottom: 12 }]}>
        Moves: {moves} {isWon ? '· 🏆 SOLVED!' : ''}
      </Text>

      {/* PUZZLE BOARD */}
      <View style={[styles.puzzleBoard, { width: SCREEN_WIDTH - 48, height: SCREEN_WIDTH - 48 }]}>
        {board.map((tile, idx) => {
            const isEmpty = tile === 0;
            const tileSize = (SCREEN_WIDTH - 64) / size;
            return (<TouchableOpacity key={idx} disabled={isEmpty || isWon} style={[
                    styles.puzzleTile,
                    { width: tileSize, height: tileSize },
                    isEmpty ? { backgroundColor: 'transparent', borderColor: 'transparent' } : { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]} onPress={() => handleTilePress(idx)}>
              {!isEmpty && (<Text style={[styles.puzzleTileText, { color: theme.text, fontSize: size === 3 ? 28 : 22 }]}>
                  {tile}
                </Text>)}
            </TouchableOpacity>);
        })}
      </View>
    </ScrollView>);
}
// 14.2 Memory Match Card Game
function MemoryCardGame({ onBack, theme, showToast }) {
    const ICONS = ['📚', '✏️', '🔬', '🧮', '🌍', '🎨', '💡', '🧪'];
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const initGame = () => {
        const doubled = [...ICONS, ...ICONS].sort(() => Math.random() - 0.5);
        setCards(doubled);
        setFlipped([]);
        setMatched([]);
        setMoves(0);
    };
    useEffect(() => {
        initGame();
    }, []);
    const handleCardPress = (idx) => {
        if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx))
            return;
        const nextFlipped = [...flipped, idx];
        setFlipped(nextFlipped);
        if (nextFlipped.length === 2) {
            setMoves(m => m + 1);
            const [i1, i2] = nextFlipped;
            if (cards[i1] === cards[i2]) {
                setMatched(prev => {
                    const updated = [...prev, i1, i2];
                    if (updated.length === 16) {
                        showToast('🎉 All Pairs Found! Amazing memory!');
                    }
                    return updated;
                });
                setFlipped([]);
            }
            else {
                setTimeout(() => setFlipped([]), 800);
            }
        }
    };
    return (<ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.cardHeaderRow}>
        <TouchableOpacity style={styles.smallOutlineBtn} onPress={onBack}>
          <Text style={styles.smallOutlineBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.screenHeaderTitle, { color: theme.text }]}>🃏 Memory Match</Text>
        <TouchableOpacity style={styles.smallOutlineBtn} onPress={initGame}>
          <Text style={styles.smallOutlineBtnText}>Restart</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.subNote, { color: theme.subText, textAlign: 'center', marginVertical: 10 }]}>
        Moves: {moves} · Matched: {matched.length / 2} of 8
      </Text>

      <View style={styles.memoryGrid}>
        {cards.map((icon, idx) => {
            const isRevealed = flipped.includes(idx) || matched.includes(idx);
            return (<TouchableOpacity key={idx} style={[
                    styles.memoryCard,
                    { backgroundColor: isRevealed ? (matched.includes(idx) ? '#d1fae5' : theme.card) : theme.brand },
                ]} onPress={() => handleCardPress(idx)}>
              <Text style={{ fontSize: 28 }}>{isRevealed ? icon : '❓'}</Text>
            </TouchableOpacity>);
        })}
      </View>
    </ScrollView>);
}
// 14.3 Field Quick Quiz Game
function FieldQuizGame({ state, updateState, onBack, theme, showToast, openFieldSelector }) {
    const field = state.field || 'Computer Science';
    const rawQuestions = QUIZ_BANK[field] || QUIZ_BANK['Computer Science'];
    const [questions, setQuestions] = useState([]);
    const [curIdx, setCurIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOpt, setSelectedOpt] = useState(null);
    const [timer, setTimer] = useState(20);
    const [quizFinished, setQuizFinished] = useState(false);
    useEffect(() => {
        // Pick 5 random questions
        const shuffled = [...rawQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
        const parsed = shuffled.map(qStr => {
            const parts = qStr.split('|');
            const question = parts[0];
            const correct = parts[1];
            const opts = parts.slice(1).sort(() => Math.random() - 0.5);
            return {
                question,
                options: opts,
                correctIdx: opts.indexOf(correct),
            };
        });
        setQuestions(parsed);
        setCurIdx(0);
        setScore(0);
        setSelectedOpt(null);
        setTimer(20);
        setQuizFinished(false);
    }, [field]);
    useEffect(() => {
        if (quizFinished || questions.length === 0 || selectedOpt !== null)
            return;
        const interval = setInterval(() => {
            setTimer(t => {
                if (t <= 1) {
                    handleSelectOption(-1); // timeout
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [curIdx, selectedOpt, quizFinished, questions]);
    const handleSelectOption = (idx) => {
        if (selectedOpt !== null)
            return;
        setSelectedOpt(idx);
        const q = questions[curIdx];
        const isCorrect = idx === q.correctIdx;
        if (isCorrect)
            setScore(s => s + 1);
        setTimeout(() => {
            if (curIdx + 1 < questions.length) {
                setCurIdx(c => c + 1);
                setSelectedOpt(null);
                setTimer(20);
            }
            else {
                setQuizFinished(true);
                // Save quiz session to history
                const finalScore = isCorrect ? score + 1 : score;
                updateState({
                    qz: [
                        ...state.qz,
                        { id: uid(), subject: field, score: finalScore, total: questions.length, date: todayStr(), src: 'quick-quiz' },
                    ],
                });
                showToast(`Quiz completed! ${finalScore}/${questions.length} correct (+${finalScore * 5 + 10} pts)`);
            }
        }, 1200);
    };
    if (questions.length === 0)
        return null;
    if (quizFinished) {
        const pct = Math.round((score / questions.length) * 100);
        return (<View style={[styles.scrollContent, { alignItems: 'center', justifyContent: 'center', flex: 1 }]}>
        <Text style={{ fontSize: 56 }}>{pct >= 80 ? '🏆' : pct >= 60 ? '🎉' : '💪'}</Text>
        <Text style={[styles.screenHeaderTitle, { color: theme.text, marginTop: 12 }]}>Quiz Completed!</Text>
        <Text style={[styles.modalTitle, { color: theme.brand, marginVertical: 6 }]}>
          {score} / {questions.length} Correct ({pct}%)
        </Text>
        <Text style={[styles.subNote, { color: theme.subText, textAlign: 'center', marginHorizontal: 20 }]}>
          {pct >= 60 ? 'Great job! Points and progress have been saved to your Insights.' : 'Keep practicing to master this field!'}
        </Text>

        <TouchableOpacity style={[styles.primaryBtn, { marginTop: 24, paddingHorizontal: 32 }]} onPress={onBack}>
          <Text style={styles.primaryBtnText}>Back to Hub</Text>
        </TouchableOpacity>
      </View>);
    }
    const q = questions[curIdx];
    return (<ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.cardHeaderRow}>
        <TouchableOpacity style={styles.smallOutlineBtn} onPress={onBack}>
          <Text style={styles.smallOutlineBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.screenHeaderTitle, { color: theme.text }]}>⚡ Quick Quiz</Text>
        <Text style={[styles.subNote, { color: timer <= 5 ? '#ef4444' : theme.brand, fontWeight: '800' }]}>
          ⏱️ {timer}s
        </Text>
      </View>

      <Text style={[styles.subNote, { color: theme.subText, marginVertical: 6 }]}>
        Question {curIdx + 1} of {questions.length} · {field}
      </Text>

      {/* QUESTION CARD */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 8 }]}>
        <Text style={[styles.questionText, { color: theme.text }]}>{q.question}</Text>
      </View>

      {/* OPTIONS */}
      <View style={{ marginTop: 14, gap: 10 }}>
        {q.options.map((opt, idx) => {
            let btnBg = theme.card;
            let borderCol = theme.cardBorder;
            if (selectedOpt !== null) {
                if (idx === q.correctIdx) {
                    btnBg = '#d1fae5';
                    borderCol = '#10b981';
                }
                else if (idx === selectedOpt) {
                    btnBg = '#fee2e2';
                    borderCol = '#ef4444';
                }
            }
            return (<TouchableOpacity key={idx} disabled={selectedOpt !== null} style={[styles.quizOptionBtn, { backgroundColor: btnBg, borderColor: borderCol }]} onPress={() => handleSelectOption(idx)}>
              <Text style={[styles.quizOptionText, { color: theme.text }]}>
                {String.fromCharCode(65 + idx)}. {opt}
              </Text>
            </TouchableOpacity>);
        })}
      </View>
    </ScrollView>);
}
// ==========================================
// 15. PROFILE & SETTINGS SCREEN
// ==========================================
function SettingsScreen({ state, updateState, theme, showToast, openFieldSelector }) {
    const isDark = state.dark;
    const [name, setName] = useState(state.profile?.name || '');
    const [cls, setCls] = useState(state.profile?.cls || '');
    const [goal, setGoal] = useState(String(state.goal || 300));
    const handleSaveProfile = () => {
        updateState({
            profile: { name: name.trim(), cls: cls.trim() },
            goal: Number(goal) || 300,
        });
        showToast('Settings saved!');
    };
    const handleExportJSON = async () => {
        try {
            const json = JSON.stringify(state, null, 2);
            await Share.share({ message: json, title: 'StudyHub_Backup.json' });
        }
        catch {
            Alert.alert('Error', 'Could not export backup');
        }
    };
    const handleResetData = () => {
        Alert.alert('Reset All Data', 'Are you sure? This will delete all classes, notes, routine and study logs.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reset Everything',
                style: 'destructive',
                onPress: async () => {
                    await Storage.clear();
                    updateState({
                        profile: null,
                        classes: [],
                        asgs: [],
                        notes: [],
                        exams: [],
                        sess: [],
                        rems: [],
                        goal: 300,
                        colors: {},
                        rt: null,
                        rtDone: {},
                        field: null,
                        qz: [],
                        mats: [],
                        lec: [],
                        ad: {},
                        bd: {},
                    });
                    showToast('Data reset complete');
                },
            },
        ]);
    };
    return (<ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.screenHeaderTitle, { color: theme.text }]}>⚙️ Profile & Settings</Text>

      {/* STUDENT PROFILE */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 12 }]}>
        <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 10 }]}>Student Profile</Text>

        <Text style={styles.inputLabel}>Name</Text>
        <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} value={name} onChangeText={setName}/>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>Class / Semester</Text>
        <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} value={cls} onChangeText={setCls}/>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>Weekly Study Goal (Minutes)</Text>
        <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} keyboardType="numeric" value={goal} onChangeText={setGoal}/>

        <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]} onPress={handleSaveProfile}>
          <Text style={styles.primaryBtnText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      {/* ACADEMIC FIELD */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 12 }]}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Field of Study</Text>
            <Text style={[styles.subNote, { color: theme.subText, marginTop: 2 }]}>
              {getFieldIcon(state.field)} {state.field || 'Not Selected'}
            </Text>
          </View>
          <TouchableOpacity style={styles.smallOutlineBtn} onPress={openFieldSelector}>
            <Text style={styles.smallOutlineBtnText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ACCOUNT & SECURITY */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 12 }]}>
        <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 8 }]}>Student Account</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 }}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#5f9bb2',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ fontSize: 20 }}>🎓</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{state.profile?.name || 'Student'}</Text>
            <Text style={{ fontSize: 12, color: theme.subText }}>{state.profile?.email || 'student@studyhub.edu'}</Text>
            <Text style={{ fontSize: 11, color: theme.brand, fontWeight: '600', marginTop: 2 }}>
              {getFieldIcon(state.field)} {state.field || state.profile?.cls || 'General Studies'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
            borderWidth: 1,
            borderColor: '#fca5a5',
            paddingVertical: 12,
            borderRadius: 12,
            marginTop: 14,
            gap: 8
          }}
          onPress={() => {
            Alert.alert('Sign Out', 'Are you sure you want to log out of your StudyHub account?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => {
                  updateState({ profile: null });
                  showToast('Signed out successfully');
                }
              }
            ]);
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#ef4444' }}>
            Sign Out of Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* DATA BACKUP & RESET */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 12, marginBottom: 30 }]}>
        <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 8 }]}>Data Management</Text>

        <TouchableOpacity style={styles.menuRowItem} onPress={handleExportJSON}>
          <Ionicons name="cloud-download-outline" size={20} color={theme.brand}/>
          <Text style={[styles.menuRowText, { color: theme.text }]}>Export JSON Backup</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRowItem} onPress={handleResetData}>
          <Ionicons name="trash-outline" size={20} color="#ef4444"/>
          <Text style={[styles.menuRowText, { color: '#ef4444' }]}>Reset All App Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>);
}
// ==========================================
// 16. MORE VIEW WRAPPER
// ==========================================
function MoreViewWrapper({ viewKey, state, updateState, navigateTo, theme, showToast, openFieldSelector }) {
    const titles = {
        lectures: 'Lecture Journal',
        exams: 'Exam Countdown',
        materials: 'Study Materials',
        focus: 'Focus Mode (Pomodoro)',
        insights: 'Performance Analytics',
        progress: 'Study Progress',
        brain: 'Brain Break Games',
        reminders: 'Study Reminders',
        settings: 'Settings & Data',
    };
    const title = titles[viewKey] || 'StudyHub';

    const renderView = () => {
        switch (viewKey) {
            case 'ai':
                return <AIAssistantScreen state={state} updateState={updateState} theme={theme} showToast={showToast} navigateTo={navigateTo}/>;
            case 'lectures':
                return <LectureJournalScreen state={state} updateState={updateState} theme={theme} showToast={showToast}/>;
            case 'exams':
                return <ExamCountdownScreen state={state} updateState={updateState} theme={theme} showToast={showToast}/>;
            case 'materials':
                return <StudyMaterialsScreen state={state} updateState={updateState} theme={theme} showToast={showToast}/>;
            case 'focus':
                return <FocusModeScreen state={state} updateState={updateState} theme={theme} showToast={showToast}/>;
            case 'insights':
            case 'progress':
                return <InsightsScreen state={state} theme={theme} navigateTo={navigateTo}/>;
            case 'brain':
                return (<BrainBreakScreen state={state} updateState={updateState} theme={theme} showToast={showToast} openFieldSelector={openFieldSelector}/>);
            case 'reminders':
                return <RemindersScreen state={state} updateState={updateState} theme={theme} showToast={showToast}/>;
            case 'settings':
            default:
                return (<SettingsScreen state={state} updateState={updateState} theme={theme} showToast={showToast} openFieldSelector={openFieldSelector}/>);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: theme.card,
                borderBottomWidth: 1,
                borderBottomColor: theme.cardBorder,
                gap: 12
            }}>
                <TouchableOpacity
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        backgroundColor: theme.bg
                    }}
                    onPress={() => navigateTo('dash')}
                >
                    <Ionicons name="arrow-back" size={18} color={theme.brand} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: theme.brand }}>Home</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, flex: 1 }} numberOfLines={1}>
                    {title}
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                {renderView()}
            </View>
        </View>
    );
}
// Reminders Screen Component
function RemindersScreen({ state, updateState, theme, showToast }) {
    const [showAdd, setShowAdd] = useState(false);
    const [text, setText] = useState('');
    const [time, setTime] = useState('18:00');
    const handleSave = () => {
        if (!text.trim())
            return;
        const newItem = {
            id: uid(),
            text: text.trim(),
            time,
            on: true,
        };
        updateState({ rems: [...state.rems, newItem] });
        setShowAdd(false);
        setText('');
        showToast('Reminder set!');
    };
    const toggleReminder = (id) => {
        updateState({
            rems: state.rems.map((r) => r.id === id ? { ...r, on: !r.on } : r),
        });
    };
    const deleteReminder = (id) => {
        updateState({ rems: state.rems.filter((r) => r.id !== id) });
        showToast('Reminder deleted');
    };
    return (<ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.cardHeaderRow}>
        <Text style={[styles.screenHeaderTitle, { color: theme.text }]}>⏰ Study Reminders</Text>
        <TouchableOpacity style={styles.addBtnCircle} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={24} color="#ffffff"/>
        </TouchableOpacity>
      </View>

      {state.rems.length === 0 ? (<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, alignItems: 'center', padding: 24, marginTop: 12 }]}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>⏰</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No reminders scheduled</Text>
          <Text style={[styles.emptySubtitle, { color: theme.subText, textAlign: 'center' }]}>
            Set daily alerts for study sessions, quiz practice, and lecture review.
          </Text>
        </View>) : (state.rems.map((r) => (<View key={r.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 10 }]}>
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{r.text}</Text>
                <Text style={[styles.subNote, { color: theme.subText, marginTop: 2 }]}>Daily at {r.time}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity onPress={() => toggleReminder(r.id)}>
                  <Ionicons name={r.on ? 'toggle' : 'toggle-outline'} size={32} color={r.on ? '#10b981' : theme.subText}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteReminder(r.id)}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444"/>
                </TouchableOpacity>
              </View>
            </View>
          </View>)))}

      {/* ADD REMINDER MODAL */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Reminder</Text>

            <Text style={styles.inputLabel}>Reminder Note</Text>
            <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. Solve 5 MCQs in Chemistry" placeholderTextColor="#94a3b8" value={text} onChangeText={setText}/>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Time (HH:MM)</Text>
            <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="18:00" placeholderTextColor="#94a3b8" value={time} onChangeText={setTime}/>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>);
}
// ==========================================
// 17. ROUTINE MODAL (AUTO & MANUAL)
// ==========================================
function RoutineModal({ visible, onClose, state, updateState, theme, showToast }) {
    const currentRt = state.rt || {
        remind: true,
        mode: 'auto',
        tasks: [],
        uni: '09:00',
        end: '14:00',
        home: '15:00',
        sleep: '23:00',
    };
    const [mode, setMode] = useState(currentRt.mode || 'auto');
    const [uni, setUni] = useState(currentRt.uni || '09:00');
    const [home, setHome] = useState(currentRt.home || '15:00');
    const [sleep, setSleep] = useState(currentRt.sleep || '23:00');
    const [manualTasks, setManualTasks] = useState(currentRt.tasks || []);
    const handleSave = () => {
        const updatedRt = {
            remind: true,
            mode,
            uni,
            end: '14:00',
            home,
            sleep,
            tasks: manualTasks,
        };
        updateState({ rt: updatedRt });
        onClose();
        showToast('Daily routine configured!');
    };
    return (<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card, maxHeight: '88%' }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Daily Routine Planner</Text>

          <View style={[styles.segmentContainer, { marginVertical: 10 }]}>
            <TouchableOpacity style={[styles.segmentBtn, mode === 'auto' && styles.segmentBtnActive]} onPress={() => setMode('auto')}>
              <Text style={[styles.segmentBtnText, mode === 'auto' && styles.segmentBtnTextActive]}>
                ⚡ Auto Routine
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.segmentBtn, mode === 'manual' && styles.segmentBtnActive]} onPress={() => setMode('manual')}>
              <Text style={[styles.segmentBtnText, mode === 'manual' && styles.segmentBtnTextActive]}>
                📝 Custom Tasks
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ marginVertical: 10 }}>
            {mode === 'auto' ? (<View>
                <Text style={[styles.subNote, { color: theme.subText, marginBottom: 10 }]}>
                  Enter your timings. StudyHub will automatically structure your evening around urgent tasks, exams, rest, and sleep!
                </Text>

                <Text style={styles.inputLabel}>College / Uni Start Time</Text>
                <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} value={uni} onChangeText={setUni}/>

                <Text style={[styles.inputLabel, { marginTop: 10 }]}>Ghar Wapsi / Home Arrival</Text>
                <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} value={home} onChangeText={setHome}/>

                <Text style={[styles.inputLabel, { marginTop: 10 }]}>Sleep Time</Text>
                <TextInput style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} value={sleep} onChangeText={setSleep}/>
              </View>) : (<View>
                <Text style={[styles.subNote, { color: theme.subText, marginBottom: 8 }]}>
                  Add custom daily routine tasks:
                </Text>

                {manualTasks.map((t, idx) => (<View key={t.id} style={styles.manualTaskRow}>
                    <Text style={{ fontSize: 18 }}>{t.icon}</Text>
                    <TextInput style={[styles.textInput, { flex: 1, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border, paddingVertical: 4 }]} value={t.title} onChangeText={(val) => {
                    const updated = [...manualTasks];
                    updated[idx].title = val;
                    setManualTasks(updated);
                }}/>
                    <TouchableOpacity onPress={() => setManualTasks(prev => prev.filter((_, i) => i !== idx))}>
                      <Ionicons name="trash-outline" size={18} color="#ef4444"/>
                    </TouchableOpacity>
                  </View>))}

                <TouchableOpacity style={[styles.smallOutlineBtn, { marginTop: 10 }]} onPress={() => {
                setManualTasks(prev => [
                    ...prev,
                    { id: uid(), title: 'Study Session', icon: '📚', start: '16:00', end: '17:00' },
                ]);
            }}>
                  <Text style={styles.smallOutlineBtnText}>+ Add Task</Text>
                </TouchableOpacity>
              </View>)}
          </ScrollView>

          <View style={styles.modalBtnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Routine</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>);
}
// ==========================================
// 18. GLOBAL SEARCH & FIELD SELECTOR MODALS
// ==========================================
function GlobalSearchModal({ visible, onClose, state, navigateTo, theme }) {
    const [query, setQuery] = useState('');
    const q = query.toLowerCase().trim();
    const results = useMemo(() => {
        if (!q)
            return [];
        const list = [];
        state.classes.forEach((c) => {
            if (c.subject.toLowerCase().includes(q) || (c.room && c.room.toLowerCase().includes(q))) {
                list.push({ type: 'Class', title: c.subject, sub: `${DAYS_OF_WEEK[c.day]} ${c.start}–${c.end}`, tab: 'timetable' });
            }
        });
        state.asgs.forEach((a) => {
            if (a.title.toLowerCase().includes(q) || (a.subject && a.subject.toLowerCase().includes(q))) {
                list.push({ type: 'Task', title: a.title, sub: `Due ${a.due} · ${a.priority}`, tab: 'tasks' });
            }
        });
        state.notes.forEach((n) => {
            if (n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)) {
                list.push({ type: 'Note', title: n.title, sub: n.body.slice(0, 50), tab: 'notes' });
            }
        });
        state.exams.forEach((e) => {
            if (e.subject.toLowerCase().includes(q)) {
                list.push({ type: 'Exam', title: e.subject, sub: `Exam Date: ${e.date}`, tab: 'exams' });
            }
        });
        return list.slice(0, 20);
    }, [q, state]);
    return (<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card, maxHeight: '80%' }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>🔍 Search StudyHub</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.subText}/>
            </TouchableOpacity>
          </View>

          <TextInput autoFocus style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border, marginVertical: 10 }]} placeholder="Search classes, tasks, notes, exams..." placeholderTextColor="#94a3b8" value={query} onChangeText={setQuery}/>

          <ScrollView style={{ maxHeight: 300 }}>
            {q && results.length === 0 ? (<Text style={[styles.emptyText, { color: theme.subText, textAlign: 'center', marginTop: 12 }]}>
                No matches found.
              </Text>) : (results.map((res, idx) => (<TouchableOpacity key={idx} style={styles.searchResultRow} onPress={() => {
                onClose();
                navigateTo(res.tab);
            }}>
                  <Text style={styles.searchResultBadge}>{res.type}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.taskTitleText, { color: theme.text }]}>{res.title}</Text>
                    <Text style={[styles.subNote, { color: theme.subText }]}>{res.sub}</Text>
                  </View>
                </TouchableOpacity>)))}
          </ScrollView>
        </View>
      </View>
    </Modal>);
}
function FieldSelectorModal({ visible, currentField, onSelect, onClose, theme }) {
    return (<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card, maxHeight: '80%' }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Your Field</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.subText}/>
            </TouchableOpacity>
          </View>
          <Text style={[styles.subNote, { color: theme.subText, marginBottom: 12 }]}>
            Your Brain Break quiz questions will come from this field.
          </Text>

          <ScrollView style={{ maxHeight: 380 }}>
            {ACADEMIC_FIELDS.map(([name, icon]) => {
            const isSelected = currentField === name;
            return (<TouchableOpacity key={name} style={[
                    styles.fieldOptionRow,
                    isSelected && { backgroundColor: theme.brand, borderColor: theme.brand },
                ]} onPress={() => onSelect(name)}>
                  <Text style={{ fontSize: 24 }}>{icon}</Text>
                  <Text style={[styles.fieldOptionText, isSelected && { color: '#ffffff', fontWeight: '700' }]}>
                    {name}
                  </Text>
                </TouchableOpacity>);
        })}
          </ScrollView>
        </View>
      </View>
    </Modal>);
}
// ==========================================
// 19. STYLES
// ==========================================
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        elevation: 3,
    },
    topBarLeft: {
        flexDirection: 'column',
    },
    logoText: {
        fontSize: 22,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    logoHub: {
        color: '#5f9bb2',
        fontStyle: 'italic',
    },
    topStudentInfo: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 1,
    },
    topBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerIconButton: {
        padding: 6,
    },
    streakBadge: {
        backgroundColor: '#3f7f99',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
    },
    streakText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
    toastContainer: {
        position: 'absolute',
        top: 55,
        left: 16,
        right: 16,
        backgroundColor: '#5f9bb2',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        zIndex: 999,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 6,
    },
    toastText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    bottomNav: {
        flexDirection: 'row',
        height: 56,
        borderTopWidth: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 2,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navText: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#1c2f44',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    sectionSubtitle: {
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '700',
    },
    subNote: {
        fontSize: 12,
    },
    emptyBox: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    emptySubtitle: {
        fontSize: 13,
        marginTop: 4,
    },
    heroCard: {
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        elevation: 3,
    },
    heroGreeting: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '800',
    },
    fieldTag: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    fieldTagText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '600',
    },
    heroDate: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginTop: 2,
    },
    heroStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    heroStatItem: {
        alignItems: 'center',
    },
    heroStatValue: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '800',
    },
    heroStatLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        marginTop: 2,
    },
    quickActionsScroll: {
        flexDirection: 'row',
        marginTop: 16,
    },
    quickChip: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        marginRight: 8,
    },
    quickChipText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressBarTrack: {
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.06)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#5f9bb2',
        borderRadius: 4,
    },
    routineTaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'transparent',
        marginTop: 4,
    },
    taskTitleText: {
        fontSize: 14,
        fontWeight: '600',
    },
    taskTimeText: {
        fontSize: 11,
        marginTop: 1,
    },
    strikethroughText: {
        textDecorationLine: 'line-through',
        opacity: 0.5,
    },
    examRowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    examSubjectText: {
        fontSize: 14,
        fontWeight: '700',
    },
    examDaysPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    classRowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    subjectColorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    classSubject: {
        fontSize: 14,
        fontWeight: '600',
    },
    asgRowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    priHigh: { backgroundColor: '#fee2e2' },
    priMed: { backgroundColor: '#fef3c7' },
    priLow: { backgroundColor: '#d1fae5' },
    priorityBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    subHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    segmentContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 10,
        padding: 3,
    },
    segmentBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    segmentBtnActive: {
        backgroundColor: '#5f9bb2',
    },
    segmentBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    segmentBtnTextActive: {
        color: '#ffffff',
    },
    addBtnCircle: {
        backgroundColor: '#5f9bb2',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconOutlineBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#5f9bb2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayPillsScroll: {
        flexDirection: 'row',
        marginBottom: 14,
    },
    dayPill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginRight: 8,
    },
    dayPillText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    classCard: {
        flexDirection: 'row',
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 10,
        overflow: 'hidden',
    },
    classColorStrip: {
        width: 6,
    },
    classTitleText: {
        fontSize: 15,
        fontWeight: '700',
    },
    calNavBtn: {
        padding: 6,
    },
    calDaysRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
        marginBottom: 6,
    },
    calDayLabel: {
        fontSize: 11,
        fontWeight: '700',
        width: 36,
        textAlign: 'center',
    },
    calGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calCell: {
        width: (SCREEN_WIDTH - 64) / 7,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    calCellText: {
        fontSize: 12,
        fontWeight: '600',
    },
    calDotsRow: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 2,
        alignItems: 'center',
    },
    calDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    scheduleItemLine: {
        fontSize: 13,
        paddingVertical: 3,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    asgCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        marginBottom: 10,
    },
    asgCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    asgTitleText: {
        fontSize: 15,
        fontWeight: '700',
    },
    asgDescText: {
        fontSize: 13,
        marginTop: 8,
        lineHeight: 18,
    },
    cardActionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 14,
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.04)',
        paddingTop: 8,
    },
    smallCardAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    searchBarBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        height: 38,
        marginRight: 10,
    },
    searchBarInput: {
        flex: 1,
        fontSize: 13,
        marginLeft: 6,
    },
    noteCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        marginBottom: 10,
    },
    noteCardTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    noteCardSnippet: {
        fontSize: 13,
        marginTop: 4,
        lineHeight: 18,
    },
    noteBodyText: {
        fontSize: 14,
        lineHeight: 22,
    },
    lecturePhotoThumbnail: {
        width: 65,
        height: 65,
        borderRadius: 8,
    },
    photoPickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: 'rgba(95,155,178,0.12)',
    },
    photoPickerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#5f9bb2',
    },
    removePhotoBtn: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ef4444',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    zoomOverlay: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomCloseBtn: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    zoomedImage: {
        width: SCREEN_WIDTH,
        height: '80%',
    },
    screenHeaderTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    badgePill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    timerDigits: {
        fontSize: 54,
        fontWeight: '800',
        marginVertical: 14,
        fontVariant: ['tabular-nums'],
    },
    presetPill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    presetPillText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    fullscreenFocus: {
        flex: 1,
        backgroundColor: '#0f1b27',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    fullscreenTitle: {
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        fontSize: 13,
        fontWeight: '700',
    },
    fullscreenSubject: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 6,
    },
    exitFocusBtn: {
        marginTop: 40,
    },
    barChartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 140,
        marginTop: 14,
        paddingTop: 10,
    },
    barChartCol: {
        alignItems: 'center',
        flex: 1,
    },
    barTrack: {
        height: 90,
        width: 14,
        backgroundColor: 'rgba(0,0,0,0.06)',
        borderRadius: 6,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    barFill: {
        width: '100%',
        borderRadius: 6,
    },
    barValueText: {
        fontSize: 9,
        marginBottom: 4,
    },
    barLabelText: {
        fontSize: 11,
        marginTop: 4,
        fontWeight: '600',
    },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    badgeGridCard: {
        width: (SCREEN_WIDTH - 42) / 2,
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
    },
    badgeName: {
        fontSize: 13,
        fontWeight: '700',
        marginTop: 6,
    },
    badgeDesc: {
        fontSize: 11,
        marginTop: 2,
        lineHeight: 15,
    },
    puzzleBoard: {
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        padding: 4,
        backgroundColor: 'rgba(0,0,0,0.06)',
        borderRadius: 16,
    },
    puzzleTile: {
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    puzzleTileText: {
        fontWeight: '800',
    },
    memoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
        marginTop: 10,
    },
    memoryCard: {
        width: (SCREEN_WIDTH - 64) / 4,
        height: (SCREEN_WIDTH - 64) / 4,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 22,
    },
    quizOptionBtn: {
        padding: 14,
        borderRadius: 14,
        borderWidth: 1.5,
    },
    quizOptionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    menuRowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    menuRowText: {
        fontSize: 14,
        fontWeight: '600',
    },
    manualTaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginVertical: 4,
    },
    searchResultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    searchResultBadge: {
        backgroundColor: '#5f9bb2',
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '700',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    fieldOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
        marginBottom: 4,
    },
    fieldOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1c2f44',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    modalBtnRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 18,
    },
    cancelBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    cancelBtnText: {
        color: '#64748b',
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: '#5f9bb2',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    saveBtnText: {
        color: '#ffffff',
        fontWeight: '700',
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 4,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
    },
    primaryBtn: {
        backgroundColor: '#1c2f44',
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    smallOutlineBtn: {
        borderWidth: 1,
        borderColor: '#5f9bb2',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    smallOutlineBtnText: {
        color: '#5f9bb2',
        fontSize: 12,
        fontWeight: '600',
    },
    prioritySelectBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: 'center',
    },
    prioritySelectText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    sheetContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 36,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    sheetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    sheetGridItem: {
        width: (SCREEN_WIDTH - 64) / 3,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 16,
    },
    sheetItemIcon: {
        fontSize: 26,
        marginBottom: 4,
    },
    sheetItemLabel: {
        fontSize: 11,
        fontWeight: '700',
    },
    onboardScroll: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    onboardHero: {
        alignItems: 'center',
    },
    onboardBadge: {
        backgroundColor: '#e0f2fe',
        color: '#0369a1',
        fontSize: 11,
        fontWeight: '700',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 12,
    },
    onboardLogo: {
        fontSize: 40,
        fontWeight: '800',
        color: '#1c2f44',
    },
    onboardTagline: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
        textAlign: 'center',
    },
    onboardIllustration: {
        marginVertical: 24,
        alignItems: 'center',
    },
    onboardIllustrationPills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
    },
    onboardMiniPill: {
        backgroundColor: '#ffffff',
        color: '#1c2f44',
        fontSize: 11,
        fontWeight: '600',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        elevation: 1,
    },
    onboardFormCard: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        elevation: 3,
    },
    onboardFormTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1c2f44',
    },
    onboardFormSubtitle: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
        marginBottom: 16,
    },
});


// ==========================================
// AI STUDY ASSISTANT SCREEN (GEMINI POWERED)
// ==========================================
function AIAssistantScreen({ state, updateState, theme, showToast, navigateTo }) {
  const currentField = state.field || state.profile?.cls || 'General Studies';
  const studentName = state.profile?.name || 'Student';

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello ' + studentName + '! 👋 I am your StudyHub AI Assistant for ' + currentField + '.\n\nAsk me to explain any topic, solve doubts, generate practice MCQs, or summarize notes. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'Explain ' + currentField,
    'Generate 3 MCQs',
    '1-Week Exam Plan',
    'Summarize Formulas'
  ];

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    const userMsg = {
      id: uid(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setLoading(true);

    try {
      const aiReplyText = await callGeminiAI(newHistory, state.profile, state.field, state.customApiKey);
      const aiMsg = {
        id: uid(),
        sender: 'ai',
        text: aiReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: uid(),
        sender: 'ai',
        text: '⚠️ ' + (err.message || 'Failed to connect. Check internet & try again.'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleShareMessage = (txt) => {
    try {
      Share.share({ message: txt, title: 'StudyHub AI Note' });
    } catch (e) {
      Alert.alert('StudyHub AI', txt);
    }
  };

  return (
    <View style={{
      flex: 1,
      minHeight: 0,
      width: '100%',
      overflow: 'hidden',
      backgroundColor: theme.bg,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* CHAT MESSAGES SCROLL (WITH STRICT AUTO-WRAPPING & CENTERED COLUMN) */}
      <ScrollView
        style={{ flex: 1, minHeight: 0, width: '100%' }}
        contentContainerStyle={{
          maxWidth: 720,
          width: '100%',
          alignSelf: 'center',
          paddingHorizontal: 14,
          paddingVertical: 14,
          gap: 12
        }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <View
              key={m.id}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: isUser ? '82%' : '88%',
                flexDirection: 'row',
                gap: 8,
                alignItems: 'flex-start',
                width: 'auto'
              }}
            >
              {!isUser && (
                <View style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#5f9bb2',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 2,
                  flexShrink: 0
                }}>
                  <Ionicons name="sparkles" size={13} color="#ffffff" />
                </View>
              )}

              <View style={{
                flexShrink: 1,
                backgroundColor: isUser ? '#1c2f44' : theme.card,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 16,
                borderTopRightRadius: isUser ? 2 : 16,
                borderTopLeftRadius: !isUser ? 2 : 16,
                borderWidth: isUser ? 0 : 1,
                borderColor: theme.cardBorder,
                elevation: 1,
              }}>
                <Text style={{
                  fontSize: 14,
                  lineHeight: 21,
                  color: isUser ? '#ffffff' : theme.text,
                  fontWeight: '400',
                  flexWrap: 'wrap'
                }}>
                  {m.text}
                </Text>

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 6,
                  gap: 10
                }}>
                  <Text style={{
                    fontSize: 10,
                    color: isUser ? '#94a3b8' : theme.subText
                  }}>
                    {m.time}
                  </Text>

                  {!isUser && m.id !== 'welcome' && (
                    <TouchableOpacity onPress={() => handleShareMessage(m.text)}>
                      <Ionicons name="share-outline" size={13} color={theme.subText} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {loading && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            alignSelf: 'flex-start',
            backgroundColor: theme.card,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 14,
            borderTopLeftRadius: 2,
            borderWidth: 1,
            borderColor: theme.cardBorder
          }}>
            <Ionicons name="sparkles" size={14} color="#5f9bb2" />
            <Text style={{ fontSize: 12, color: theme.brand, fontWeight: '600' }}>
              StudyHub AI is thinking...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* QUICK SUGGESTIONS CHIPS (CENTERED CONTAINER) */}
      <View style={{
        paddingVertical: 6,
        borderTopWidth: 1,
        borderTopColor: theme.cardBorder,
        backgroundColor: theme.card,
        width: '100%',
        alignItems: 'center'
      }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            maxWidth: 720,
            paddingHorizontal: 12,
            gap: 8
          }}
        >
          {quickPrompts.map((qp, idx) => (
            <TouchableOpacity
              key={idx}
              style={{
                backgroundColor: theme.inputBg,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.border
              }}
              onPress={() => handleSend(qp)}
            >
              <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text }}>
                {qp}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* FIRMLY ANCHORED INPUT BAR (CENTERED ON DESKTOP) */}
      <View style={{
        backgroundColor: theme.card,
        borderTopWidth: 1,
        borderTopColor: theme.cardBorder,
        width: '100%',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          maxWidth: 720,
          width: '100%',
          gap: 8
        }}>
          <TextInput
            style={{
              flex: 1,
              minWidth: 0,
              backgroundColor: theme.inputBg,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 8,
              fontSize: 13,
              color: theme.text,
              borderWidth: 1,
              borderColor: theme.border,
              maxHeight: 75
            }}
            placeholder={"Ask about " + currentField + "..."}
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: (inputText.trim() && !loading) ? '#5f9bb2' : '#94a3b8',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            disabled={!inputText.trim() || loading}
            onPress={() => handleSend()}
          >
            <Ionicons name="send" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
