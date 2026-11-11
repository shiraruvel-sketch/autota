import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Cpu, 
  Box, 
  Sparkles, 
  Terminal, 
  ArrowLeft,
  FastForward
} from 'lucide-react';
import { Submission } from '../../types/autota';

interface PipelineProgressModalProps {
  isOpen: boolean;
  language: 'c' | 'java';
  fileName: string;
  onComplete: (submission: Submission) => void;
  completedSubmission: Submission | null;
}

export const PipelineProgressModal: React.FC<PipelineProgressModalProps> = ({
  isOpen,
  language,
  fileName,
  onComplete,
  completedSubmission,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [autoOpenCountdown, setAutoOpenCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setLogs([]);
      setAutoOpenCountdown(null);
      return;
    }

    setLogs([
      `[00:00.1] Pipeline initialized for file: ${fileName}`,
      `[00:00.3] Target runtime environment: Linux x86_64 (${language.toUpperCase()})`,
      `[00:00.5] Launching Stage 1: Static Analyzer Agent (Clang-Tidy / SpotBugs)...`,
    ]);

    // Stage 1 -> Stage 2 after 1.2s
    const t1 = setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[00:01.1] Clang-Tidy & AST Semantic Checker active.`,
        `[00:01.3] Scanning pointer dereferences and memory allocation sites...`,
        `[00:01.6] Stage 1 finished. Dispatching flags to Stage 2...`,
      ]);
      setCurrentStep(2);
    }, 1200);

    // Stage 2 -> Stage 3 after 2.5s
    const t2 = setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[00:02.0] Spinning up isolated ephemeral Docker container (cgroups v2)...`,
        `[00:02.3] Running compiler with -Wall -Wextra and Valgrind memory profiler...`,
        `[00:02.6] Executing test cases: Test 1 [PASS], Test 2 [PASS], Test 3 [EVALUATED]...`,
        `[00:02.9] Sandbox isolation intact. Captured execution telemetry.`,
      ]);
      setCurrentStep(3);
    }, 2500);

    // Stage 3 -> Stage 4 after 3.8s
    const t3 = setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[00:03.2] Initializing Socratic Mentor Agent (Anti-Solution Filter Active)...`,
        `[00:03.5] Converting technical compiler diagnostics into guided pedagogical questions...`,
        `[00:03.8] Socratic feedback matrix synthesized successfully!`,
      ]);
      setCurrentStep(4);
      setAutoOpenCountdown(2);
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen, fileName, language]);

  // Handle countdown to auto-open the report
  useEffect(() => {
    if (autoOpenCountdown === null) return;
    if (autoOpenCountdown <= 0) {
      if (completedSubmission) {
        onComplete(completedSubmission);
      }
      return;
    }

    const timer = setTimeout(() => {
      setAutoOpenCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoOpenCountdown, completedSubmission, onComplete]);

  if (!isOpen) return null;

  const steps = [
    {
      id: 1,
      title: 'סורק קוד (Static Analysis)',
      desc: language === 'c' ? 'סריקת AST, אזהרות Clang-Tidy, בדיקת תחביר' : 'סריקת AST, CheckStyle, SpotBugs',
      icon: Cpu,
    },
    {
      id: 2,
      title: 'מריץ מקרי בדיקה בסביבה מבודדת (Docker)',
      desc: language === 'c' ? 'קומפילציית GCC, פרופיילר Valgrind, בדיקת זליגות זיכרון' : 'JVM Sandbox, בדיקות JUnit 5, זיהוי חריגות',
      icon: Box,
    },
    {
      id: 3,
      title: 'מייצר משוב פדגוגי (AI Mentor)',
      desc: 'ניסוח שאלות סוקרטיות מכוונות ללא חשיפת פתרון ישיר',
      icon: Sparkles,
    },
  ];

  const handleManualOpen = () => {
    if (completedSubmission) {
      onComplete(completedSubmission);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-right">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                תהליך בדיקה רב-סוכני (AutoTA Pipeline)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                קובץ: {fileName} · שפה: {language.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {completedSubmission && (
              <button
                onClick={handleManualOpen}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors"
                title="דלג ישירות לדוח"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>דלג לדוח</span>
              </button>
            )}

            <span className="text-xs font-mono font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 px-2.5 py-1 rounded-md">
              {currentStep === 4 ? 'הבדיקה הושלמה!' : `שלב ${Math.min(currentStep, 3)} מתוך 3`}
            </span>
          </div>
        </div>

        {/* 3 Step Visual Flow */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {steps.map((s) => {
              const Icon = s.icon;
              const isDone = currentStep > s.id;
              const isCurrent = currentStep === s.id;
              const isWaiting = currentStep < s.id;

              return (
                <div
                  key={s.id}
                  className={`p-4 rounded-xl border transition-all duration-300 flex items-start justify-between gap-4 ${
                    isCurrent
                      ? 'border-cyan-500 bg-cyan-50/40 dark:bg-cyan-950/30 shadow-sm'
                      : isDone
                      ? 'border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-cyan-600 text-white animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                          שלב {s.id}.
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {s.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {s.desc}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-left">
                    {isDone && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>הושלם</span>
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-xs text-cyan-600 dark:text-cyan-400 font-mono animate-pulse">
                        מעבד נתונים...
                      </span>
                    )}
                    {isWaiting && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        ממתין לתורו
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Terminal Output Window */}
          <div className="mt-4 bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-left text-slate-300 overflow-hidden" dir="ltr">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-500 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>agent-pipeline-stdout</span>
              </span>
              <span>sandbox-id: env_x86_cgroup</span>
            </div>
            <div className="mt-2.5 h-28 overflow-y-auto space-y-1 text-slate-400 font-mono text-[11.5px]">
              {logs.map((line, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-cyan-500 select-none">&gt;</span>
                  <span className={line.includes('PASS') || line.includes('finished') || line.includes('successfully') ? 'text-emerald-400' : 'text-slate-300'}>
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentStep === 4
              ? autoOpenCountdown !== null && autoOpenCountdown > 0
                ? `מעביר לדוח הפדגוגי בעוד ${autoOpenCountdown} שניות...`
                : 'הדוח מוכן לצפייה!'
              : 'הרצה בסביבה מבודדת... אנא המתן מספר שניות'}
          </p>

          <button
            onClick={handleManualOpen}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <span>פתח דוח משוב פדגוגי</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
