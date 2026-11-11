import React, { useState } from 'react';
import { 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  Box, 
  Sparkles, 
  Code, 
  Copy, 
  Check, 
  ChevronDown,
  Layers,
  FileText,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Submission } from '../../types/autota';

interface AgentLogsViewerProps {
  submissions: Submission[];
  selectedSubmission: Submission | null;
  onSelectSubmission: (submission: Submission) => void;
}

export const AgentLogsViewer: React.FC<AgentLogsViewerProps> = ({
  submissions,
  selectedSubmission,
  onSelectSubmission,
}) => {
  const currentSub = selectedSubmission || submissions[0];
  const [activeLogTab, setActiveLogTab] = useState<'agents' | 'compiler' | 'valgrind' | 'static' | 'prompts'>('agents');
  const [copied, setCopied] = useState(false);

  const handleCopyLogs = () => {
    if (!currentSub) return;
    const logText = JSON.stringify(
      {
        submissionId: currentSub.id,
        student: currentSub.studentName,
        assignment: currentSub.assignmentTitle,
        agentLogs: currentSub.agentLogs,
        compilerOutput: currentSub.compilerOutput,
        valgrindOutput: currentSub.valgrindOutput,
        staticAnalysis: currentSub.staticAnalysis,
      },
      null,
      2
    );
    navigator.clipboard.writeText(logText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentSub) {
    return (
      <div className="p-12 text-center text-slate-500">
        אין הגשות זמינות לתצוגת לוגים.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Submission Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                מרכז לוגים ובקרה של סוכני AI (Agent Reasoning & Tool Logs)
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                מאחורי הקלעים
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              פירוט תהליך קבלת ההחלטות, פלטי Clang-Tidy, הדמיית Valgrind, ומסנן הפדגוגיה
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Submission Selector */}
          <div className="relative">
            <select
              value={currentSub.id}
              onChange={(e) => {
                const sub = submissions.find((s) => s.id === e.target.value);
                if (sub) onSelectSubmission(sub);
              }}
              className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 pl-9 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {submissions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.studentName} ({s.assignmentTitle.substring(0, 24)}... - {s.grade} נק')
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'הועתק ללוח' : 'העתק לוגים מלאים (JSON)'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveLogTab('agents')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeLogTab === 'agents'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>תהליך קבלת החלטות הסוכנים (Multi-Agent Chain)</span>
        </button>

        <button
          onClick={() => setActiveLogTab('valgrind')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeLogTab === 'valgrind'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>פלט Valgrind וזיכרון</span>
        </button>

        <button
          onClick={() => setActiveLogTab('compiler')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeLogTab === 'compiler'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>שגיאות ופלט קימפול ({currentSub.language === 'c' ? 'GCC' : 'Javac'})</span>
        </button>

        <button
          onClick={() => setActiveLogTab('static')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeLogTab === 'static'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ניתוח סטטי (Clang-Tidy / SpotBugs)</span>
        </button>

        <button
          onClick={() => setActiveLogTab('prompts')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeLogTab === 'prompts'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>חוקי סינון פדגוגיים (Safety Filter)</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {activeLogTab === 'agents' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>הגשה מאת: <strong className="text-slate-900 dark:text-slate-100">{currentSub.studentName}</strong> (ת.ז {currentSub.studentId})</span>
              <span>קובץ: <span className="font-mono text-cyan-600 dark:text-cyan-400">{currentSub.fileName}</span></span>
              <span>ציון סופי: <strong className="font-mono text-slate-900 dark:text-slate-100">{currentSub.grade}/100</strong></span>
            </div>

            <div className="space-y-4">
              {currentSub.agentLogs.map((log, idx) => {
                const isStatic = log.agentName === 'StaticAnalyzerAgent';
                const isDocker = log.agentName === 'DockerSandboxAgent';
                const isMentor = log.agentName === 'SocraticMentorAgent';

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isStatic
                              ? 'bg-blue-500/10 text-blue-500'
                              : isDocker
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-emerald-500/10 text-emerald-500'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm font-mono">
                              {log.agentName}
                            </h4>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                              {log.action}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>חותמת זמן: {log.timestamp}</span>
                          </span>
                        </div>
                      </div>

                      <div className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        Verdict: {log.verdict}
                      </div>
                    </div>

                    {/* Reasoning Trace */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-xs sm:text-sm space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Agent Chain-of-Thought & Reasoning:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                        {log.reasoning}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeLogTab === 'valgrind' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden text-left font-mono text-xs" dir="ltr">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-500" />
                <span>valgrind --tool=memcheck --leak-check=full --track-origins=yes ./solution</span>
              </span>
              <span className={currentSub.valgrindOutput.leaksDetected ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                {currentSub.valgrindOutput.leaksDetected ? 'LEAK DETECTED' : 'CLEAN'}
              </span>
            </div>
            <div className="p-5 text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
              {currentSub.valgrindOutput.rawOutput}
            </div>
          </div>
        )}

        {activeLogTab === 'compiler' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden text-left font-mono text-xs" dir="ltr">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-500" />
                <span>{currentSub.compilerOutput.command}</span>
              </span>
              <span className="text-emerald-400 font-mono">
                Exit Code: {currentSub.compilerOutput.exitCode}
              </span>
            </div>
            <div className="p-5 text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
              {currentSub.compilerOutput.stdout || currentSub.compilerOutput.stderr || 'Compilation succeeded with 0 warnings/errors.'}
            </div>
          </div>
        )}

        {activeLogTab === 'static' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden text-left font-mono text-xs" dir="ltr">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>AST Semantic Linting ({currentSub.language === 'c' ? 'clang-tidy' : 'spotbugs'})</span>
              </span>
              <span className="text-slate-400 font-mono">
                Warnings: {currentSub.staticAnalysis.warningsCount}
              </span>
            </div>
            <div className="p-5 text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
              {currentSub.staticAnalysis.rawOutput}
            </div>
          </div>
        )}

        {activeLogTab === 'prompts' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>חוקי הגנת פדגוגיה ומניעת פתרונות ישירים (Pedagogical Obfuscation Safeguards)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              הסוכן הפדגוגי מונחה תחת כללים נוקשים המונעים ממנו לספק קוד פתרון מוכן לסטודנט. במקום זאת, הוא ממיר כשלים טכניים בשורות ספציפיות לשאלות חקר סוקרטיות.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <h5 className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  RULE 1: Anti-Solution Leak Protection
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Never emit corrected replacement code, patch blocks, or rewritten function bodies.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <h5 className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  RULE 2: Socratic Formulation
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Transform compiler errors into conceptual mental model questions (e.g., tracing pointer lifecycle before free).
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <h5 className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  RULE 3: Academic Integrity Audit
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  All agent interaction turns are logged with full timestamps, prompts, and verdicts for TA auditability.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
