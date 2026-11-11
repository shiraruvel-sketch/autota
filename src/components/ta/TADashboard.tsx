import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  ExternalLink, 
  Cpu, 
  Eye, 
  Layers,
  ArrowUpDown,
  Edit3,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Submission } from '../../types/autota';
import { INITIAL_ANALYTICS } from '../../data/mockData';
import { PedagogicalFeedbackModal } from '../student/PedagogicalFeedbackModal';
import { exportToExcelCSV } from '../../utils/exportUtils';

interface TADashboardProps {
  submissions: Submission[];
  onOpenAgentLogs: (submission: Submission) => void;
  onUpdateGrade: (submissionId: string, newGrade: number) => void;
}

export const TADashboard: React.FC<TADashboardProps> = ({
  submissions,
  onOpenAgentLogs,
  onUpdateGrade,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignment, setFilterAssignment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  const [selectedFeedbackSub, setSelectedFeedbackSub] = useState<Submission | null>(null);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState<number>(85);

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.studentId.includes(searchQuery) ||
      sub.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAssign = filterAssignment === 'all' || sub.assignmentId === filterAssignment;
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesLang = filterLanguage === 'all' || sub.language === filterLanguage;

    return matchesSearch && matchesAssign && matchesStatus && matchesLang;
  });

  // Calculate live analytics
  const totalSubmissions = submissions.length;
  const avgGrade =
    submissions.length > 0
      ? (submissions.reduce((acc, s) => acc + s.grade, 0) / submissions.length).toFixed(1)
      : '0';
  const memoryLeaksCount = submissions.filter((s) => s.valgrindOutput.leaksDetected).length;
  const leakPercentage =
    totalSubmissions > 0 ? Math.round((memoryLeaksCount / totalSubmissions) * 100) : 0;
  const passedCount = submissions.filter((s) => s.grade >= 60).length;
  const passRate =
    totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;

  const handleSaveGrade = (subId: string) => {
    onUpdateGrade(subId, tempGrade);
    setEditingGradeId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              לוח בקרה למתרגל (TA Command Center)
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              קורסי C & Java תשפ"ז
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            מעקב ביצועים, אבחון שגיאות זיכרון נפוצות, וניהול Pipeline בדיקה מבוסס סוכנים
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToExcelCSV(submissions)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            title="הורד קובץ Excel CSV תואם עברית עם כל ציוני הסטודנטים"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>ייצוא גיליון ציונים (Excel / CSV)</span>
          </button>

          <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
            סנכרון סוכנים: <span className="font-mono text-emerald-500 font-semibold">אקטיבי</span>
          </span>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Submissions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              סך כל ההגשות
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {totalSubmissions}
            </span>
            <span className="text-xs text-emerald-500 font-medium">+12 היום</span>
          </div>
          <p className="text-[11px] text-slate-400">נבדקו באמצעות 3 סוכנים</p>
        </div>

        {/* KPI 2: Average Grade */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              ציון ממוצע קורסי
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {avgGrade}
            </span>
            <span className="text-xs text-slate-400">מתוך 100</span>
          </div>
          <p className="text-[11px] text-slate-400">אחוז מעבר: {passRate}%</p>
        </div>

        {/* KPI 3: Memory Leaks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              זליגות זיכרון (Valgrind)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-500 font-mono">
              {leakPercentage}%
            </span>
            <span className="text-xs text-slate-400 font-mono">({memoryLeaksCount} הגשות)</span>
          </div>
          <p className="text-[11px] text-slate-400">בדיקת malloc ללא free תואם</p>
        </div>

        {/* KPI 4: Socratic Hints Generated */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              רמזים סוקרטיים שחוללו
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
              {totalSubmissions * 3}
            </span>
            <span className="text-xs text-emerald-500 font-medium">0 דליפות פתרון</span>
          </div>
          <p className="text-[11px] text-slate-400">מסנן פדגוגי מנע פתרונות ישירים</p>
        </div>
      </div>

      {/* Analytics Charts Grid: Common Errors & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Common Errors & Pitfalls Clustering */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                התפלגות שגיאות נפוצות במטלות (Failure Mode Clustering)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ניתוח אוטומטי מבוסס פלטי Clang-Tidy, Valgrind ו-SpotBugs
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">67 דגימות</span>
          </div>

          <div className="space-y-3 pt-2">
            {INITIAL_ANALYTICS.commonErrors.map((err, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {err.type}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-slate-500 dark:text-slate-400">
                    <span>{err.count} סטודנטים</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{err.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${err.percentage}%`,
                      backgroundColor: err.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              התפלגות ציונים (Grade Distribution)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              גרף ציוני המטלה הנוכחית
            </p>
          </div>

          <div className="h-52 flex items-end justify-between gap-3 pt-4 px-2">
            {INITIAL_ANALYTICS.gradeDistribution.map((item, idx) => {
              const maxCount = 25;
              const heightPct = Math.round((item.count / maxCount) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {item.count}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-cyan-600 to-indigo-600 transition-all duration-500 hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center whitespace-nowrap">
                    {item.range.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submissions Pipeline Management Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              טבלת ניהול הגשות סטודנטים ב-Pipeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              סינון, צפייה בלוגים של הסוכנים, והתערבות ידנית במקרה הצורך
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <input
                type="text"
                placeholder="חפש סטודנט או ת.ז..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-slate-100"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">כל השפות</option>
              <option value="c">C (GCC & Valgrind)</option>
              <option value="java">Java (OpenJDK & JUnit)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="graded">ניתן ציון</option>
              <option value="evaluating">בבדיקה</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold">שם הסטודנט</th>
                <th className="py-3.5 px-4 font-semibold">ת.ז</th>
                <th className="py-3.5 px-4 font-semibold">מטלה וקובץ</th>
                <th className="py-3.5 px-4 font-semibold">שפה</th>
                <th className="py-3.5 px-4 font-semibold">טסטים</th>
                <th className="py-3.5 px-4 font-semibold">ציון סופי</th>
                <th className="py-3.5 px-4 font-semibold">זליגת Valgrind</th>
                <th className="py-3.5 px-4 font-semibold text-left">פעולות מתרגל</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSubmissions.map((sub) => {
                const isEditingThis = editingGradeId === sub.id;

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {sub.studentName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {sub.studentId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                        {sub.assignmentTitle}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {sub.fileName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {sub.language.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <span className={sub.testPassed === sub.testTotal ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                        {sub.testPassed}/{sub.testTotal}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isEditingThis ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={tempGrade}
                            onChange={(e) => setTempGrade(parseInt(e.target.value, 10) || 0)}
                            className="w-16 px-2 py-1 text-xs font-mono bg-white dark:bg-slate-800 border border-cyan-500 rounded focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveGrade(sub.id)}
                            className="text-[11px] px-2 py-1 bg-cyan-600 text-white rounded font-medium"
                          >
                            שמור
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                            {sub.grade}
                          </span>
                          <button
                            onClick={() => {
                              setEditingGradeId(sub.id);
                              setTempGrade(sub.grade);
                            }}
                            title="עדכן ציון ידנית"
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.valgrindOutput.leaksDetected ? (
                        <span className="font-mono text-xs text-amber-500 flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{sub.valgrindOutput.bytesLeaked} Bytes</span>
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>0 Leaks</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenAgentLogs(sub)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-colors"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Agent Logs</span>
                        </button>

                        <button
                          onClick={() => setSelectedFeedbackSub(sub)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>משוב</span>
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

      {/* Pedagogical Feedback Viewer Modal if clicked */}
      <PedagogicalFeedbackModal
        submission={selectedFeedbackSub}
        onClose={() => setSelectedFeedbackSub(null)}
      />
    </div>
  );
};
