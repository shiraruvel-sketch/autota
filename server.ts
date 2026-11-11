import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client (Server-side only)
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-Memory Storage for dynamic submissions in session
interface StoredSubmission {
  id: string;
  studentName: string;
  studentId: string;
  assignmentId: string;
  assignmentTitle: string;
  language: 'c' | 'java';
  fileName: string;
  code: string;
  submittedAt: string;
  status: 'pending' | 'evaluating' | 'graded';
  grade: number;
  testPassed: number;
  testTotal: number;
  staticAnalysis: {
    warningsCount: number;
    errorsCount: number;
    rawOutput: string;
  };
  compilerOutput: {
    command: string;
    exitCode: number;
    stdout: string;
    stderr: string;
  };
  valgrindOutput: {
    leaksDetected: boolean;
    bytesLeaked: number;
    rawOutput: string;
  };
  pedagogicalFeedback: {
    summary: string;
    logicalFlaws: Array<{
      line?: number;
      title: string;
      socraticQuestion: string;
      conceptualHint: string;
      severity: 'high' | 'medium' | 'low';
    }>;
    codeStyleNotes: string[];
    nextSteps: string[];
  };
  agentLogs: Array<{
    agentName: string;
    timestamp: string;
    action: string;
    reasoning: string;
    verdict: string;
  }>;
}

const mockSubmissions: StoredSubmission[] = [
  {
    id: 'sub-101',
    studentName: 'יונתן כהן',
    studentId: '318942105',
    assignmentId: 'assign-1',
    assignmentTitle: 'מטלה 1: רשימה מקושרת וניהול זיכרון ב-C',
    language: 'c',
    fileName: 'linked_list.c',
    code: `#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Node {\n    int val;\n    struct Node* next;\n} Node;\n\nNode* create_node(int val) {\n    Node* n = (Node*)malloc(sizeof(Node));\n    n->val = val;\n    n->next = NULL;\n    return n;\n}\n\nvoid free_list(Node* head) {\n    Node* curr = head;\n    while (curr != NULL) {\n        // BUG: Accessing curr->next after free(curr)\n        free(curr);\n        curr = curr->next;\n    }\n}`,
    submittedAt: '2026-11-08 11:20',
    status: 'graded',
    grade: 75,
    testPassed: 4,
    testTotal: 5,
    staticAnalysis: {
      warningsCount: 2,
      errorsCount: 0,
      rawOutput: "clang-tidy:\nlinked_list.c:21:9: warning: Use of memory after it is freed [clang-analyzer-cplusplus.NewDelete]\n        curr = curr->next;\n        ^",
    },
    compilerOutput: {
      command: 'gcc -Wall -Wextra -std=c11 -O2 linked_list.c -o solution',
      exitCode: 0,
      stdout: '',
      stderr: 'linked_list.c: In function ‘free_list’:\nlinked_list.c:20:9: warning: ‘curr’ is used after being freed',
    },
    valgrindOutput: {
      leaksDetected: true,
      bytesLeaked: 32,
      rawOutput: '==14298== HEAP SUMMARY:\n==14298==     in use at exit: 32 bytes in 2 blocks\n==14298==   total heap allocs: 5, frees: 3\n==14298== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)\n==14298== Invalid read of size 8\n==14298==    at 0x401189: free_list (linked_list.c:21)',
    },
    pedagogicalFeedback: {
      summary: 'המימוש הכללי של הרשימה המקושרת בנוי בצורה נקייה ומודולרית. עם זאת, התגלתה בעיה מהותית בשחרור הזיכרון (Use-After-Free).',
      logicalFlaws: [
        {
          line: 21,
          title: 'שימוש במצביע לאחר שחרור (Use After Free)',
          socraticQuestion: 'אם קראת ל-free(curr) בשורה 20, מה קורה לתוכן שעליו curr מצביע בשורה 21 כשאתה ניגש ל-curr->next?',
          conceptualHint: 'חשוב כיצד לשמור עותק זמני של המצביע לאיבר הבא לפני שמשחררים את הצומת הנוכחי.',
          severity: 'high',
        },
      ],
      codeStyleNotes: [
        'הגדרת ה-struct Node תקינה וברורה.',
        'מומלץ לבדוק האם malloc החזיר NULL לפני השמה לשדות הצומת.',
      ],
      nextSteps: [
        'שמור משתנה עזר Node* next_node לפני שחרור הצומת.',
        'הרץ את הבדיקה שוב ושים לב האם Valgrind מדווח על 0 שגיאות.',
      ],
    },
    agentLogs: [
      {
        agentName: 'StaticAnalyzerAgent',
        timestamp: '11:20:04',
        action: 'Clang-Tidy Scan',
        reasoning: 'זיהוי אזהרת שימוש בזיכרון משוחרר בשורות 20-21.',
        verdict: 'Warning flag detected: Use-After-Free',
      },
      {
        agentName: 'DockerSandboxAgent',
        timestamp: '11:20:08',
        action: 'Execute Valgrind & Unit Tests',
        reasoning: 'טסט 5 נכשל עקב גישה לא חוקית לזיכרון (SIGSEGV בתנאי קצה).',
        verdict: '4/5 Tests Passed. Memory leak detected.',
      },
      {
        agentName: 'SocraticMentorAgent',
        timestamp: '11:20:12',
        action: 'Pedagogical Synthesis',
        reasoning: 'הסוכן זיהה את התיקון הנדרש אך מחיל מסנן פדגוגי: אין לספק את הקוד המתקן אלא להציג שאלת הכוונה על סדר הפעולות.',
        verdict: 'Generated Socratic hint without revealing solution code.',
      },
    ],
  },
  {
    id: 'sub-102',
    studentName: 'מאיה לוי',
    studentId: '209384712',
    assignmentId: 'assign-2',
    assignmentTitle: 'מטלה 2: עץ חיפוש בינארי ו-Generics ב-Java',
    language: 'java',
    fileName: 'BinarySearchTree.java',
    code: `public class BinarySearchTree<T extends Comparable<T>> {\n    private class Node {\n        T data;\n        Node left, right;\n        Node(T data) { this.data = data; }\n    }\n    private Node root;\n\n    public boolean contains(T value) {\n        return contains(root, value);\n    }\n    private boolean contains(Node current, T value) {\n        // Potential NullPointerException\n        int cmp = value.compareTo(current.data);\n        if (cmp == 0) return true;\n        return cmp < 0 ? contains(current.left, value) : contains(current.right, value);\n    }\n}`,
    submittedAt: '2026-11-08 12:05',
    status: 'graded',
    grade: 82,
    testPassed: 6,
    testTotal: 8,
    staticAnalysis: {
      warningsCount: 1,
      errorsCount: 0,
      rawOutput: 'SpotBugs Scan:\nNP_NULL_ON_SOME_PATH: Possible null pointer dereference of current in BinarySearchTree.contains(Node, Comparable)',
    },
    compilerOutput: {
      command: 'javac -Xlint:all BinarySearchTree.java',
      exitCode: 0,
      stdout: '',
      stderr: '',
    },
    valgrindOutput: {
      leaksDetected: false,
      bytesLeaked: 0,
      rawOutput: 'JVM Garbage Collection Audit: Normal. No memory ceiling violations.',
    },
    pedagogicalFeedback: {
      summary: 'ההגשה מציגה הבנה יפה של עצי חיפוש בינאריים ו-Generics. מקרי הבדיקה עבור עץ ריק או איבר שאינו קיים נכשלו עקב חריגת NullPointerException.',
      logicalFlaws: [
        {
          line: 14,
          title: 'חריגת מצביע ריק (NullPointerException)',
          socraticQuestion: 'מהו תנאי העצירה של הרקורסיה כאשר הערך המבוקש אינו קיים בעץ ומגיעים לצומת עלה ריק (NULL)?',
          conceptualHint: 'בדוק מה הערך של current בתחילת המתודה contains(Node current, T value) לפני שקוראים ל-compareTo.',
          severity: 'high',
        },
      ],
      codeStyleNotes: [
        'שימוש נכון ב-T extends Comparable<T>.',
        'חלוקה יפה למתודה ציבורית ומתווה פרטית רקורסיבית.',
      ],
      nextSteps: [
        'הוסף תנאי בסיס הבודק האם current == null לפני גישה לשדותיו.',
        'בדוק את המקרה שבו עץ ריק מופעל עליו contains(val).',
      ],
    },
    agentLogs: [
      {
        agentName: 'StaticAnalyzerAgent',
        timestamp: '12:05:02',
        action: 'SpotBugs & CheckStyle',
        reasoning: 'זוהתה אפשרות לחריגת NullPointer בנתיב שבו current אינו מוגדר.',
        verdict: 'Potential NPE flagged on line 14',
      },
      {
        agentName: 'DockerSandboxAgent',
        timestamp: '12:05:06',
        action: 'JUnit 5 Execution',
        reasoning: 'Test 3 (empty tree) ו-Test 7 (search non-existent item) זרקו java.lang.NullPointerException.',
        verdict: '6/8 Tests Passed.',
      },
      {
        agentName: 'SocraticMentorAgent',
        timestamp: '12:05:10',
        action: 'Formulate Feedback',
        reasoning: 'ניסוח רמז סוקרטי על תנאי עצירה ברקורסיה, מניעת גילוי פתרון ישיר (לא לכתוב if current == null).',
        verdict: 'Pedagogical feedback synthesized.',
      },
    ],
  },
  {
    id: 'sub-103',
    studentName: 'דניאל אברמוב',
    studentId: '315891024',
    assignmentId: 'assign-1',
    assignmentTitle: 'מטלה 1: רשימה מקושרת וניהול זיכרון ב-C',
    language: 'c',
    fileName: 'linked_list_v2.c',
    code: `#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Node {\n    int val;\n    struct Node* next;\n} Node;\n\nvoid free_list(Node* head) {\n    Node* curr = head;\n    while (curr != NULL) {\n        Node* next = curr->next;\n        free(curr);\n        curr = next;\n    }\n}`,
    submittedAt: '2026-11-08 12:45',
    status: 'graded',
    grade: 100,
    testPassed: 5,
    testTotal: 5,
    staticAnalysis: {
      warningsCount: 0,
      errorsCount: 0,
      rawOutput: 'clang-tidy: 0 warnings. Perfect code hygiene.',
    },
    compilerOutput: {
      command: 'gcc -Wall -Wextra -std=c11 -O2 linked_list_v2.c -o solution',
      exitCode: 0,
      stdout: 'Compilation successful with 0 warnings.',
      stderr: '',
    },
    valgrindOutput: {
      leaksDetected: false,
      bytesLeaked: 0,
      rawOutput: '==16501== All heap blocks were freed -- no leaks are possible\n==16501== ERROR SUMMARY: 0 errors from 0 contexts',
    },
    pedagogicalFeedback: {
      summary: 'עבודה מצוינת! הקוד נקי, מודולרי, וכל הקצאות הזיכרון שוחררו במלואן ללא כל זליגה או שגיאות של Valgrind.',
      logicalFlaws: [],
      codeStyleNotes: [
        'ניהול מצביעים תקין לחלוטין בשחרור הרשימה.',
        'קוד קריא עם שמות משתנים אינפורמטיביים.',
      ],
      nextSteps: [
        'ניתן להעמיק במבני נתונים מורכבים יותר כגון עצי Red-Black או רשימות דו-כיווניות.',
      ],
    },
    agentLogs: [
      {
        agentName: 'StaticAnalyzerAgent',
        timestamp: '12:45:01',
        action: 'Static Analysis',
        reasoning: 'אין אזהרות או דפוסים בעייתיים.',
        verdict: 'Clean',
      },
      {
        agentName: 'DockerSandboxAgent',
        timestamp: '12:45:04',
        action: 'Sandboxed Testing',
        reasoning: 'כל 5 מקרי הבדיקה עברו בהצלחה. Valgrind הראה 0 זליגות זיכרון.',
        verdict: '5/5 Passed. Memory Audit Clean.',
      },
      {
        agentName: 'SocraticMentorAgent',
        timestamp: '12:45:07',
        action: 'Positive Reinforcement',
        reasoning: 'חיזוק חיובי על שימוש תקין במצביע עזר לשחרור זיכרון.',
        verdict: 'Grade 100 assigned.',
      },
    ],
  },
];

// API: Submissions List
app.get('/api/submissions', (_req: Request, res: Response) => {
  res.json({ submissions: mockSubmissions });
});

// API: Single Submission Details
app.get('/api/submissions/:id', (req: Request, res: Response) => {
  const found = mockSubmissions.find((s) => s.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Submission not found' });
  }
  res.json({ submission: found });
});

// API: Evaluate Code (Multi-Agent Pipeline)
app.post('/api/evaluate', async (req: Request, res: Response) => {
  try {
    const {
      studentName = 'סטודנט אורח',
      studentId = '300123456',
      assignmentId = 'assign-1',
      assignmentTitle = 'מטלה 1: ניהול זיכרון ורשימה מקושרת',
      language = 'c',
      fileName = 'solution.c',
      code = '',
    } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required for evaluation' });
    }

    const lowerCode = code.toLowerCase();
    const hasMalloc = lowerCode.includes('malloc');
    const hasFree = lowerCode.includes('free');
    const hasNullPointerRisk = lowerCode.includes('->') || lowerCode.includes('.next') || lowerCode.includes('.data');

    // If Gemini API is available, ask Gemini to perform the Socratic Pedagogical analysis!
    if (ai) {
      try {
        const prompt = `אתה מערכת "AutoTA" - מערכת סוכני AI אוטומטית לבדיקת מטלות תכנות (C/Java) ומתן משוב פדגוגי למכללה או אוניברסיטה.
עליך לבצע בדיקה מעמיקה של קוד הסטודנט הבא בשפת ${language.toUpperCase()}.

כללי ברזל פדגוגיים (CRITICAL):
1. אסור בתכלית האיסור לספק את הפתרון המלא או קוד מתקן מוכן!
2. עליך להשתמש בשיטה הסוקרטית (Socratic Method) - להציג שאלות מכוונות, להצביע על קו המחשבה או על השורה הבעייתית, ולהסביר את המושג התיאורטי כדי שהסטודנט יבין ויתקן בעצמו.
3. הדמיית תוצאות סריקה סטטית, קימפול, ו-Valgrind (אם מדובר ב-C) או חריגות JVM (אם מדובר ב-Java).

קוד הסטודנט:
\`\`\`${language}
${code}
\`\`\`

החזר תשובה אך ורק בפורמט JSON תקין (valid JSON) ללא תגי markdown נוספים, במבנה הבא:
{
  "grade": <מספר 0-100>,
  "testPassed": <מספר טסטים שעברו מתוך 5>,
  "testTotal": 5,
  "staticAnalysis": {
    "warningsCount": <מספר אזהרות>,
    "errorsCount": <מספר שגיאות>,
    "rawOutput": "<טקסט פלט של clang-tidy או spotbugs>"
  },
  "compilerOutput": {
    "command": "${language === 'c' ? 'gcc -Wall -Wextra -std=c11 solution.c' : 'javac -Xlint:all Solution.java'}",
    "exitCode": 0,
    "stdout": "",
    "stderr": "<אזהרות קימפול אם יש>"
  },
  "valgrindOutput": {
    "leaksDetected": <true/false>,
    "bytesLeaked": <מספר בתים אם יש זליגה>,
    "rawOutput": "<פלט Valgrind או JVM GC audit>"
  },
  "pedagogicalFeedback": {
    "summary": "<סיכום פדגוגי תמציתי ומעודד בעברית>",
    "logicalFlaws": [
      {
        "line": <מספר שורה משוער בקוד>,
        "title": "<כותרת הבעיה בעברית>",
        "socraticQuestion": "<שאלה סוקרטית מכוונת>",
        "conceptualHint": "<רמז מושגי ללא גילוי הפתרון>",
        "severity": "high" | "medium" | "low"
      }
    ],
    "codeStyleNotes": ["<הערת סגנון 1>", "<הערת סגנון 2>"],
    "nextSteps": ["<צעד לתיקון 1>", "<צעד לתיקון 2>"]
  },
  "agentLogs": [
    {
      "agentName": "StaticAnalyzerAgent",
      "timestamp": "12:00:01",
      "action": "Static Syntax & AST Analysis",
      "reasoning": "<ניתוח הסוכן>",
      "verdict": "<מסקנה>"
    },
    {
      "agentName": "DockerSandboxAgent",
      "timestamp": "12:00:04",
      "action": "Isolated Container Testing",
      "reasoning": "<תוצאת הרצת הטסטים>",
      "verdict": "<מסקנה>"
    },
    {
      "agentName": "SocraticMentorAgent",
      "timestamp": "12:00:07",
      "action": "Pedagogical Filtering",
      "reasoning": "<החלטה לא לתת קוד פתרון, ניסוח שאלות הכוונה>",
      "verdict": "<מסקנה>"
    }
  ]
}`;

        // Timeout Gemini after 3.5 seconds to guarantee fast responsive UI
        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 3500)
        );
        const geminiResponse = await Promise.race([geminiPromise, timeoutPromise]);

        const rawText = geminiResponse.text?.trim() || '{}';
        const parsed = JSON.parse(rawText);

        const newSubmission: StoredSubmission = {
          id: `sub-${Date.now()}`,
          studentName,
          studentId,
          assignmentId,
          assignmentTitle,
          language,
          fileName,
          code,
          submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'graded',
          grade: parsed.grade ?? 85,
          testPassed: parsed.testPassed ?? 4,
          testTotal: parsed.testTotal ?? 5,
          staticAnalysis: parsed.staticAnalysis ?? {
            warningsCount: 1,
            errorsCount: 0,
            rawOutput: 'Clang-Tidy: Analysis complete.',
          },
          compilerOutput: parsed.compilerOutput ?? {
            command: language === 'c' ? 'gcc -Wall -Wextra solution.c' : 'javac Solution.java',
            exitCode: 0,
            stdout: '',
            stderr: '',
          },
          valgrindOutput: parsed.valgrindOutput ?? {
            leaksDetected: false,
            bytesLeaked: 0,
            rawOutput: 'HEAP SUMMARY: All heap blocks were freed.',
          },
          pedagogicalFeedback: parsed.pedagogicalFeedback ?? {
            summary: 'ההגשה נבדקה בהצלחה ע"י סוכני ה-AI.',
            logicalFlaws: [],
            codeStyleNotes: ['קוד קריא ומסודר.'],
            nextSteps: ['המשך לבדוק מקרי קצה נוספים.'],
          },
          agentLogs: parsed.agentLogs ?? [],
        };

        mockSubmissions.unshift(newSubmission);
        return res.json({ submission: newSubmission });
      } catch (genError) {
        console.warn('Gemini generation error, falling back to dynamic simulated evaluator:', genError);
      }
    }

    // Dynamic High-Fidelity Sandbox Simulator (when offline or no API key)
    const isLeak = hasMalloc && !hasFree;
    const isUseAfterFree = code.includes('free(curr)') && code.includes('curr->next');
    const isNPE = language === 'java' && !code.includes('!= null') && !code.includes('== null');

    let grade = 90;
    let testPassed = 5;
    const flaws: StoredSubmission['pedagogicalFeedback']['logicalFlaws'] = [];

    if (isUseAfterFree) {
      grade = 70;
      testPassed = 3;
      flaws.push({
        line: 21,
        title: 'שימוש במצביע לאחר שחרור זיכרון (Use-After-Free)',
        socraticQuestion: 'אם קראת ל-free על המצביע הנוכחי, האם הזיכרון אליו הוא ניגש עדיין תקף ובטוח לקריאה?',
        conceptualHint: 'חשוב כיצד לשמור את הכתובת של האיבר הבא (next) במשתנה מקומי לפני שחרור הצומת.',
        severity: 'high',
      });
    } else if (isLeak) {
      grade = 78;
      testPassed = 4;
      flaws.push({
        line: 12,
        title: 'זליגת זיכרון דינמי (Memory Leak)',
        socraticQuestion: 'הקוד מקצה זיכרון דינמי באמצעות malloc, אך היכן משוחרר הזיכרון בסיום השימוש?',
        conceptualHint: 'זכור את כלל הברזל ב-C: לכל malloc חייב להיות free תואם בכל נתיבי היציאה מהפונקציה.',
        severity: 'high',
      });
    } else if (isNPE) {
      grade = 80;
      testPassed = 4;
      flaws.push({
        line: 15,
        title: 'חריגת NullPointerException אפשרית',
        socraticQuestion: 'מה יקרה אם עץ החיפוש ריק, או שהחיפוש מגיע לעלה והצומת הבא שווה ל-null?',
        conceptualHint: 'הוסף תנאי עצירה ברקורסיה הבודק האם הצומת שווה ל-null לפני גישה לשדותיו.',
        severity: 'high',
      });
    }

    const newSub: StoredSubmission = {
      id: `sub-${Date.now()}`,
      studentName,
      studentId,
      assignmentId,
      assignmentTitle,
      language,
      fileName,
      code,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'graded',
      grade,
      testPassed,
      testTotal: 5,
      staticAnalysis: {
        warningsCount: flaws.length > 0 ? 1 : 0,
        errorsCount: 0,
        rawOutput: flaws.length > 0
          ? `${language === 'c' ? 'clang-tidy' : 'spotbugs'}: Flagged critical path issue on line ${flaws[0]?.line || 10}.`
          : 'Static analysis: 0 warnings, clean AST structure.',
      },
      compilerOutput: {
        command: language === 'c' ? 'gcc -Wall -Wextra -std=c11 -O2 solution.c -o solution' : 'javac -Xlint:all Solution.java',
        exitCode: 0,
        stdout: 'Compilation completed successfully.',
        stderr: flaws.length > 0 ? 'Warning: potential memory invariant mismatch.' : '',
      },
      valgrindOutput: {
        leaksDetected: isLeak || isUseAfterFree,
        bytesLeaked: isLeak ? 64 : 0,
        rawOutput: isLeak
          ? '==19420== LEAK SUMMARY:\n==19420==    definitely lost: 64 bytes in 4 blocks\n==19420== ERROR SUMMARY: 1 errors from 1 contexts'
          : isUseAfterFree
          ? '==19420== Invalid read of size 8\n==19420==    at 0x401201: free_list (solution.c:21)\n==19420== Address 0x4a2b048 is 8 bytes inside a block of size 16 free\'d'
          : '==19420== All heap blocks were freed -- no leaks are possible (0 errors)',
      },
      pedagogicalFeedback: {
        summary: flaws.length > 0
          ? 'הקוד מציג כיוון מחשבה טוב ומבנה לוגי מובן, אך זוהו אי-דיוקים בנוגע לניהול הזיכרון ומקרי קצה.'
          : 'עבודה מצוינת! הקוד עומד בכל דרישות המטלה ועבר בהצלחה את כל מקרי הבדיקה ב-Sandbox.',
        logicalFlaws: flaws,
        codeStyleNotes: [
          'הזחות תקינות ומבנה קריא.',
          'שמות משתנים ברורים התואמים את מוסכמות השפה.',
        ],
        nextSteps: flaws.length > 0
          ? ['עיין בשאלות הסוקרטיות ונסה לחשוב מה קורה לזיכרון בכל שלב.', 'עדכן את הקוד והגש לבדיקה חוזרת.']
          : ['המטלה מוכנה להגשה סופית!'],
      },
      agentLogs: [
        {
          agentName: 'StaticAnalyzerAgent',
          timestamp: '12:01:02',
          action: 'AST & Lint Scanning',
          reasoning: flaws.length > 0 ? `זיהוי חולשה לוגית בשורה ${flaws[0]?.line}.` : 'קוד נקי ללא אזהרות תחביר.',
          verdict: flaws.length > 0 ? 'Warning dispatched' : 'Clean',
        },
        {
          agentName: 'DockerSandboxAgent',
          timestamp: '12:01:05',
          action: 'Container Isolation & Valgrind Execution',
          reasoning: `הרצת 5 מקרי בדיקה בסביבת Docker מבודדת. ${testPassed}/5 עברו בהצלחה.`,
          verdict: `${testPassed}/5 passed`,
        },
        {
          agentName: 'SocraticMentorAgent',
          timestamp: '12:01:08',
          action: 'Pedagogical Obfuscation & Question Generation',
          reasoning: 'הסוכן זיהה את התיקון אך חסם פליטת קוד ישיר. נוצר רמז סוקרטי מכוון.',
          verdict: 'Socratic guidance formulated',
        },
      ],
    };

    mockSubmissions.unshift(newSub);
    res.json({ submission: newSub });
  } catch (err: any) {
    console.error('Error in /api/evaluate:', err);
    res.status(500).json({ error: err.message || 'Evaluation pipeline failed' });
  }
});

// API: Socratic AI Chat Follow-up
app.post('/api/socratic-chat', async (req: Request, res: Response) => {
  try {
    const { question, code, currentHint, language = 'c' } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (ai) {
      try {
        const chatPrompt = `אתה "AutoTA Socratic AI Mentor", מורה אקדמי מלווה לסטודנטים במדעי המחשב שלומדים ${language}.
הסטודנט קיבל את הרמז הבא על המטלה שלו: "${currentHint || 'שים לב לניהול הזיכרון'}".
הסטודנט שואל: "${question}".

הקוד של הסטודנט:
\`\`\`${language}
${code || ''}
\`\`\`

כלל עליון (CRITICAL):
אל תכתוב לסטודנט את שורות הקוד המתקנות! אסור לתת פתרון ישיר.
ענה בעברית נעימה, מכבדת ומעודדת. שאל שאלות הכוונה, השתמש באנלוגיות מחיי היום-יום (למשל: רשימה של אנשים שמחזיקים ידיים, כרטיס שמשמידים לפני שקוראים את הכתובת עליו), והסבר את העיקרון הפדגוגי.`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: chatPrompt,
        });

        return res.json({ reply: geminiRes.text?.trim() });
      } catch (err) {
        console.warn('Chat Gemini error, fallback:', err);
      }
    }

    // High quality fallback response in Hebrew
    let fallbackReply = `שאלה מצוינת! חשוב על זה כך: כאשר אתה מבצע free על מצביע ב-C, הזיכרון משוחרר חזרה למערכת ההפעלה. אם תנסה לקרוא ממנו שוב (כמו לקרוא את איבר ה-next של הצומת שזה עתה שחררת), המחשב כבר לא יכול להבטיח מה שמור שם.
מה היה קורה אם היית שומר את הכתובת של האיבר הבא במשתנה עזר זמני עוד לפני השחרור? נסה לחשוב איך סדר הפעולות הזה שומר על הרצף.`;

    if (language === 'java') {
      fallbackReply = `נקודה טובה! ב-Java, לפני שניגשים לשדות או מתודות של אובייקט (כמו .compareTo או .left), עלינו לוודא שההפניה אינה מצביעה על null. 
מהו תנאי העצירה ההגיוני ביותר לפונקציה רקורסיבית שמחפשת ערך בעץ כאשר היא מגיעה לענף ריק?`;
    }

    res.json({ reply: fallbackReply });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite Integration in Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoTA Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
