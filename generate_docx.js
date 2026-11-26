const fs = require('fs');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle
} = require('docx');

const COLOR_PRIMARY = '1C2F44'; // Deep Navy
const COLOR_ACCENT = '5F9BB2';  // Soft Teal
const COLOR_GRAY = '64748B';    // Slate Gray

function createHeaderCell(text, widthPercent) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { fill: COLOR_PRIMARY },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            color: 'FFFFFF',
            size: 20,
            font: 'Arial'
          })
        ],
        alignment: AlignmentType.CENTER
      })
    ]
  });
}

function createDataCell(text, widthPercent, isBold = false) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: isBold,
            color: '1C2F44',
            size: 19,
            font: 'Arial'
          })
        ]
      })
    ]
  });
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Arial',
          size: 22,
          color: '1C2F44'
        }
      }
    }
  },
  sections: [
    {
      properties: {},
      children: [
        // Title
        new Paragraph({
          children: [
            new TextRun({
              text: 'StudyHub: Smart Student Study Assistant',
              bold: true,
              size: 48,
              color: COLOR_PRIMARY,
              font: 'Arial'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),

        // Subtitle
        new Paragraph({
          children: [
            new TextRun({
              text: 'Final Year Mobile Application Project Documentation Report',
              size: 26,
              color: COLOR_ACCENT,
              italics: true,
              font: 'Arial'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        }),

        // Project Team Members Box
        new Paragraph({
          text: 'Project Development Team',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 100, after: 100 }
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell('Team Member', 50),
                createHeaderCell('Project Role & Specialization', 50)
              ]
            }),
            new TableRow({
              children: [
                createDataCell('Adeel Ahmed', 50, true),
                createDataCell('Lead Full-Stack Developer & Systems Architect', 50)
              ]
            }),
            new TableRow({
              children: [
                createDataCell('Azain Butt', 50, true),
                createDataCell('UI/UX Designer & Layout Specialist', 50)
              ]
            }),
            new TableRow({
              children: [
                createDataCell('Noor Muqadas', 50, true),
                createDataCell('AI Integration & Prompt Engineer', 50)
              ]
            }),
            new TableRow({
              children: [
                createDataCell('Azhan khan Lodhi', 50, true),
                createDataCell('Quality Assurance & Verification Engineer', 50)
              ]
            })
          ]
        }),

        // 1. Executive Summary
        new Paragraph({
          text: '1. Executive Summary & Vision',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'StudyHub is a comprehensive, mobile-first academic companion app engineered specifically for university and college students. Managing modern university life requires juggling classes, tracking assignments, organizing lecture notes, preparing for exams, managing sleep and study routines, and staying mentally refreshed.\n\nStudyHub consolidates all of these academic needs into a single unified mobile application. Built with React Native and Expo, StudyHub features a lightweight, zero-dependency architecture that runs seamlessly on snack.expo.dev in both Web and Android preview modes, as well as an installable standalone Android APK.'
            })
          ],
          spacing: { after: 200 }
        }),

        // 2. Google Gemini AI Integration
        new Paragraph({
          text: '2. Google Gemini AI Study Assistant',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'A flagship feature of StudyHub is its integrated 24/7 AI Study Tutor powered by Google Gemini (gemini-3.5-flash-lite). It provides:\n• Discipline-Aware Explanations: Deep concepts explained step-by-step with practical examples tailored to Computer Science, Pre-Medical, Engineering, etc.\n• Instant Practice MCQs: On-demand 3-question quizzes complete with answer keys and rationale.\n• 1-Week Exam Roadmaps: Structured daily study milestones leading up to midterms and finals.\n• Mobile-Optimized Responsive Chat UI: Multi-line text auto-wrapping and firmly anchored input box ensuring zero screen overflow.'
            })
          ],
          spacing: { after: 200 }
        }),

        // 3. System Architecture & Modules
        new Paragraph({
          text: '3. Core System Modules',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '1. Student Authentication: Secure Sign In, Sign Up, and 1-Tap Quick Demo Student Login (student@studyhub.edu).\n2. Class Timetable: Weekly schedule manager with subject color tags and live next-class countdown.\n3. Task & Assignment Tracker: Priority tags (Urgent, High), due dates, and completion status.\n4. Daily Routine Planner: Heuristic algorithm generating custom revision blocks based on upcoming exams.\n5. Lecture Notes & Photo Board: Digital notebook with camera/gallery whiteboard attachment support.\n6. Focus Pomodoro: 25-min study sprints, break intervals, session logs, and streak counters.\n7. Study Games & Brain Gym: Active recall memory games and instant quizzes for mental breaks.\n8. Responsive Navigation: 5-tab core bottom navigation combined with a top-right slide-out Menu Drawer.'
            })
          ],
          spacing: { after: 200 }
        }),

        // 4. Testing & Verification
        new Paragraph({
          text: '4. Testing, Quality Assurance & AST Verification',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'The complete codebase (5,385 lines of clean JSX) was verified with the Babel AST parser with 0 errors. Universal safe storage was implemented to ensure zero-crash performance across Web and Android preview environments. Hardware back button handling was integrated to safely navigate modals and dashboards.'
            })
          ],
          spacing: { after: 200 }
        }),

        // 5. Conclusion
        new Paragraph({
          text: '5. Conclusion & Team Sign-off',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'StudyHub proves that a unified, mobile-first academic platform can significantly enhance student focus, organization, and concept mastery. Future enhancements include cloud synchronization via Firebase/Supabase, peer-to-peer study rooms, and voice-enabled tutoring.\n\nProject Team: Adeel Ahmed, Azain Butt, Noor Muqadas, Azhan khan Lodhi — Academic Session 2025–2026.'
            })
          ],
          spacing: { after: 200 }
        })
      ]
    }
  ]
});

const docxPath = 'C:\\Users\\DELL\\OneDrive\\Desktop\\StudyHub_Project_Documentation.docx';
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(docxPath, buffer);
  console.log('DOCX successfully generated at: ' + docxPath);
});
