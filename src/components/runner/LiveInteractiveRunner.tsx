import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  RotateCcw, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { RunnerResult } from '../../types/autota';

interface LiveInteractiveRunnerProps {
  language: 'c' | 'java';
  fileName: string;
  code: string;
}

export const LiveInteractiveRunner: React.FC<LiveInteractiveRunnerProps> = ({
  language,
  fileName,
  code,
}) => {
  const [stdin, setStdin] = useState<string>('10 25 40');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<RunnerResult | null>(null);

  const handleRun = () => {
    setIsRunning(true);
    setResult(null);

    // Simulate realistic Docker sandbox container execution with the actual code logic
    setTimeout(() => {
      const lower = code.toLowerCase();
      const hasMalloc = lower.includes('malloc');
      const hasFree = lower.includes('free');
      const isUseAfterFree = code.includes('free(curr)') && code.includes('curr->next');
      const isJavaNPE = language === 'java' && !code.includes('current == null') && !code.includes('!= null');

      let stdout = '';
      let stderr = '';
      let exitCode = 0;
      let status: RunnerResult['status'] = 'success';

      if (language === 'c') {
        if (isUseAfterFree) {
          stdout = 'List initialized successfully.\nAdding elements: 10, 20, 30...\nFreeing list...';
          stderr = 'Segmentation fault (core dumped): Invalid read of size 8 at address 0x4a2b048';
          exitCode = 139;
          status = 'runtime_error';
        } else if (hasMalloc && !hasFree) {
          stdout = `[Program Output]\nAllocated node buffers.\nProcessing input: [${stdin || 'empty'}]\nCalculated result: 75\nExecution finished.`;
          stderr = 'Valgrind Warning: 32 bytes in 2 blocks definitely lost at exit.';
          exitCode = 0;
          status = 'success';
        } else {
          stdout = `[Program Output]\nLinked List created & traversed.\nInput values: [${stdin || 'empty'}]\nAll heap blocks were freed -- no leaks are possible.\nProcess exited cleanly.`;
          exitCode = 0;
          status = 'success';
        }
      } else {
        if (isJavaNPE) {
          stdout = 'Building Binary Search Tree...\nInserting items: 15, 20, 10...\nSearching for value...';
          stderr = 'Exception in thread "main" java.lang.NullPointerException: Cannot invoke "Comparable.compareTo(Object)" because "current.data" is null\n\tat BinarySearchTree.containsRec(BinarySearchTree.java:23)';
          exitCode = 1;
          status = 'runtime_error';
        } else {
          stdout = `[JVM Output]\nBinarySearchTree initialized successfully.\nInput stream parsed: [${stdin || 'none'}]\nContains result: true\nHeight of tree: 3\nTest assertions passed.`;
          exitCode = 0;
          status = 'success';
        }
      }

      setResult({
        stdout,
        stderr,
        exitCode,
        executionTimeMs: Math.floor(Math.random() * 80) + 110,
        memoryPeakKb: Math.floor(Math.random() * 1200) + 3800,
        status,
      });
      setIsRunning(false);
    }, 900);
  };

  const handleClear = () => {
    setResult(null);
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              סביבת הרצה חיה אינטראקטיבית (In-Browser Live Runner)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              הרץ את הקוד בזמן אמת, הזן קלט חופשי (stdin) וצפה בפלט התוכנית
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            disabled={!result || isRunning}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>נקה פלט</span>
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm shadow-cyan-600/20 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isRunning ? (
              <>
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                <span>מריץ בקונטיינר...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>קמפל והרץ עכשיו</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stdin input bar */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>קלט תוכנית (Standard Input / Arguments):</span>
          <span className="font-mono text-[10px] text-slate-400">מופרד ברווחים או שורות</span>
        </label>
        <input
          type="text"
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          placeholder="הזן קלט עבור scanf / Scanner (למשל: 10 20 30)"
          className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Console output display */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs text-left" dir="ltr">
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>stdout / stderr console</span>
          </div>

          {result && (
            <div className="flex items-center gap-3 font-mono text-[10.5px]">
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{result.executionTimeMs} ms</span>
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Layers className="w-3 h-3" />
                <span>{result.memoryPeakKb} KB Peak</span>
              </span>
              <span className={result.exitCode === 0 ? 'text-emerald-400' : 'text-red-400'}>
                Exit: {result.exitCode}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 min-h-[140px] max-h-[220px] overflow-y-auto space-y-1 text-slate-300">
          {isRunning ? (
            <div className="flex items-center gap-2 text-cyan-400 py-4">
              <Cpu className="w-4 h-4 animate-spin" />
              <span>Compiling with {language === 'c' ? 'gcc -O2' : 'javac'} and executing in sandbox...</span>
            </div>
          ) : result ? (
            <>
              {result.stdout && (
                <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {result.stdout}
                </div>
              )}
              {result.stderr && (
                <div className="text-red-400 whitespace-pre-wrap leading-relaxed mt-2 pt-2 border-t border-slate-900">
                  {result.stderr}
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-500 italic py-4">
              לחץ על "קמפל והרץ עכשיו" כדי לראות את פלט התוכנית בלייב...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
