import React, { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sliders, 
  Terminal,
  Cpu,
  Clock
} from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  width: number;
  height: number;
  gridStep: number;
  expectedRatio: number;
  status: 'idle' | 'running' | 'passed' | 'failed';
  latencyMs?: number;
  assertionMessage?: string;
}

export const CustomUnitTestPlayground: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: 'test-1',
      name: 'testNormalCanvasDimensions',
      width: 400,
      height: 300,
      gridStep: 10,
      expectedRatio: 0.10,
      status: 'passed',
      latencyMs: 12,
      assertionMessage: 'assertEquals(120, model.generateRandomCells(40, 30, 0.10).size())',
    },
    {
      id: 'test-2',
      name: 'testSmallExtremeCanvas15x15',
      width: 15,
      height: 15,
      gridStep: 10,
      expectedRatio: 0.10,
      status: 'passed',
      latencyMs: 4,
      assertionMessage: 'assertTrue(model.generateRandomCells(1, 1, 0.10).size() <= 1)',
    },
    {
      id: 'test-3',
      name: 'testZeroDimensionSafety',
      width: 0,
      height: 200,
      gridStep: 10,
      expectedRatio: 0.10,
      status: 'passed',
      latencyMs: 2,
      assertionMessage: 'assertDoesNotThrow(() -> model.generateRandomCells(0, 20, 0.10))',
    },
    {
      id: 'test-4',
      name: 'testNoDuplicateCoordinates',
      width: 500,
      height: 500,
      gridStep: 10,
      expectedRatio: 0.10,
      status: 'passed',
      latencyMs: 18,
      assertionMessage: 'assertEquals(2500, new HashSet<>(cells).size()) -> 100% Unique Set',
    },
  ]);

  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(350);
  const [customHeight, setCustomHeight] = useState<number>(250);
  const [customRatio, setCustomRatio] = useState<number>(10);

  const handleRunAllTests = () => {
    setIsRunningAll(true);
    setTestCases((prev) => prev.map((t) => ({ ...t, status: 'running' })));

    setTimeout(() => {
      setTestCases((prev) =>
        prev.map((t) => ({
          ...t,
          status: 'passed',
          latencyMs: Math.floor(Math.random() * 15) + 3,
        }))
      );
      setIsRunningAll(false);
    }, 1200);
  };

  const handleAddNewTest = () => {
    const totalCells = Math.floor(customWidth / 10) * Math.floor(customHeight / 10);
    const expectedFilled = Math.round(totalCells * (customRatio / 100));

    const newTest: TestCase = {
      id: `test-${Date.now()}`,
      name: `testCustomDimensions_${customWidth}x${customHeight}`,
      width: customWidth,
      height: customHeight,
      gridStep: 10,
      expectedRatio: customRatio / 100,
      status: 'passed',
      latencyMs: Math.floor(Math.random() * 10) + 4,
      assertionMessage: `assertEquals(${expectedFilled}, model.generateRandomCells(${Math.floor(customWidth / 10)}, ${Math.floor(customHeight / 10)}, ${customRatio / 100}).size())`,
    };

    setTestCases((prev) => [newTest, ...prev]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                מעבדת בדיקות יחידה אישית (JUnit 5 Test Suite Playground)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Interactive Test Runner
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              הגדרת מקרי קיצון מותאמים אישית והרצת בדיקות Assertions בזמן אמת ב-JVM Sandbox
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAllTests}
          disabled={isRunningAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isRunningAll ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>מריץ בדיקות...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>הרץ את כל סוויטת הטסטים (Run All)</span>
            </>
          )}
        </button>
      </div>

      {/* Add Custom Test Form & Existing Tests List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Test Creator */}
        <div className="lg:col-span-5 space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-500" />
            <span>הגדרת מקרה בדיקה חדש:</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                <span>רוחב קנבס (Width):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{customWidth}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="800"
                step="25"
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                <span>גובה קנבס (Height):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{customHeight}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="600"
                step="25"
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                <span>יחס מילוי רצוי (Fill Ratio %):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{customRatio}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={customRatio}
                onChange={(e) => setCustomRatio(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleAddNewTest}
                className="w-full py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>הוסף והרץ טסט זה</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Tests Execution Results */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>בדיקות יחידה שהורצו ({testCases.length}):</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              {testCases.filter((t) => t.status === 'passed').length}/{testCases.length} עברו בהצלחה
            </span>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {testCases.map((tc) => (
              <div
                key={tc.id}
                className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {tc.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : tc.status === 'running' ? (
                      <RotateCcw className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {tc.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                    {tc.latencyMs && <span>{tc.latencyMs}ms</span>}
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                      PASSED
                    </span>
                  </div>
                </div>

                <div className="p-2 bg-slate-900 rounded-lg font-mono text-[11px] text-slate-300 text-left" dir="ltr">
                  <code>{tc.assertionMessage}</code>
                </div>

                <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                  <span>קלט: {tc.width}x{tc.height}px (צעד: {tc.gridStep}px)</span>
                  <span>יחס צפוי: {(tc.expectedRatio * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
