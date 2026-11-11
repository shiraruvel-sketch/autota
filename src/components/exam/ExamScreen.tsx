import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  HelpCircle, 
  Code, 
  ArrowLeft, 
  ArrowRight, 
  FileCheck,
  Award,
  ChevronDown,
  X
} from 'lucide-react';

export interface ExamQuestion {
  id: number;
  type: 'multiple-choice' | 'coding';
  points: number;
  title: string;
  description: string;
  options?: { id: string; text: string; isCorrect: boolean }[];
  starterCode?: string;
  language?: 'c' | 'java';
}

export interface ExamCourse {
  id: string;
  title: string;
  code: string;
  durationMinutes: number;
  description: string;
  questions: ExamQuestion[];
}

export const EXAM_COURSES: ExamCourse[] = [
  {
    id: 'course-c-os',
    title: 'מבוא למערכות הפעלה ותכנות מערכות ב-C',
    code: '89-210',
    durationMinutes: 90,
    description: 'מבחן על ניהול זיכרון דינמי, מצביעים, זליגות Valgrind, ומבני נתונים ב-C.',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        points: 20,
        title: 'שאלה 1: גישה לזיכרון לאחר שחרור ב-C',
        description: 'נתון קטע הקוד הבא: \n`Node* curr = head; free(curr); curr = curr->next;`\nמה תהיה התוצאה של שורות אלו בזמן ריצה בסביבת לינוקס x86_64?',
        options: [
          { id: 'a', text: 'הקוד יעבוד תקין לחלוטין מכיוון ש-curr עדיין מכיל את הכתובת הישנה.', isCorrect: false },
          { id: 'b', text: 'שגיאת Use-After-Free: גישה לבלוק זיכרון משוחרר שעלולה להוביל ל-Segmentation Fault או התנהגות בלתי מוגדרת (Undefined Behavior).', isCorrect: true },
          { id: 'c', text: 'הקומפיילר יסרב לקמפל את הקוד עם שגיאת Syntax Error.', isCorrect: false },
          { id: 'd', text: 'מערכת ההפעלה תשחזר את הזיכרון באופן אוטומטי מתוך ה-Stack.', isCorrect: false },
        ],
      },
      {
        id: 2,
        type: 'multiple-choice',
        points: 20,
        title: 'שאלה 2: כלי אבחון זיכרון וקומפילציה',
        description: 'איזה דגל קומפילציה ב-GCC ואיזה כלי מערכת מאפשרים לאתר זליגות זיכרון (Memory Leaks) וקריאות מחוץ לגבולות המערך בזמן ריצה?',
        options: [
          { id: 'a', text: 'דגל -fsanitize=address ב-GCC וכלי הפרופיילינג Valgrind (Memcheck).', isCorrect: true },
          { id: 'b', text: 'דגל -O3 בלבד ללא שום כלי חיצוני.', isCorrect: false },
          { id: 'c', text: 'פקודת ls -la ושימוש ב-grep.', isCorrect: false },
          { id: 'd', text: 'דגל -std=c89 בתוספת כלי Make.', isCorrect: false },
        ],
      },
      {
        id: 3,
        type: 'multiple-choice',
        points: 20,
        title: 'שאלה 3: שחרור זיכרון ורשימות מקושרות',
        description: 'כיצד יש לבצע שחרור זיכרון מלא של רשימה מקושרת חד-כיוונית מבלי לאבד מצביעים ומבלי לייצר שגיאות זיכרון?',
        options: [
          { id: 'a', text: 'שמירת מצביע זמני לאיבר הבא (next) לפני שחרור הצומת הנוכחי עם free().', isCorrect: true },
          { id: 'b', text: 'קריאה ל-free(head) פעם אחת בלבד עבור כל הרשימה.', isCorrect: false },
          { id: 'c', text: 'ביצוע השמה head = NULL ללא קריאה ל-free().', isCorrect: false },
          { id: 'd', text: 'שחרור האיברים בסדר הפוך באמצעות רקורסיה עמוקה ללא תנאי עצירה.', isCorrect: false },
        ],
      },
      {
        id: 4,
        type: 'coding',
        points: 40,
        title: 'שאלה 4 (חלק מעשי): מימוש מחיקת איבר מרשימה ב-C',
        description: 'כתוב פונקציה ב-C בשם `int remove_val(Node** head, int target)` שמוחקת את הצומת הראשון ברשימה המקושרת שמכיל את הערך `target`, משחררת את הזיכרון שלו ב-`free()`, ומחזירה 1 אם נמצא ונמחק, או 0 אם לא נמצא. יש להקפיד על שחרור מלא ללא זליגת Valgrind!',
        language: 'c',
        starterCode: `// מימוש פונקציית מחיקה תקנית ללא זליגת זיכרון
int remove_val(Node** head, int target) {
    if (head == NULL || *head == NULL) {
        return 0; // רשימה ריקה
    }

    Node* curr = *head;
    Node* prev = NULL;

    while (curr != NULL) {
        if (curr->val == target) {
            if (prev == NULL) {
                *head = curr->next;
            } else {
                prev->next = curr->next;
            }
            free(curr); // שחרור תקין של הצומת שנמחק!
            return 1;
        }
        prev = curr;
        curr = curr->next;
    }
    return 0; // לא נמצא
}`,
      },
    ],
  },
  {
    id: 'course-java-ds',
    title: 'מבני נתונים ואלגוריתמים ב-Java',
    code: '89-120',
    durationMinutes: 90,
    description: 'מבחן על עצי חיפוש בינאריים, גנריות (Generics), טיפול ב-NullPointerException ומורכבות זמן ריצה.',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        points: 20,
        title: 'שאלה 1: חריגת מצביע ריק בעצים בינאריים',
        description: 'בחיפוש רקורסיבי בעץ BST ב-Java, מתי תתרחש חריגת NullPointerException?',
        options: [
          { id: 'a', text: 'כאשר ניגשים לשדה current.data או ל-current.left כאשר current הוא null (למשל בעץ ריק או הגעה לעלה).', isCorrect: true },
          { id: 'b', text: 'כאשר הערך המבוקש שווה בדיוק לערך השורש.', isCorrect: false },
          { id: 'c', text: 'כאשר גובה העץ גדול מ-10.', isCorrect: false },
          { id: 'd', text: 'כאשר כל הצמתים בעץ מכילים מספרים זוגיים.', isCorrect: false },
        ],
      },
      {
        id: 2,
        type: 'multiple-choice',
        points: 20,
        title: 'שאלה 2: שימוש ב-Generics ו-Comparable',
        description: 'מדוע מחלקת עץ חיפוש בינארי ב-Java מוגדרת כ-`class BinarySearchTree<T extends Comparable<T>>`?',
        options: [
          { id: 'a', text: 'כדי להבטיח שלאיברים מטיפוס T קיימת מתודת compareTo לצורך השוואה ומיקום בעץ.', isCorrect: true },
          { id: 'b', text: 'כדי לחסוך מקום בזיכרון של ה-JVM.', isCorrect: false },
          { id: 'c', text: 'כדי לאפשר רק מחרוזות בעץ.', isCorrect: false },
          { id: 'd', text: 'כדי להפוך את העץ ל-Thread-safe באופן אוטומטי.', isCorrect: false },
        ],
      },
      {
        id: 3,
        type: 'multiple-choice',
        points: 20,
        title: 'שאלה 3: מנגנון ניהול הזיכרון (GC) ב-Java',
        description: 'מה ההבדל העקרוני בין ניהול הזיכרון ב-Java לבין ניהול הזיכרון ב-C?',
        options: [
          { id: 'a', text: 'ב-Java ה-Garbage Collector מזהה אובייקטים ללא הפניות ומשחררם אוטומטית, בעוד שב-C המתכנת חייב לקרוא ל-free().', isCorrect: true },
          { id: 'b', text: 'ב-Java אין כלל שימוש ב-Heap.', isCorrect: false },
          { id: 'c', text: 'ב-C יש מנגנון GC מובנה שמופעל ע"י הקומפיילר.', isCorrect: false },
          { id: 'd', text: 'ב-Java הזיכרון משוחרר רק בסגירת המחשב.', isCorrect: false },
        ],
      },
      {
        id: 4,
        type: 'coding',
        points: 40,
        title: 'שאלה 4 (חלק מעשי): חיפוש רקורסיבי מוגן ב-BST',
        description: 'כתוב מתודה ב-Java בשם `boolean contains(Node current, T val)` שמחזירה true אם val קיים בעץ ו-false אחרת, תוך הגנה מוחלטת מחריגת NullPointerException!',
        language: 'java',
        starterCode: `// מימוש חיפוש רקורסיבי תקני עם בדיקת תנאי עצירה
public boolean contains(Node current, T val) {
    if (current == null || val == null) {
        return false; // תנאי עצירה: הגענו לענף ריק!
    }

    int cmp = val.compareTo(current.data);
    if (cmp == 0) {
        return true; // נמצא!
    }
    return cmp < 0 ? contains(current.left, val) : contains(current.right, val);
}`,
      },
    ],
  },
  {
    id: 'course-arch',
    title: 'ארכיטקטורת מחשבים ותקשורת מערכות',
    code: '89-310',
    durationMinutes: 90,
    description: 'מבחן על תהליכים, קריאת המערכת fork(), אותות (Signals), ותקשורת Pipes.',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        points: 20,
        title: 'שאלה 1: קריאת המערכת fork()',
        description: 'מה מחזירה קריאת המערכת fork() לתהליך האב ולתהליך הבן בהתאמה במקרה של הצלחה?',
        options: [
          { id: 'a', text: 'לאב מוחזר ה-PID של הבן (מספר חיובי), ולבן מוחזר 0.', isCorrect: true },
          { id: 'b', text: 'לשניהם מוחזר תמיד 1.', isCorrect: false },
          { id: 'c', text: 'לאב מוחזר 0 ולבן מוחזר ה-PID של האב.', isCorrect: false },
          { id: 'd', text: 'לשניהם מוחזר מספר שלילי -1.', isCorrect: false },
        ],
      },
      {
        id: 2,
        type: 'multiple-choice',
        points: 20,
        title: 'שאלה 2: טיפול באותות (Signals)',
        description: 'איזה אות (Signal) בלינוקס לא ניתן לתפוס (Catch) או להתעלם ממנו באמצעות פונקציית signal / sigaction?',
        options: [
          { id: 'a', text: 'SIGKILL (אות 9) ו-SIGSTOP.', isCorrect: true },
          { id: 'b', text: 'SIGINT (Ctrl+C).', isCorrect: false },
          { id: 'c', text: 'SIGALRM.', isCorrect: false },
          { id: 'd', text: 'SIGCHLD.', isCorrect: false },
        ],
      },
      {
        id: 3,
        type: 'multiple-choice',
        points: 20,
        title: 'שאלה 3: תקשורת Pipes בין תהליכים',
        description: 'כמה מזהי קבצים (File Descriptors) מוקצים בקריאה מוצלחת ל-pipe(int fd[2]), ולאיזה כיוון זורם המידע?',
        options: [
          { id: 'a', text: 'מוקצים 2 מזהים: fd[0] לקריאה ו-fd[1] לכתיבה.', isCorrect: true },
          { id: 'b', text: 'מוקצה מזהה 1 שמשמש לקריאה וכתיבה במקביל.', isCorrect: false },
          { id: 'c', text: 'מוקצים 4 מזהים עבור כל מעבד במחשב.', isCorrect: false },
          { id: 'd', text: 'המידע זורם תמיד מ-fd[0] אל fd[1].', isCorrect: false },
        ],
      },
      {
        id: 4,
        type: 'coding',
        points: 40,
        title: 'שאלה 4 (חלק מעשי): העברת נתונים ב-Pipe',
        description: 'כתוב קטע קוד ב-C שמייצר צינור pipe, משכפל תהליך עם fork(), והאב כותב לצינור את המחרוזת "Hello Pipe" בעוד הבן קורא אותה ומדפיס למסך.',
        language: 'c',
        starterCode: `#include <stdio.h>
#include <unistd.h>
#include <string.h>

void run_pipe_demo() {
    int pipefd[2];
    pipe(pipefd);

    pid_t pid = fork();
    if (pid == 0) {
        // תהליך בן: קורא מהצינור
        close(pipefd[1]); // סגירת קצה כתיבה
        char buffer[32];
        read(pipefd[0], buffer, sizeof(buffer));
        printf("Child received: %s\\n", buffer);
        close(pipefd[0]);
    } else {
        // תהליך אב: כותב לצינור
        close(pipefd[0]); // סגירת קצה קריאה
        char msg[] = "Hello Pipe";
        write(pipefd[1], msg, strlen(msg) + 1);
        close(pipefd[1]);
    }
}`,
      },
    ],
  },
];

interface ExamScreenProps {
  onExitExam: () => void;
  onExamSubmitted: (examGrade: number) => void;
}

export const ExamScreen: React.FC<ExamScreenProps> = ({
  onExitExam,
  onExamSubmitted,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(EXAM_COURSES[0].id);
  const currentCourse = EXAM_COURSES.find((c) => c.id === selectedCourseId) || EXAM_COURSES[0];

  const [secondsRemaining, setSecondsRemaining] = useState<number>(currentCourse.durationMinutes * 60);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [codingAnswers, setCodingAnswers] = useState<Record<number, string>>({
    4: currentCourse.questions[3]?.starterCode || '',
  });

  const [tabSwitchesCount, setTabSwitchesCount] = useState<number>(0);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<{
    score: number;
    courseTitle: string;
    details: string;
    breakdown: { qId: number; title: string; earned: number; max: number }[];
  } | null>(null);

  // When course changes, reset question answers
  const handleCourseChange = (newCourseId: string) => {
    const course = EXAM_COURSES.find((c) => c.id === newCourseId);
    if (course) {
      setSelectedCourseId(newCourseId);
      setActiveQuestionIdx(0);
      setAnswers({});
      setCodingAnswers({
        4: course.questions[3]?.starterCode || '',
      });
      setSecondsRemaining(course.durationMinutes * 60);
      setExamResult(null);
    }
  };

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Proctoring tab switch listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchesCount((prev) => prev + 1);
        setShowWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const currentQ = currentCourse.questions[activeQuestionIdx];

  const handleSelectOption = (qId: number, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
  };

  const handleSubmitExam = () => {
    let score = 0;
    const breakdown = [];

    // Questions 1, 2, 3 (Multiple Choice check)
    for (let i = 0; i < 3; i++) {
      const q = currentCourse.questions[i];
      const correctOpt = q.options?.find((o) => o.isCorrect)?.id;
      const isCorrect = answers[q.id] === correctOpt;
      const earned = isCorrect ? q.points : 0;
      score += earned;
      breakdown.push({ qId: q.id, title: q.title, earned, max: q.points });
    }

    // Question 4 (Coding Question)
    const q4 = currentCourse.questions[3];
    const code = codingAnswers[4] || '';
    let q4Earned = 40;
    if (selectedCourseId === 'course-c-os') {
      const hasFree = code.includes('free(curr)');
      const hasPrevUpdate = code.includes('prev->next') || code.includes('*head =');
      q4Earned = (hasFree && hasPrevUpdate) ? 40 : hasFree ? 25 : 10;
    } else if (selectedCourseId === 'course-java-ds') {
      const hasNullCheck = code.includes('current == null') || code.includes('val == null');
      const hasCompare = code.includes('compareTo');
      q4Earned = (hasNullCheck && hasCompare) ? 40 : 20;
    } else {
      const hasPipe = code.includes('pipe(');
      const hasFork = code.includes('fork()');
      q4Earned = (hasPipe && hasFork) ? 40 : 20;
    }
    score += q4Earned;
    breakdown.push({ qId: q4.id, title: q4.title, earned: q4Earned, max: q4.points });

    setExamResult({
      score,
      courseTitle: currentCourse.title,
      details: score >= 80 
        ? 'ביצועים מצוינים! הבנה מעמיקה של עקרונות המקצוע.'
        : 'נמצאו מספר אי-דיוקים. מומלץ לעבור על המשוב הפדגוגי.',
      breakdown,
    });

    onExamSubmitted(score);
  };

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isAnswered = (qId: number) => {
    if (qId === 4) return Boolean(codingAnswers[4]?.trim());
    return Boolean(answers[qId]);
  };

  const totalAnsweredCount = currentCourse.questions.filter((q) => isAnswered(q.id)).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Proctoring Warning Banner */}
      {showWarning && (
        <div className="p-3.5 bg-red-950/90 border border-red-700 rounded-xl text-red-200 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>אזהרת השגחה (Proctor Alert):</strong> זוהתה עזיבה של חלון הבחינה ({tabSwitchesCount} פעמים). על פי תקנון המבחנים, כל מעבר טאב מתועד ביומן הנבחן.
            </span>
          </div>
          <button onClick={() => setShowWarning(false)} className="p-1 text-red-300 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Exam Header Strip with Course Selector */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 border border-red-800/80 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center animate-pulse">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">
                {currentCourse.title} ({currentCourse.code})
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/30 text-red-200 border border-red-500/40">
                מצב בחינה מוגבל בזמן
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentCourse.description} · משך: {currentCourse.durationMinutes} דקות
            </p>
          </div>
        </div>

        {/* Course Picker & Live Countdown */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Course Subject Selector */}
          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="appearance-none bg-slate-900/90 border border-red-800 text-xs rounded-xl px-3.5 py-2 pl-8 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium cursor-pointer"
            >
              {EXAM_COURSES.map((course) => (
                <option key={course.id} value={course.id}>
                  מקצוע: {course.title} ({course.code})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-red-700/80 px-3.5 py-2 rounded-xl font-mono shadow-inner">
            <Clock className="w-4 h-4 text-red-400 animate-spin" />
            <span className="text-lg font-extrabold text-red-400 tracking-wider">
              {formattedTime}
            </span>
          </div>

          <button
            onClick={onExitExam}
            className="text-xs px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            יציאה ממצב מבחן
          </button>
        </div>
      </div>

      {/* Main Exam Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Questions Navigator */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                טופס שאלות הבחינה ({currentCourse.code}):
              </span>
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                נענו {totalAnsweredCount} מתוך {currentCourse.questions.length}
              </span>
            </div>

            <div className="space-y-2">
              {currentCourse.questions.map((q, idx) => {
                const isSelected = activeQuestionIdx === idx;
                const answered = isAnswered(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`w-full text-right p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                          answered
                            ? 'bg-emerald-500 text-white'
                            : isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {answered ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {q.title}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {q.type === 'multiple-choice' ? 'שאלה אמריקאית' : 'כתיבת קוד מעשי'} · {q.points} נק'
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-medium text-slate-400">
                      {answered ? 'נענה' : 'ממתין'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Submit Exam Button */}
            <div className="pt-2">
              <button
                onClick={handleSubmitExam}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>הגש מבחן סופי עכשיו</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Viewer & Answer Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            {/* Question Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold flex items-center justify-center">
                  {currentQ.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {currentQ.title}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 w-fit">
                ניקוד: {currentQ.points} נקודות
              </span>
            </div>

            {/* Question Text / Prompt */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
              {currentQ.description}
            </div>

            {/* Question Type: Multiple Choice */}
            {currentQ.type === 'multiple-choice' && currentQ.options && (
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  בחר את התשובה הנכונה ביותר:
                </label>
                {currentQ.options.map((opt) => {
                  const isChecked = answers[currentQ.id] === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      className={`w-full text-right p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isChecked
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-400'
                        }`}
                      >
                        {isChecked && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <div className="text-xs sm:text-sm leading-relaxed">
                        <strong className="ml-1 uppercase font-mono">{opt.id}.</strong> {opt.text}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Question Type: Coding Question */}
            {currentQ.type === 'coding' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>עורך פתרון השאלה המעשית ({currentQ.language?.toUpperCase()}):</span>
                  <span className="font-mono text-[10px] text-slate-400">קוד נבדק אוטומטית בהגשה</span>
                </label>

                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs text-left" dir="ltr">
                  <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/60 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>solution.{currentQ.language === 'c' ? 'c' : 'java'}</span>
                    <span>Sandbox Test Harness</span>
                  </div>
                  <textarea
                    value={codingAnswers[currentQ.id] || ''}
                    onChange={(e) => setCodingAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
                    className="w-full h-64 p-4 bg-transparent text-slate-200 font-mono text-xs resize-none focus:outline-none leading-relaxed selection:bg-cyan-500/30"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={activeQuestionIdx === 0}
                onClick={() => setActiveQuestionIdx((prev) => prev - 1)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>שאלה קודמת</span>
              </button>

              <div className="text-xs text-slate-400 font-mono">
                שאלה {activeQuestionIdx + 1} מתוך {currentCourse.questions.length}
              </div>

              {activeQuestionIdx < currentCourse.questions.length - 1 ? (
                <button
                  onClick={() => setActiveQuestionIdx((prev) => prev + 1)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                >
                  <span>שאלה הבאה</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm cursor-pointer"
                >
                  <span>סיום והגשת מבחן</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exam Result Summary Modal */}
      {examResult && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-right space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    סיכום תוצאות הבחינה
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {examResult.courseTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Score Showcase */}
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-800/50 text-center space-y-1">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                הציון המשוקלל בבחינה:
              </span>
              <div className="text-4xl font-extrabold text-white font-mono">
                {examResult.score} <span className="text-lg text-slate-400 font-sans">/ 100</span>
              </div>
              <p className="text-xs text-slate-300 pt-1">{examResult.details}</p>
            </div>

            {/* Question Breakdown */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                פירוט ציונים לפי שאלות:
              </h5>
              {examResult.breakdown.map((item) => (
                <div
                  key={item.qId}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {item.title}
                  </span>
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    {item.earned}/{item.max} נק'
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={onExitExam}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                חזור לפורטל הסטודנט
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
