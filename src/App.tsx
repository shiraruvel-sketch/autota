import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { StudentPortal } from './components/student/StudentPortal';
import { TADashboard } from './components/ta/TADashboard';
import { AgentLogsViewer } from './components/ta/AgentLogsViewer';
import { BackendBlueprint } from './components/backend/BackendBlueprint';
import { PlagiarismDetector } from './components/plagiarism/PlagiarismDetector';
import { TimedExamBanner } from './components/exam/TimedExamBanner';
import { ExamScreen } from './components/exam/ExamScreen';
import { Submission } from './types/autota';
import { fetchSubmissions } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('student');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isExamMode, setIsExamMode] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubForLogs, setSelectedSubForLogs] = useState<Submission | null>(null);

  // Sync dark class on document element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Load initial submissions
  useEffect(() => {
    async function load() {
      const data = await fetchSubmissions();
      if (data && data.length > 0) {
        setSubmissions(data);
      }
    }
    load();
  }, []);

  const handleNewSubmission = (newSub: Submission) => {
    setSubmissions((prev) => [newSub, ...prev]);
  };

  const handleOpenAgentLogs = (sub: Submission) => {
    setSelectedSubForLogs(sub);
    setActiveTab('agent-logs');
  };

  const handleUpdateGrade = (subId: string, newGrade: number) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, grade: newGrade } : s))
    );
  };

  const handleExamTimeExpired = () => {
    setIsExamMode(false);
    setActiveTab('student');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        toggleDarkMode={() => setIsDark(!isDark)}
        isExamMode={isExamMode}
        toggleExamMode={() => setIsExamMode(!isExamMode)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isExamMode ? (
          <ExamScreen
            onExitExam={() => setIsExamMode(false)}
            onExamSubmitted={(grade) => {
              // Add exam result to submissions list
              const examSub: Submission = {
                id: `exam-${Date.now()}`,
                studentName: 'יונתן כהן',
                studentId: '318942105',
                assignmentId: 'exam-midterm',
                assignmentTitle: 'בוחן אמצע סמסטר (מבוא למערכות הפעלה)',
                language: 'c',
                fileName: 'exam_submission.c',
                code: '// קוד פתרון מבחן סופי',
                submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                status: 'graded',
                grade,
                testPassed: grade >= 80 ? 4 : 3,
                testTotal: 4,
                staticAnalysis: { warningsCount: 0, errorsCount: 0, rawOutput: 'Exam AST validation passed.' },
                compilerOutput: { command: 'gcc -Wall exam.c', exitCode: 0, stdout: 'Compiled.', stderr: '' },
                valgrindOutput: { leaksDetected: false, bytesLeaked: 0, rawOutput: '0 leaks detected in exam sandbox.' },
                pedagogicalFeedback: {
                  summary: 'הבחינה נבדקה בהצלחה. ציון משוקלל חושב על סמך 3 שאלות רב-ברירה ושאלת תכנות מעשית.',
                  logicalFlaws: [],
                  codeStyleNotes: ['עמידה בזמנים', 'ניהול זיכרון תקין'],
                  nextSteps: ['ציון הבחינה נקלט במערכת הציונים האוניברסיטאית.']
                },
                agentLogs: [
                  {
                    agentName: 'SocraticMentorAgent',
                    timestamp: '13:00',
                    action: 'Exam Final Grading',
                    reasoning: 'Exam submitted within deadline. Score calculated.',
                    verdict: `Final Grade: ${grade}`
                  }
                ]
              };
              setSubmissions((prev) => [examSub, ...prev]);
            }}
          />
        ) : (
          <>
            {activeTab === 'student' && (
              <StudentPortal
                submissions={submissions}
                onNewSubmission={handleNewSubmission}
              />
            )}

            {activeTab === 'ta' && (
              <TADashboard
                submissions={submissions}
                onOpenAgentLogs={handleOpenAgentLogs}
                onUpdateGrade={handleUpdateGrade}
              />
            )}

            {activeTab === 'plagiarism' && <PlagiarismDetector />}

            {activeTab === 'agent-logs' && (
              <AgentLogsViewer
                submissions={submissions}
                selectedSubmission={selectedSubForLogs}
                onSelectSubmission={setSelectedSubForLogs}
              />
            )}

            {activeTab === 'backend-blueprint' && <BackendBlueprint />}
          </>
        )}
      </main>

      {/* Quiet Footer adhering to anti-slop rules */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-500 bg-white/50 dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-mono">
            AutoTA © 2026 · מערכת בדיקה אוטומטית ומשוב פדגוגי מבוסס סוכנים
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>C Clang / Valgrind Engine</span>
            <span>·</span>
            <span>Java OpenJDK / JUnit 5</span>
            <span>·</span>
            <span>Python FastAPI & PostgreSQL Schema</span>
            <span>·</span>
            <span>MOSS & AI Similarity Audit</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
