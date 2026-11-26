import { StudentFieldType, QuizQuestion } from '../types';

export interface FieldMetadata {
  id: StudentFieldType;
  name: string;
  shortName: string;
  icon: string; // Ionicons name
  color: string;
  accentColor: string;
  description: string;
  defaultSubjects: string[];
  sampleQuestions: QuizQuestion[];
}

export const STUDENT_FIELDS: FieldMetadata[] = [
  {
    id: 'Computer Science',
    name: 'Computer Science',
    shortName: 'CS',
    icon: 'code-slash',
    color: '#4F46E5',
    accentColor: '#EEF2FF',
    description: 'Algorithms, data structures, computation theory, AI, and systems programming.',
    defaultSubjects: [
      'Data Structures & Algorithms',
      'Database Systems',
      'Operating Systems',
      'Computer Networks',
      'Artificial Intelligence',
      'Software Architecture'
    ],
    sampleQuestions: [
      {
        id: 'cs-1',
        question: 'What is the average time complexity of QuickSort?',
        options: ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)'],
        correctIndex: 0,
        explanation: 'QuickSort has an average case time complexity of O(n log n) by partitioning elements around a pivot.'
      },
      {
        id: 'cs-2',
        question: 'Which normal form eliminates transitive functional dependencies in relational databases?',
        options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
        correctIndex: 2,
        explanation: '3NF removes transitive dependencies (non-prime attributes depending on other non-prime attributes).'
      },
      {
        id: 'cs-3',
        question: 'What mechanism in an Operating System prevents deadlocks by requiring resources to be requested in order?',
        options: ['Hold and Wait prevention', 'Circular wait elimination', 'Mutual exclusion removal', 'Preemption forcing'],
        correctIndex: 1,
        explanation: 'Imposing a total ordering of all resource types and requiring processes to request resources in an increasing order eliminates Circular Wait.'
      }
    ]
  },
  {
    id: 'BBA',
    name: 'Bachelor of Business Administration',
    shortName: 'BBA',
    icon: 'briefcase',
    color: '#059669',
    accentColor: '#ECFDF5',
    description: 'Corporate finance, strategic marketing, organizational behavior, and management.',
    defaultSubjects: [
      'Financial Accounting',
      'Principles of Marketing',
      'Organizational Behavior',
      'Business Law & Ethics',
      'Corporate Finance',
      'Strategic Management'
    ],
    sampleQuestions: [
      {
        id: 'bba-1',
        question: 'Which of the following describes Porter\'s Five Forces framework?',
        options: [
          'An industry analysis framework to determine market competitiveness and profitability',
          'A financial accounting valuation matrix for fixed assets',
          'A human resources recruiting workflow model',
          'A brand lifecycle distribution pipeline'
        ],
        correctIndex: 0,
        explanation: 'Porter\'s Five Forces evaluates competitive rivalry, supplier power, buyer power, threat of substitution, and threat of new entrants.'
      },
      {
        id: 'bba-2',
        question: 'What does the Dupont Analysis formula break Return on Equity (ROE) into?',
        options: [
          'Profit Margin, Asset Turnover, and Financial Leverage',
          'Current Ratio, Quick Ratio, and Cash Flow',
          'Gross Margin, EBITDA, and Capital Expenditures',
          'Net Income, Dividends, and Retained Earnings'
        ],
        correctIndex: 0,
        explanation: 'DuPont analysis dissects ROE into operating efficiency (Net Profit Margin), asset use efficiency (Asset Turnover), and financial leverage (Equity Multiplier).'
      }
    ]
  },
  {
    id: 'Software Engineering',
    name: 'Software Engineering',
    shortName: 'SE',
    icon: 'construct',
    color: '#0891B2',
    accentColor: '#ECFEFF',
    description: 'Software lifecycle, agile methodologies, design patterns, QA, and DevOps.',
    defaultSubjects: [
      'Software Requirements Eng.',
      'Software Design & Patterns',
      'Software Testing & QA',
      'DevOps & CI/CD',
      'Agile Project Management',
      'Distributed Systems'
    ],
    sampleQuestions: [
      {
        id: 'se-1',
        question: 'In the SOLID principles of Object-Oriented Design, what does the \'L\' stand for?',
        options: [
          'Liskov Substitution Principle',
          'Layered Architecture Principle',
          'Loose Coupling Principle',
          'Linear Dependency Inversion'
        ],
        correctIndex: 0,
        explanation: 'Liskov Substitution Principle states that subclasses should be substitutable for their base classes without altering program correctness.'
      },
      {
        id: 'se-2',
        question: 'Which design pattern is best suited for notifying multiple objects when a subject changes state?',
        options: ['Observer Pattern', 'Factory Pattern', 'Singleton Pattern', 'Decorator Pattern'],
        correctIndex: 0,
        explanation: 'The Observer pattern defines a one-to-many dependency between objects so that when one object changes state, all dependents are notified.'
      }
    ]
  },
  {
    id: 'MBBS',
    name: 'MBBS (Medicine & Surgery)',
    shortName: 'MBBS',
    icon: 'medkit',
    color: '#DC2626',
    accentColor: '#FEF2F2',
    description: 'Human anatomy, physiology, pathology, pharmacology, and clinical diagnosis.',
    defaultSubjects: [
      'Gross Anatomy & Histology',
      'Medical Physiology',
      'Biochemistry & Genetics',
      'General Pathology',
      'Clinical Pharmacology',
      'Internal Medicine'
    ],
    sampleQuestions: [
      {
        id: 'mbbs-1',
        question: 'Which coronary artery is most commonly occluded in myocardial infarction (heart attack)?',
        options: [
          'Left Anterior Descending (LAD) artery',
          'Right Coronary Artery (RCA)',
          'Left Circumflex Artery (LCx)',
          'Posterior Descending Artery (PDA)'
        ],
        correctIndex: 0,
        explanation: 'The LAD artery, often nicknamed the "widow maker", accounts for approximately 40-50% of all myocardial infarctions.'
      },
      {
        id: 'mbbs-2',
        question: 'Which cranial nerve is responsible for the sensory innervation of the face and motor control of mastication?',
        options: [
          'Cranial Nerve V (Trigeminal)',
          'Cranial Nerve VII (Facial)',
          'Cranial Nerve IX (Glossopharyngeal)',
          'Cranial Nerve XII (Hypoglossal)'
        ],
        correctIndex: 0,
        explanation: 'CN V (Trigeminal) provides sensory innervation to the face and controls the muscles of mastication.'
      }
    ]
  },
  {
    id: 'Pharmacy',
    name: 'Pharmacy (Pharm.D)',
    shortName: 'Pharm',
    icon: 'flask',
    color: '#7C3AED',
    accentColor: '#F5F3FF',
    description: 'Pharmacokinetics, medicinal chemistry, pharmaceutics, and clinical therapeutics.',
    defaultSubjects: [
      'Pharmaceutics & Formulation',
      'Pharmacokinetics & Dynamics',
      'Medicinal Chemistry',
      'Pharmacotherapy',
      'Toxicology',
      'Hospital Pharmacy'
    ],
    sampleQuestions: [
      {
        id: 'pharm-1',
        question: 'What term defines the fraction of an administered drug dose that reaches systemic circulation unchanged?',
        options: ['Bioavailability', 'Volume of Distribution', 'Clearance Rate', 'First-Pass Metabolism'],
        correctIndex: 0,
        explanation: 'Bioavailability (F) represents the percentage of unchanged drug reaching the systemic circulation.'
      },
      {
        id: 'pharm-2',
        question: 'Which enzyme family in the liver is responsible for the metabolism of the majority of pharmaceutical drugs?',
        options: ['Cytochrome P450 (CYP450)', 'Monoamine Oxidase (MAO)', 'Cyclooxygenase (COX)', 'Acetylcholinesterase'],
        correctIndex: 0,
        explanation: 'The Cytochrome P450 superfamily is the primary system for phase I hepatic drug biotransformation.'
      }
    ]
  },
  {
    id: 'Nursing',
    name: 'Nursing & Healthcare',
    shortName: 'Nursing',
    icon: 'heart-half',
    color: '#DB2777',
    accentColor: '#FDF2F8',
    description: 'Patient care, nursing ethics, community health, adult nursing, and triage.',
    defaultSubjects: [
      'Fundamentals of Nursing',
      'Adult Health Nursing',
      'Community Health Nursing',
      'Pediatric Nursing',
      'Pharmacology for Nurses',
      'Mental Health Nursing'
    ],
    sampleQuestions: [
      {
        id: 'nurs-1',
        question: 'What is the correct sequence of the standard nursing process?',
        options: [
          'Assessment, Diagnosis, Planning, Implementation, Evaluation (ADPIE)',
          'Diagnosis, Assessment, Planning, Evaluation, Implementation',
          'Planning, Assessment, Implementation, Diagnosis, Review',
          'Assessment, Intervention, Diagnosis, Outcome, Treatment'
        ],
        correctIndex: 0,
        explanation: 'ADPIE is the recognized clinical standard: Assessment, Diagnosis, Planning, Implementation, and Evaluation.'
      }
    ]
  },
  {
    id: 'Civil Engineering',
    name: 'Civil Engineering',
    shortName: 'Civil',
    icon: 'business',
    color: '#D97706',
    accentColor: '#FFFBEB',
    description: 'Structural mechanics, geotechnical engineering, hydraulics, and construction management.',
    defaultSubjects: [
      'Structural Analysis',
      'Fluid Mechanics & Hydraulics',
      'Soil Mechanics & Geotech',
      'Reinforced Concrete Design',
      'Transportation Engineering',
      'Surveying & Leveling'
    ],
    sampleQuestions: [
      {
        id: 'civil-1',
        question: 'In structural mechanics, what does Mohr\'s Circle graphical method represent?',
        options: [
          'State of normal and shear stress at any point in a stressed body',
          'Water flow through porous foundation soils',
          'Deflection curvature of simply supported prestressed beams',
          'Dynamic resonance frequency of suspension bridges'
        ],
        correctIndex: 0,
        explanation: 'Mohr\'s circle represents transformation equations for plane stress and plane strain to find principal stresses.'
      }
    ]
  },
  {
    id: 'Electrical Engineering',
    name: 'Electrical Engineering',
    shortName: 'EE',
    icon: 'flash',
    color: '#EA580C',
    accentColor: '#FFF7ED',
    description: 'Circuits, signal processing, power systems, electromagnetism, and control theory.',
    defaultSubjects: [
      'Electric Circuit Analysis',
      'Signals & Systems',
      'Electromagnetic Fields',
      'Power Electronics',
      'Digital Signal Processing',
      'Control Systems'
    ],
    sampleQuestions: [
      {
        id: 'ee-1',
        question: 'What does Kirchhoff\'s Current Law (KCL) state regarding an electrical junction node?',
        options: [
          'The algebraic sum of currents entering any node is equal to zero',
          'The sum of voltage drops equals source voltage',
          'Power dissipated in parallel resistors is equal',
          'Magnetic flux is inversely proportional to current'
        ],
        correctIndex: 0,
        explanation: 'KCL states that charge cannot accumulate at a node: the sum of currents entering equals the sum exiting (Σ I = 0).'
      }
    ]
  },
  {
    id: 'Mechanical Engineering',
    name: 'Mechanical Engineering',
    shortName: 'Mech',
    icon: 'settings',
    color: '#2563EB',
    accentColor: '#EFF6FF',
    description: 'Thermodynamics, heat transfer, machine design, CAD, and kinematics.',
    defaultSubjects: [
      'Engineering Thermodynamics',
      'Fluid Mechanics',
      'Heat & Mass Transfer',
      'Mechanics of Materials',
      'Machine Design',
      'Manufacturing Processes'
    ],
    sampleQuestions: [
      {
        id: 'mech-1',
        question: 'Which thermodynamic cycle represents the maximum theoretical efficiency limit for a heat engine operating between two temperatures?',
        options: ['Carnot Cycle', 'Rankine Cycle', 'Otto Cycle', 'Brayton Cycle'],
        correctIndex: 0,
        explanation: 'The Carnot cycle defines the upper thermodynamic efficiency limit between high temperature TH and low temperature TC: η = 1 - TC/TH.'
      }
    ]
  },
  {
    id: 'Physics',
    name: 'Physics',
    shortName: 'Phys',
    icon: 'planet',
    color: '#0284C7',
    accentColor: '#F0F9FF',
    description: 'Classical mechanics, electrodynamics, quantum mechanics, and statistical physics.',
    defaultSubjects: [
      'Classical Mechanics',
      'Electrodynamics',
      'Quantum Mechanics',
      'Thermodynamics & Stat. Phys',
      'Optics & Waves',
      'Solid State Physics'
    ],
    sampleQuestions: [
      {
        id: 'phys-1',
        question: 'What principle dictates that one cannot simultaneously measure position and momentum with arbitrary precision?',
        options: [
          'Heisenberg Uncertainty Principle',
          'Pauli Exclusion Principle',
          'Schrödinger Wave Principle',
          'Bohr Complementarity Principle'
        ],
        correctIndex: 0,
        explanation: 'Heisenberg Uncertainty states Δx · Δp ≥ ℏ/2, establishing a fundamental quantum limit to measurement precision.'
      }
    ]
  },
  {
    id: 'Chemistry',
    name: 'Chemistry',
    shortName: 'Chem',
    icon: 'color-palette',
    color: '#10B981',
    accentColor: '#F0FDF4',
    description: 'Organic chemistry, inorganic reaction mechanisms, physical chemistry, and spectroscopy.',
    defaultSubjects: [
      'Organic Chemistry Mechanisms',
      'Inorganic Chemistry',
      'Physical Chemistry & Kinetics',
      'Analytical Chemistry & NMR',
      'Biochemistry',
      'Spectroscopy & Chromatography'
    ],
    sampleQuestions: [
      {
        id: 'chem-1',
        question: 'Which type of reaction mechanism involves a bimolecular nucleophilic substitution with concerted inversion of stereochemistry?',
        options: ['SN2 Mechanism', 'SN1 Mechanism', 'E2 Elimination', 'E1cB Mechanism'],
        correctIndex: 0,
        explanation: 'SN2 involves a backside nucleophilic attack and bond cleavage in a single concerted step, causing Walden inversion of stereochemistry.'
      }
    ]
  }
];

export const DEFAULT_FIELD = STUDENT_FIELDS[0]; // Computer Science
