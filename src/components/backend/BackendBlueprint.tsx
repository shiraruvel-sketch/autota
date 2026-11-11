import React, { useState } from 'react';
import { 
  Database, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Share2, 
  Layers,
  Server,
  Code,
  Table,
  CheckCircle2
} from 'lucide-react';
import { FASTAPI_BACKEND_FILES, BackendFile } from '../../data/fastapiCode';

export const BackendBlueprint: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<BackendFile>(FASTAPI_BACKEND_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.filename.split('/').pop() || 'file.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 text-white shadow-sm space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                שלד צד שרת ב-Python FastAPI וסכמות PostgreSQL
              </h2>
              <p className="text-xs text-slate-300">
                ארכיטקטורת Backend מלאה מוכנה לפריסה עם SQLAlchemy 2.0 Async ו-Pydantic v2
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800 px-3 py-1 rounded-lg">
              FastAPI + PostgreSQL 16
            </span>
          </div>
        </div>
      </div>

      {/* Database Entity Relationship Diagram (ERD) Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Table className="w-4 h-4 text-cyan-500" />
              <span>סכמת מסד הנתונים היחסי (PostgreSQL Schema Architecture)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              מבנה הטבלאות עבור סטודנטים, מטלות, הגשות, ולוגים מלאים של הסוכנים
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">6 Tables Defined</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* Table 1: Students */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
              <span className="font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400">students</span>
              <span className="text-[10px] text-slate-400">PK: id</span>
            </div>
            <ul className="text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1">
              <li>id: SERIAL (PK)</li>
              <li>student_id: VARCHAR(20) [UNIQUE]</li>
              <li>full_name: VARCHAR(100)</li>
              <li>email: VARCHAR(120) [UNIQUE]</li>
              <li>created_at: TIMESTAMP</li>
            </ul>
          </div>

          {/* Table 2: Assignments */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
              <span className="font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400">assignments</span>
              <span className="text-[10px] text-slate-400">PK: id</span>
            </div>
            <ul className="text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1">
              <li>id: SERIAL (PK)</li>
              <li>title: VARCHAR(200)</li>
              <li>language: ENUM ('c', 'java')</li>
              <li>due_date: TIMESTAMP</li>
              <li>description: TEXT</li>
            </ul>
          </div>

          {/* Table 3: Submissions */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
              <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">submissions</span>
              <span className="text-[10px] text-slate-400">FK: student, assign</span>
            </div>
            <ul className="text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1">
              <li>id: SERIAL (PK)</li>
              <li>student_id: INT (FK -&gt; students)</li>
              <li>assignment_id: INT (FK -&gt; assignments)</li>
              <li>file_name: VARCHAR(255)</li>
              <li>source_code: TEXT</li>
              <li>status: ENUM ('pending', 'evaluating', 'graded')</li>
              <li>grade: FLOAT</li>
            </ul>
          </div>

          {/* Table 4: Agent Logs */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
              <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">agent_logs</span>
              <span className="text-[10px] text-slate-400">FK: submission</span>
            </div>
            <ul className="text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1">
              <li>id: SERIAL (PK)</li>
              <li>submission_id: INT (FK -&gt; submissions)</li>
              <li>agent_name: VARCHAR(50)</li>
              <li>action: VARCHAR(100)</li>
              <li>reasoning_trace: TEXT (Chain of Thought)</li>
              <li>verdict: VARCHAR(200)</li>
              <li>raw_tool_output: TEXT (Valgrind/GCC)</li>
            </ul>
          </div>

          {/* Table 5: Pedagogical Feedbacks */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
              <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">pedagogical_feedbacks</span>
              <span className="text-[10px] text-slate-400">1:1 Sub</span>
            </div>
            <ul className="text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1">
              <li>id: SERIAL (PK)</li>
              <li>submission_id: INT [UNIQUE]</li>
              <li>summary: TEXT</li>
              <li>logical_flaws: JSONB (Socratic questions)</li>
              <li>code_style_notes: JSONB</li>
              <li>next_steps: JSONB</li>
            </ul>
          </div>

          {/* Table 6: Test Cases */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
              <span className="font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400">test_cases</span>
              <span className="text-[10px] text-slate-400">FK: assignment</span>
            </div>
            <ul className="text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1">
              <li>id: SERIAL (PK)</li>
              <li>assignment_id: INT (FK)</li>
              <li>input_data: TEXT</li>
              <li>expected_output: TEXT</li>
              <li>is_hidden: BOOLEAN</li>
              <li>weight: FLOAT</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Code Inspector & File Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Navigator List */}
        <div className="lg:col-span-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            קבצי שרת ומסד נתונים (Project Files)
          </h4>
          <div className="space-y-1.5">
            {FASTAPI_BACKEND_FILES.map((file, idx) => {
              const isSelected = selectedFile.filename === file.filename;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-right p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <FileCode className={`w-4 h-4 ${isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {file.filename}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {file.description}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100" dir="ltr">
              {selectedFile.filename}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'הועתק' : 'העתק קוד'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900 border border-cyan-200 dark:border-cyan-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>הורד קובץ</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner text-left font-mono text-xs" dir="ltr">
            <div className="p-4 max-h-[560px] overflow-y-auto overflow-x-auto text-slate-300 leading-relaxed whitespace-pre selection:bg-cyan-500/30">
              {selectedFile.code}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
