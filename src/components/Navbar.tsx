import React from 'react';
import { 
  Terminal, 
  GraduationCap, 
  BarChart3, 
  Cpu, 
  Database, 
  Moon, 
  Sun,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock
} from 'lucide-react';

export type ActiveTab = 'student' | 'ta' | 'agent-logs' | 'plagiarism' | 'backend-blueprint';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
  isExamMode: boolean;
  toggleExamMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  toggleDarkMode,
  isExamMode,
  toggleExamMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('student')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
                AutoTA
              </span>
              <span className="hidden sm:inline-block mr-2 text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/60">
                v1.2 Advanced
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation links (Horizontal swipe on mobile) */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none max-w-full">
          <button
            onClick={() => setActiveTab('student')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'student'
                ? 'bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>פורטל סטודנט</span>
          </button>

          <button
            onClick={() => setActiveTab('ta')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'ta'
                ? 'bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>דאשבורד מתרגל</span>
          </button>

          <button
            onClick={() => setActiveTab('plagiarism')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'plagiarism'
                ? 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
            <span>זיהוי פלגיאט (MOSS)</span>
          </button>

          <button
            onClick={() => setActiveTab('agent-logs')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'agent-logs'
                ? 'bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span>לוגים של הסוכנים</span>
          </button>

          <button
            onClick={() => setActiveTab('backend-blueprint')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'backend-blueprint'
                ? 'bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4 shrink-0" />
            <span>FastAPI & PostgreSQL</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Exam Mode Toggle & Dark Mode) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Timed Exam Mode Toggle Button */}
          <button
            onClick={toggleExamMode}
            title={isExamMode ? 'בטל מצב בחינה' : 'הפעל מצב בחינה מוגבל בזמן'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isExamMode
                ? 'bg-red-600 text-white shadow-sm shadow-red-500/30 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {isExamMode ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isExamMode ? 'מבחן פעיל' : 'מצב מבחן'}</span>
          </button>

          <button
            onClick={toggleDarkMode}
            title={isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
