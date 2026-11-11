import React, { useState } from 'react';
import { 
  TrendingUp, 
  Cpu, 
  Layers, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  Info,
  Clock,
  HardDrive
} from 'lucide-react';

interface BigOVisualizerProps {
  assignmentId?: string;
}

export const BigOVisualizer: React.FC<BigOVisualizerProps> = ({
  assignmentId = 'assign-javafx',
}) => {
  const [inputSizeN, setInputSizeN] = useState<number>(30); // 30x30 matrix or array size
  const [selectedComplexity, setSelectedComplexity] = useState<'current' | 'all'>('current');

  // Math models
  const n = inputSizeN;
  const o1 = 1;
  const oLogN = Math.round(Math.log2(n));
  const oN = n;
  const oNLogN = Math.round(n * Math.log2(n));
  const oNSquared = n * n; // (W/10) * (H/10)

  // Maximum scale for graph rendering (based on oNSquared)
  const maxVal = Math.max(oNSquared, 900);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                מנתח סיבוכיות גרפי Big-O (Time & Space Complexity)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Algorithmic Profiler
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ניתוח ביצועים אסימפטוטי, מודל תאי זיכרון Stack/Heap והמלצות אופטימיזציה של סוכני ה-AI
            </p>
          </div>
        </div>

        {/* Dynamic Input Slider */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <Sliders className="w-4 h-4 text-purple-500" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">גודל קלט (N):</span>
          <input
            type="range"
            min="10"
            max="60"
            step="5"
            value={inputSizeN}
            onChange={(e) => setInputSizeN(Number(e.target.value))}
            className="w-24 accent-purple-600"
          />
          <span className="font-mono font-bold text-purple-600 dark:text-purple-400 w-8 text-center">
            {inputSizeN}
          </span>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Bar Chart Visualization */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-500" />
            <span>השוואת עקומות סיבוכיות עבור קלט N = {n}:</span>
          </h4>

          {/* Graphical Bars */}
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            {/* O(1) */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-600 dark:text-slate-400">
                <span className="text-emerald-500 font-bold">O(1) - Constant</span>
                <span>{o1} פעולות (למשל: בדיקת hashSet.contains)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '2%' }}></div>
              </div>
            </div>

            {/* O(log N) */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-600 dark:text-slate-400">
                <span className="text-cyan-500 font-bold">O(log N) - Logarithmic</span>
                <span>{oLogN} פעולות (חיפוש בינארי בעץ BST)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${Math.min((oLogN / maxVal) * 100 + 4, 15)}%` }}></div>
              </div>
            </div>

            {/* O(N) */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-600 dark:text-slate-400">
                <span className="text-blue-500 font-bold">O(N) - Linear</span>
                <span>{oN} פעולות (איטרציה על שורה אחת / רשימה מקושרת)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min((oN / maxVal) * 100 + 8, 30)}%` }}></div>
              </div>
            </div>

            {/* O(N log N) */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-600 dark:text-slate-400">
                <span className="text-indigo-500 font-bold">O(N log N) - Linearithmic</span>
                <span>{oNLogN} פעולות (מיון מהיר QuickSort)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min((oNLogN / maxVal) * 100 + 15, 55)}%` }}></div>
              </div>
            </div>

            {/* O(N^2) - Current Matrix Complexity */}
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex justify-between text-xs font-mono mb-1 text-purple-600 dark:text-purple-400 font-bold">
                <span>O(N²) - Quadratic (סיבוכיות המטריצה הנוכחית)</span>
                <span>{oNSquared} פעולות ריסוס פיקסלים במטריצה</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: '95%' }}></div>
              </div>
              <p className="text-[11px] text-purple-600/80 dark:text-purple-300/80 mt-1">
                עבור רשת של {n}x{n} משבצות, ישנן בדיוק {oNSquared} בדיקות מילוי וצביעה.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Space Complexity & AI Optimization */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-purple-500" />
              <span>ניתוח סיבוכיות מקום (Space Complexity):</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between">
                <span className="text-slate-500">זיכרון מחסנית (Call Stack):</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">O(1) Constant</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between">
                <span className="text-slate-500">זיכרון ערימה (Heap Allocation):</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">O(K) where K = 0.10 × N²</span>
              </div>
            </div>

            <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>המלצת אופטימיזציה מסוכן ה-AI:</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                שימוש ב-<strong>HashSet&lt;Integer&gt;</strong> במודל מייצר שליפה ב-<strong>O(1)</strong> למניעת כפילויות של תאים שנבחרו, ומונע לולאה כפולה מיותרת על המטריצה כולה. זהו מימוש אופטימלי ברמת יעילות מירבית!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
