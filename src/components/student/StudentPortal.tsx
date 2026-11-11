import React, { useState } from 'react';
import { 
  Upload, 
  FileCode, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ArrowUpRight, 
  Play, 
  FileText, 
  Code, 
  RefreshCw,
  FolderArchive,
  ChevronDown,
  Info,
  X,
  MessageSquare,
  Printer,
  Terminal,
  Layers,
  Award,
  Trophy,
  ShieldCheck,
  Flame,
  LayoutGrid
} from 'lucide-react';
import { Assignment, Submission } from '../../types/autota';
import { INITIAL_ASSIGNMENTS } from '../../data/mockData';
import { submitAndEvaluate, generateLocalEvaluation } from '../../services/api';
import { PipelineProgressModal } from './PipelineProgressModal';
import { PedagogicalFeedbackModal } from './PedagogicalFeedbackModal';
import { LiveInteractiveRunner } from '../runner/LiveInteractiveRunner';
import { JavaFXSimulator } from '../simulator/JavaFXSimulator';
import { printOrSavePDF } from '../../utils/exportUtils';

interface StudentPortalProps {
  submissions: Submission[];
  onNewSubmission: (submission: Submission) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  submissions,
  onNewSubmission,
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment>(INITIAL_ASSIGNMENTS[0]);
  const [codeContent, setCodeContent] = useState<string>(
    selectedAssignment.sampleFiles[0]?.code || ''
  );
  const [fileName, setFileName] = useState<string>(
    selectedAssignment.sampleFiles[0]?.name || 'solution.c'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [studentName, setStudentName] = useState('יונתן כהן');
  const [studentId, setStudentId] = useState('318942105');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pipeline modal state
  const [isPipelineOpen, setIsPipelineOpen] = useState(false);
  const [completedSubmission, setCompletedSubmission] = useState<Submission | null>(null);

  // Detail feedback modal state
  const [selectedFeedbackSubmission, setSelectedFeedbackSubmission] = useState<Submission | null>(null);
  const [feedbackInitialTab, setFeedbackInitialTab] = useState<'socratic' | 'code' | 'valgrind' | 'chat'>('socratic');

  const handleOpenFeedback = (sub: Submission, tab: 'socratic' | 'code' | 'valgrind' | 'chat' = 'socratic') => {
    setFeedbackInitialTab(tab);
    setSelectedFeedbackSubmission(sub);
  };

  // Multi-file state for 3-class JavaFX / multi-file assignments
  const [multiFilesMap, setMultiFilesMap] = useState<Record<string, string>>({});
  const [activeFileTab, setActiveFileTab] = useState<string>('MainApplication.java');

  const handleAssignmentChange = (assignId: string) => {
    const found = INITIAL_ASSIGNMENTS.find((a) => a.id === assignId);
    if (found) {
      setSelectedAssignment(found);
      if (found.files && found.files.length > 0) {
        const fileMap: Record<string, string> = {};
        found.files.forEach((f) => {
          fileMap[f.name] = f.code;
        });
        setMultiFilesMap(fileMap);
        setActiveFileTab(found.files[0].name);
        setFileName(found.files[0].name);
        setCodeContent(found.files[0].code);
      } else {
        setCodeContent(found.sampleFiles[0]?.code || '');
        setFileName(found.sampleFiles[0]?.name || (found.language === 'c' ? 'solution.c' : 'Solution.java'));
      }
      setErrorMessage(null);
    }
  };

  const handleSelectFileTab = (fName: string) => {
    // Save current content first
    setMultiFilesMap((prev) => ({ ...prev, [fileName]: codeContent }));
    setActiveFileTab(fName);
    setFileName(fName);
    setCodeContent(multiFilesMap[fName] || '');
  };

  const handleLoadSample = (sample: typeof selectedAssignment.sampleFiles[0]) => {
    setCodeContent(sample.code);
    setFileName(sample.name);
    setErrorMessage(null);
  };

  const handleFileUpload = (file: File) => {
    const validExtensions = ['.c', '.java', '.zip', '.cpp', '.h'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setErrorMessage('נא להעלות קובץ מסוג .c, .java או .zip בלבד');
      return;
    }

    setErrorMessage(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCodeContent(text || `// תוכן קובץ בינארי: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRunEvaluation = async () => {
    if (!codeContent.trim()) {
      setErrorMessage('אנא העלה קובץ או הדבק קוד לבדיקה בעורך למטה');
      return;
    }
    setErrorMessage(null);

    // Pre-create instant fallback so completedSubmission is NEVER empty
    const instantFallback = generateLocalEvaluation({
      studentName,
      studentId,
      assignmentId: selectedAssignment.id,
      assignmentTitle: selectedAssignment.title,
      language: selectedAssignment.language,
      fileName,
      code: codeContent,
    });

    setCompletedSubmission(instantFallback);
    setIsPipelineOpen(true);

    try {
      const result = await submitAndEvaluate({
        studentName,
        studentId,
        assignmentId: selectedAssignment.id,
        assignmentTitle: selectedAssignment.title,
        language: selectedAssignment.language,
        fileName,
        code: codeContent,
      });

      const finalSubmission = result || instantFallback;
      setCompletedSubmission(finalSubmission);
      onNewSubmission(finalSubmission);
    } catch (err: any) {
      console.warn('Using local evaluation result:', err);
      onNewSubmission(instantFallback);
    }
  };

  const handlePipelineFinished = (submission: Submission) => {
    setIsPipelineOpen(false);
    setSelectedFeedbackSubmission(submission);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Error Message Toast */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center justify-between text-xs sm:text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner / Student Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-lg font-mono">
            {studentName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{studentName}</h2>
              <span className="text-xs font-mono text-slate-400">ת.ז. {studentId}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              פקולטה למדעי המחשב · סמסטר א' תשפ"ז · 3 מטלות פעילות
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <label className="text-[11px] text-slate-400 block mb-1">בחר מטלה פעילה:</label>
            <div className="relative">
              <select
                value={selectedAssignment.id}
                onChange={(e) => handleAssignmentChange(e.target.value)}
                className="appearance-none bg-slate-800 border border-slate-700 text-xs sm:text-sm rounded-xl px-3.5 py-2 pl-9 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium cursor-pointer"
              >
                {INITIAL_ASSIGNMENTS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.language.toUpperCase()})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Overview & Key Topics */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {selectedAssignment.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedAssignment.course} · מועד אחרון: {selectedAssignment.dueDate}
            </p>
          </div>

          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-fit">
            שפה: {selectedAssignment.language.toUpperCase()}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {selectedAssignment.description}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400">נושאים נבדקים:</span>
          {selectedAssignment.keyTopics.map((topic, idx) => (
            <span
              key={idx}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Upload Zone & Interactive Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drag & Drop Zone */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] ${
              isDragging
                ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30'
                : 'border-slate-300 dark:border-slate-700 hover:border-cyan-500/60 bg-white dark:bg-slate-900'
            }`}
            onClick={() => document.getElementById('code-file-input')?.click()}
          >
            <input
              id="code-file-input"
              type="file"
              accept=".c,.java,.zip,.cpp,.h"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />

            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              גרור ושחרר קבצי קוד לכאן
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              תומך בקבצי <span className="font-mono text-cyan-600 dark:text-cyan-400">.c</span>,{' '}
              <span className="font-mono text-cyan-600 dark:text-cyan-400">.java</span>, או{' '}
              <span className="font-mono text-cyan-600 dark:text-cyan-400">.zip</span> (עד 15MB)
            </p>
            <button
              type="button"
              className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              בחר קובץ מהמחשב
            </button>
          </div>

          {/* Quick Sample Code Presets */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-500" />
                <span>טען קוד דוגמה לבדיקה מהירה:</span>
              </span>
            </div>

            <div className="space-y-1.5">
              {selectedAssignment.sampleFiles.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadSample(sample)}
                  className="w-full text-right p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                    <span className="font-mono">{sample.name}</span>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400">טען לקוד</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {sample.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Trigger */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-300">
              <Code className="w-3.5 h-3.5 text-cyan-500" />
              <span>{fileName}</span>
            </span>
            <span>עורך קוד חי (ניתן לעריכה ישירה)</span>
          </div>

          {/* Multi-Class Tabs Bar (e.g. MainApplication.java, MatrixController.java, MatrixModel.java) */}
          {selectedAssignment.files && selectedAssignment.files.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>מחלקות הפרויקט:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {selectedAssignment.files.map((file) => (
                  <button
                    key={file.name}
                    type="button"
                    onClick={() => handleSelectFileTab(file.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      fileName === file.name
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>{file.name}</span>
                    {file.isMain && (
                      <span className="text-[9px] bg-white/20 text-white px-1 py-0.2 rounded font-sans">
                        Main
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative flex-1 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner font-mono text-xs text-left" dir="ltr">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-[11px] text-slate-400 bg-slate-900/50">
              <span className="text-cyan-400">{fileName}</span>
              <span>{codeContent.split('\n').length} lines · UTF-8</span>
            </div>
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              placeholder="// כתוב או הדבק כאן את קוד ה-C או Java..."
              className="w-full h-80 p-4 bg-transparent text-slate-200 resize-none focus:outline-none font-mono text-xs leading-relaxed selection:bg-cyan-500/30"
              spellCheck={false}
            />
          </div>

          {/* Primary Submit Button */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Info className="w-3.5 h-3.5 text-cyan-500" />
              <span>הבדיקה מפעילה צי של 6 סוכני AI מקבילים (Architecture, CanvasGrid, Random, Thread, EdgeCase, Mentor)</span>
            </div>

            <button
              onClick={handleRunEvaluation}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>שגר לבדיקת 6 סוכני AI (Run 6-Agent Swarm)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual JavaFX Interactive Simulator Component (When Assignment has Visual GUI) */}
      {(selectedAssignment.hasVisualSimulation || selectedAssignment.id === 'assign-javafx') && (
        <JavaFXSimulator
          initialWidth={380}
          initialHeight={260}
          buggyMode={
            codeContent.includes('10 / 100') || codeContent.includes('10/100')
              ? 'int-division'
              : !codeContent.includes('clearRect')
              ? 'no-clear'
              : 'none'
          }
        />
      )}

      {/* Live In-Browser Interactive Execution Environment (stdout/stdin) */}
      <LiveInteractiveRunner
        language={selectedAssignment.language}
        fileName={fileName}
        code={codeContent}
      />

      {/* Submissions History Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              היסטוריית הגשות (Submissions History)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              מעקב אחרי כלל הריצות, ציונים, ודוחות המשוב הפדגוגיים
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400">
            {submissions.length} הגשות במערכת
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold">שם המטלה</th>
                <th className="py-3.5 px-4 font-semibold">קובץ ושפה</th>
                <th className="py-3.5 px-4 font-semibold">תאריך הגשה</th>
                <th className="py-3.5 px-4 font-semibold">טסטים שעברו</th>
                <th className="py-3.5 px-4 font-semibold">ציון</th>
                <th className="py-3.5 px-4 font-semibold">סטטוס</th>
                <th className="py-3.5 px-4 font-semibold text-left">פעולה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {submissions.map((sub) => {
                const isGrade100 = sub.grade === 100;
                const isPass = sub.grade >= 60;

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {sub.assignmentTitle}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {sub.fileName} ({sub.language.toUpperCase()})
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {sub.submittedAt}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <span className={sub.testPassed === sub.testTotal ? 'text-emerald-500 font-semibold' : 'text-amber-500 font-semibold'}>
                        {sub.testPassed}/{sub.testTotal}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span
                        className={`text-sm ${
                          isGrade100
                            ? 'text-emerald-500'
                            : isPass
                            ? 'text-cyan-500'
                            : 'text-red-500'
                        }`}
                      >
                        {sub.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.status === 'graded' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ניתן ציון</span>
                        </span>
                      ) : sub.status === 'evaluating' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>בבדיקה</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>ממתין</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                        <button
                          onClick={() => printOrSavePDF(sub)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="הורד או הדפס דוח PDF אקדמי רשמי"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span className="hidden sm:inline">PDF</span>
                        </button>

                        <button
                          onClick={() => handleOpenFeedback(sub, 'chat')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                          title="פתח צ'אט ישירות עם ה-AI Mentor"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                          <span>שאל את המנטור</span>
                        </button>

                        <button
                          onClick={() => handleOpenFeedback(sub, 'socratic')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900 border border-cyan-200 dark:border-cyan-800 transition-colors cursor-pointer"
                        >
                          <span>צפה במשוב</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Academic Achievements & Gamification Badges */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                מרכז הישגים ותגים אקדמיים (Academic Mastery Badges)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                הכרה במיומנויות הנדסיות, קוד נקי ועמידה במקרי קיצון
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>רצף למידה פעיל: 4 ימים רצופים!</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>שריון Valgrind</span>
                <span className="text-[10px] text-emerald-600 font-mono">0 Leaks</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                שחרור מלא של כל בלוקי ה-malloc ללא שגיאות זיכרון
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/20 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>מאסטר JavaFX & MVC</span>
                <span className="text-[10px] text-indigo-400 font-mono">3 Classes</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                הפרדה מושלמת בין Model, Controller ו-Application עם קנבס 10px
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-50/20 dark:bg-cyan-950/20 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>צייד מקרי קצה</span>
                <span className="text-[10px] text-cyan-600 font-mono">8/8 Passed</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                עמידות מלאה לשינויי גודל, חלוקה באפס ולחיצות רציפות
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-50/20 dark:bg-purple-950/20 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>חסין NullPointer</span>
                <span className="text-[10px] text-purple-400 font-mono">Zero Crash</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                בדיקת כל תנאי העצירה והמצביעים ברקורסיה ובעצים
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick AI Mentor Socratic Consultation Banner */}
      {submissions.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-800/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                זקוק להכוונה? ה-AI Socratic Mentor זמין לשאלות שלך
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                שאל שאלות על שגיאות הזיכרון, תנאי הקצה או מבנה הקוד – המנטור יענה בהסברים לוגיים מבלי לחשוף את הפתרון המוכן.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenFeedback(submissions[0], 'chat')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/20 cursor-pointer whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4" />
            <span>פתח צ'אט עם ה-AI Mentor</span>
          </button>
        </div>
      )}

      {/* Floating Sticky AI Mentor Quick-Launch Button (Bottom-Left) */}
      {submissions.length > 0 && (
        <button
          onClick={() => handleOpenFeedback(submissions[0], 'chat')}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="פתח צ'אט סוקרטי עם המנטור"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span>שאל את ה-AI Mentor</span>
        </button>
      )}

      {/* 3-Step Pipeline Loading Modal (High z-index: 100) */}
      <PipelineProgressModal
        isOpen={isPipelineOpen}
        language={selectedAssignment.language}
        fileName={fileName}
        completedSubmission={completedSubmission}
        onComplete={handlePipelineFinished}
      />

      {/* Detailed Socratic Feedback Modal (High z-index: 110) */}
      <PedagogicalFeedbackModal
        submission={selectedFeedbackSubmission}
        initialTab={feedbackInitialTab}
        onClose={() => setSelectedFeedbackSubmission(null)}
      />
    </div>
  );
};
