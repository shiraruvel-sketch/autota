import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  HelpCircle, 
  Code2, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Lightbulb,
  FileCode,
  Layers,
  ChevronRight,
  Printer
} from 'lucide-react';
import { Submission } from '../../types/autota';
import { sendSocraticChatMessage } from '../../services/api';
import { printOrSavePDF } from '../../utils/exportUtils';

interface PedagogicalFeedbackModalProps {
  submission: Submission | null;
  initialTab?: 'socratic' | 'code' | 'valgrind' | 'chat';
  onClose: () => void;
}

export const PedagogicalFeedbackModal: React.FC<PedagogicalFeedbackModalProps> = ({
  submission,
  initialTab = 'socratic',
  onClose,
}) => {
  if (!submission) return null;

  const [activeTab, setActiveTab] = useState<'socratic' | 'code' | 'valgrind' | 'chat'>(initialTab);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string }>>([
    {
      sender: 'agent',
      text: `שלום ${submission.studentName}! עברתי על קוד ה-${submission.language.toUpperCase()} שלך עבור "${submission.assignmentTitle}". שים לב לשאלות המנחות בדו"ח. במה תרצה שנתמקד כדי לעזור לך להבין את הפתרון בעצמך?`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsSending(true);

    try {
      const hint = submission.pedagogicalFeedback.logicalFlaws[0]?.socraticQuestion || 'שים לב לניהול הזיכרון';
      const reply = await sendSocraticChatMessage({
        question: userText,
        code: submission.code,
        currentHint: hint,
        language: submission.language,
      });

      setChatMessages((prev) => [...prev, { sender: 'agent', text: reply }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'agent', text: 'אירעה שגיאה זמנית בתקשורת עם הסוכן הפדגוגי. נסה לשאול שוב.' },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const codeLines = submission.code.split('\n');

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-right">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  משוב פדגוגי מותאם אישית (AI Pedagogical Report)
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                  {submission.language.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {submission.assignmentTitle} · {submission.fileName} · הוגש ב-{submission.submittedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => printOrSavePDF(submission)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
              title="הדפס או שמור דוח אקדמי רשמי ב-PDF"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-500" />
              <span className="hidden sm:inline">הדפס / שמור כ-PDF</span>
            </button>

            <div className="text-left font-mono">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {submission.grade}
              </span>
              <span className="text-xs text-slate-400"> / 100</span>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {submission.testPassed}/{submission.testTotal} טסטים עברו
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none shrink-0 py-0.5">
            <button
              onClick={() => setActiveTab('socratic')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'socratic'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>הסברים לוגיים ושאלות מנחות</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'code'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>הערות בגוף הקוד (Annotated Code)</span>
            </button>

            <button
              onClick={() => setActiveTab('valgrind')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'valgrind'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>דוח Valgrind וקימפול</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 transition-colors relative ${
                activeTab === 'chat'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/40 dark:bg-indigo-950/20'
                  : 'border-transparent text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span>צ'אט סוקרטי עם ה-AI Mentor</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 mr-1">
                שאל שאלות
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded border border-amber-200 dark:border-amber-800/80">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>הסוכן הפדגוגי לא חושף את קוד הפתרון — מטרתו להנחות אותך להבין!</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'socratic' && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-base mb-2">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  <span>סיכום הערכת המנטור</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {submission.pedagogicalFeedback.summary}
                </p>
              </div>

              {/* Logical Flaws with Socratic Questions */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>נקודות לוגיות לתשומת לב (Logical Flaws & Socratic Guidance)</span>
                </h4>

                {submission.pedagogicalFeedback.logicalFlaws.length === 0 ? (
                  <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>לא אותרו שגיאות לוגיות או זליגות זיכרון! הקוד עבר את כל הבדיקות.</span>
                  </div>
                ) : (
                  submission.pedagogicalFeedback.logicalFlaws.map((flaw, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm hover:border-cyan-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                            {flaw.title}
                          </h5>
                        </div>
                        {flaw.line && (
                          <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">
                            שורה {flaw.line}
                          </span>
                        )}
                      </div>

                      {/* Socratic Question */}
                      <div className="p-3.5 rounded-lg bg-cyan-50/40 dark:bg-cyan-950/30 border border-cyan-200/60 dark:border-cyan-800/60 space-y-1">
                        <div className="text-xs font-semibold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
                          <span>שאלה מכוונת מהמנטור:</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
                          "{flaw.socraticQuestion}"
                        </p>
                      </div>

                      {/* Conceptual Hint */}
                      <div className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">רמז מושגי:</span>
                        <span>{flaw.conceptualHint}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Code Style Notes & Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                    <span>סגנון וקריאות קוד</span>
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                    {submission.pedagogicalFeedback.codeStyleNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span>הצעדים הבאים לשיפור המטלה</span>
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                    {submission.pedagogicalFeedback.nextSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono" dir="ltr">
                <span>{submission.fileName}</span>
                <span>Total lines: {codeLines.length}</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs text-left" dir="ltr">
                <div className="p-4 overflow-x-auto space-y-0.5">
                  {codeLines.map((line, idx) => {
                    const lineNum = idx + 1;
                    const matchedFlaw = submission.pedagogicalFeedback.logicalFlaws.find(
                      (f) => f.line === lineNum
                    );

                    return (
                      <div key={idx} className="group">
                        <div
                          className={`flex items-start gap-4 px-2 py-0.5 rounded transition-colors ${
                            matchedFlaw
                              ? 'bg-amber-950/40 border-r-2 border-amber-500'
                              : 'hover:bg-slate-900'
                          }`}
                        >
                          <span className="w-8 shrink-0 text-right select-none text-slate-600 group-hover:text-slate-400">
                            {lineNum}
                          </span>
                          <span className={`flex-1 whitespace-pre ${matchedFlaw ? 'text-amber-200 font-semibold' : 'text-slate-300'}`}>
                            {line || ' '}
                          </span>
                        </div>

                        {matchedFlaw && (
                          <div className="my-1.5 mr-12 p-3 bg-amber-950/80 border border-amber-600/60 rounded-lg text-right font-sans text-xs text-amber-200" dir="rtl">
                            <div className="font-bold flex items-center gap-1.5 text-amber-300">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                              <span>{matchedFlaw.title} (שורה {matchedFlaw.line})</span>
                            </div>
                            <p className="mt-1 text-slate-300">
                              {matchedFlaw.socraticQuestion}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'valgrind' && (
            <div className="space-y-4 text-left font-mono text-xs" dir="ltr">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-slate-400 font-semibold pb-1 border-b border-slate-800 flex items-center justify-between">
                  <span>Compiler Execution ({submission.compilerOutput.command})</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded ${submission.compilerOutput.exitCode === 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                    Exit Code: {submission.compilerOutput.exitCode}
                  </span>
                </div>
                <pre className="text-slate-300 whitespace-pre-wrap">
                  {submission.compilerOutput.stdout || submission.compilerOutput.stderr || 'No compiler warnings. Compiled with 0 errors.'}
                </pre>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-slate-400 font-semibold pb-1 border-b border-slate-800 flex items-center justify-between">
                  <span>Valgrind Memory Audit (Valgrind-3.18.1)</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded ${submission.valgrindOutput.leaksDetected ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'}`}>
                    {submission.valgrindOutput.leaksDetected ? `Leaks: ${submission.valgrindOutput.bytesLeaked} Bytes` : '0 Leaks Detected'}
                  </span>
                </div>
                <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {submission.valgrindOutput.rawOutput}
                </pre>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-slate-400 font-semibold pb-1 border-b border-slate-800">
                  <span>Clang-Tidy / SpotBugs Static Analysis Trace</span>
                </div>
                <pre className="text-slate-300 whitespace-pre-wrap">
                  {submission.staticAnalysis.rawOutput}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-[520px] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-cyan-600 text-white rounded-br-none shadow-sm'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <div className="text-[10px] font-mono mb-1 opacity-75">
                        {msg.sender === 'user' ? 'אתה (הסטודנט)' : 'AutoTA Socratic AI Mentor'}
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex justify-end">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl rounded-bl-none text-xs text-slate-500 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                      <span>המנטור חושב על שאלה מנחה...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="שאל את המנטור שאלה (למשל: 'למה אסור לגשת ל-curr->next אחרי free?')"
                  className="flex-1 px-4 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isSending}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>שלח</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>AutoTA Socratic Guidance Engine · המטלה ניתנת לתיקון והגשה חוזרת</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            סגור דוח
          </button>
        </div>
      </div>
    </div>
  );
};
