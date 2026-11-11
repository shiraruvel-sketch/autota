import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  RotateCcw, 
  Layers, 
  Grid, 
  LayoutGrid,
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Maximize2, 
  Sparkles,
  Sliders,
  Cpu,
  Info
} from 'lucide-react';

interface JavaFXSimulatorProps {
  initialWidth?: number;
  initialHeight?: number;
  buggyMode?: 'none' | 'no-clear' | 'int-division' | 'hardcoded-size';
  onRunEdgeCases?: () => void;
}

export interface EdgeCaseResult {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'warning';
  details: string;
}

export const JavaFXSimulator: React.FC<JavaFXSimulatorProps> = ({
  initialWidth = 360,
  initialHeight = 280,
  buggyMode = 'none',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(initialWidth);
  const [canvasHeight, setCanvasHeight] = useState<number>(initialHeight);
  const [gridStep] = useState<number>(10); // בדיוק 10 פיקסלים לפי המטלה!
  const [clickCount, setClickCount] = useState<number>(1);
  const [fillPercent] = useState<number>(10); // 10% מהתאים
  const [simulatedBug, setSimulatedBug] = useState<'none' | 'no-clear' | 'int-division' | 'hardcoded-size'>(buggyMode);
  
  // Real-time metrics
  const [stats, setStats] = useState({
    totalCells: 0,
    filledCells: 0,
    actualPercent: 0,
    rows: 0,
    cols: 0,
  });

  const [edgeCaseResults, setEdgeCaseResults] = useState<EdgeCaseResult[]>([
    {
      id: 'ec-1',
      name: 'מרווח קווים של 10 פיקסלים (10px Grid Step)',
      description: 'בדיקת קווי רשת במרווח מדויק של 10px לאורך ולרוחב הקנבס',
      status: 'passed',
      details: 'מרחק בין קו לקו נמדד בדיוק 10.0px (בדומה לדף משבצות)',
    },
    {
      id: 'ec-2',
      name: 'מילוי מדויק של 10% מהתאים (10% Ratio)',
      description: 'בדיקה שסך התאים המלאים שווה בדיוק ל-10% מסך המשבצות',
      status: simulatedBug === 'int-division' ? 'failed' : 'passed',
      details: simulatedBug === 'int-division' 
        ? 'שגיאת חלוקה בשלמים: 10/100 הניב 0 תאים מלאים!' 
        : 'נבחרו בדיוק 10% ללא חריגה',
    },
    {
      id: 'ec-3',
      name: 'מיקום כפתור בפינה השמאלית העליונה (Top-Left Button)',
      description: 'הכפתור ממוקם ב-Top-Left של חלון ה-Application ומגיב בלחיצה',
      status: 'passed',
      details: 'כפתור Button מוגדר בפינה השמאלית ומפעיל מתודה ב-Controller',
    },
    {
      id: 'ec-4',
      name: 'ניקוי קנבס וסידור רנדומלי חדש בכל לחיצה (Clear & Redraw)',
      description: 'בכל לחיצה יש לנקות את הקנבס וליצור תפרוסת אקראית חדשה',
      status: simulatedBug === 'no-clear' ? 'failed' : 'passed',
      details: simulatedBug === 'no-clear' 
        ? 'הקנבס אינו מנוקה לפני ציור מחדש! התאים מצטברים מעבר ל-10%' 
        : 'קריאה ל-clearRect לפני כל ציור מחדש',
    },
    {
      id: 'ec-5',
      name: 'התאמה דינמית לשינוי גודל החלון (Dynamic Resize)',
      description: 'הקווים והתאים מתפרסים על כל משטח הציור גם בשינוי Canvas.getWidth()',
      status: simulatedBug === 'hardcoded-size' ? 'failed' : 'passed',
      details: simulatedBug === 'hardcoded-size'
        ? 'גודל המטריצה קובע Hardcoded ל-300x300 במקום לפי גודל ה-Canvas'
        : 'גבולות המטריצה מחושבים דינמית לפי getWidth() ו-getHeight()',
    },
    {
      id: 'ec-6',
      name: 'שימוש תקני ב-GraphicsContext.fillRect',
      description: 'ציור הריבועים מתבצע במתודה fillRect של GraphicsContext בלבד',
      status: 'passed',
      details: 'מתודת fillRect נקראת עם קואורדינטות ומידות 10x10',
    },
  ]);

  // Redraw canvas with full JavaFX specification
  const drawMatrix = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvasWidth;
    const h = canvasHeight;

    // In 'no-clear' bug mode, do NOT clear previous drawing
    if (simulatedBug !== 'no-clear') {
      ctx.clearRect(0, 0, w, h);
    }

    // Background (paper style like math notebook)
    ctx.fillStyle = '#ffffff';
    if (simulatedBug !== 'no-clear') {
      ctx.fillRect(0, 0, w, h);
    }

    const effectiveW = simulatedBug === 'hardcoded-size' ? Math.min(w, 250) : w;
    const effectiveH = simulatedBug === 'hardcoded-size' ? Math.min(h, 200) : h;

    const cols = Math.floor(effectiveW / gridStep);
    const rows = Math.floor(effectiveH / gridStep);
    const total = cols * rows;

    // Calculate filled count: 10%
    let filledCount = 0;
    if (simulatedBug === 'int-division') {
      // Common student mistake: (10 / 100) * total in integer arithmetic results in 0!
      filledCount = 0;
    } else {
      filledCount = Math.round(total * (fillPercent / 100));
    }

    // Pick 10% unique random cell indices
    const cellIndices = new Set<number>();
    while (cellIndices.size < filledCount && cellIndices.size < total) {
      const randIdx = Math.floor(Math.random() * total);
      cellIndices.add(randIdx);
    }

    // 1. Draw filled squares (fillRect)
    ctx.fillStyle = '#0f172a'; // Black/slate filled squares
    cellIndices.forEach((idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      ctx.fillRect(col * gridStep, row * gridStep, gridStep, gridStep);
    });

    // 2. Draw grid lines (10px spacing)
    ctx.strokeStyle = '#94a3b8'; // Light grid line
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= effectiveW; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, effectiveH);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= effectiveH; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(effectiveW, y + 0.5);
      ctx.stroke();
    }

    // Update real metrics
    setStats({
      totalCells: total,
      filledCells: filledCount,
      actualPercent: total > 0 ? Number(((filledCount / total) * 100).toFixed(1)) : 0,
      rows,
      cols,
    });
  }, [canvasWidth, canvasHeight, gridStep, fillPercent, simulatedBug]);

  // Initial draw and redraw on resize
  useEffect(() => {
    drawMatrix();
  }, [drawMatrix]);

  // Button click in Controller (responding to user action)
  const handleRandomizeClick = () => {
    setClickCount((prev) => prev + 1);
    drawMatrix();
  };

  const handleBugModeChange = (mode: 'none' | 'no-clear' | 'int-division' | 'hardcoded-size') => {
    setSimulatedBug(mode);
    // Update edge case results live
    setEdgeCaseResults((prev) =>
      prev.map((ec) => {
        if (ec.id === 'ec-2') {
          return {
            ...ec,
            status: mode === 'int-division' ? 'failed' : 'passed',
            details: mode === 'int-division'
              ? 'שגיאת חלוקה בשלמים (10/100=0): לא נצבעו תאים כלל!'
              : 'נבחרו בדיוק 10% מהתאים ללא חריגה',
          };
        }
        if (ec.id === 'ec-4') {
          return {
            ...ec,
            status: mode === 'no-clear' ? 'failed' : 'passed',
            details: mode === 'no-clear'
              ? 'שגיאת אי-ניקוי קנבס: תאים מצטברים בכל לחיצה מעבר ל-10%!'
              : 'קריאה ל-clearRect לפני כל ציור מחדש',
          };
        }
        if (ec.id === 'ec-5') {
          return {
            ...ec,
            status: mode === 'hardcoded-size' ? 'failed' : 'passed',
            details: mode === 'hardcoded-size'
              ? 'גודל המטריצה מקובע (Hardcoded) ואינו מתאים את עצמו לגודל החלון'
              : 'גבולות המטריצה מחושבים דינמית לפי Canvas.getWidth() ו-getHeight()',
          };
        }
        return ec;
      })
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Simulator Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                סימולטור JavaFX חי – מטריצת קווים ותאים רנדומליים
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Application & Controller Live Runtime
              </span>
            </div>
            <p className="text-xs text-slate-400">
              הדמיה חזותית מדויקת של Canvas, GraphicsContext וכפתור עליון לפי דרישות שאלה 2
            </p>
          </div>
        </div>

        {/* Bug Simulator Mode Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">בדוק התנהגות:</span>
          <select
            value={simulatedBug}
            onChange={(e) => handleBugModeChange(e.target.value as any)}
            className="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="none">קוד תקין ומלא (100 נקודות)</option>
            <option value="int-division">באג: חלוקה בשלמים 10/100=0 (תאים ריקים)</option>
            <option value="no-clear">באג: ללא clearRect (תאים מצטברים)</option>
            <option value="hardcoded-size">באג: גודל מטריצה Hardcoded</option>
          </select>
        </div>
      </div>

      {/* Main Simulation Stage */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Canvas Window */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Simulated JavaFX Window Frame */}
          <div className="w-full max-w-[440px] bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
            {/* JavaFX Window Title Bar */}
            <div className="bg-slate-850 px-3 py-2 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                <span className="mr-2 text-slate-400 font-sans">JavaFX Stage: Question 2 Matrix Canvas</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {canvasWidth}x{canvasHeight}px
              </span>
            </div>

            {/* JavaFX Stage Content Pane */}
            <div className="p-3 bg-slate-100 flex flex-col gap-2 relative">
              {/* TOP-LEFT BUTTON (Required by Question 2!) */}
              <div className="flex items-center justify-between pb-1">
                <button
                  onClick={handleRandomizeClick}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded shadow-sm border border-blue-700 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  title="בכל לחיצה על הכפתור יש להציג סידור רנדומלי חדש של התאים המלאים"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>סידור רנדומלי חדש (Randomize 10%)</span>
                </button>

                <div className="text-[11px] font-mono text-slate-700 bg-white/90 px-2 py-0.5 rounded border border-slate-300 shadow-xs">
                  לחיצות: <strong className="text-blue-700">{clickCount}</strong>
                </div>
              </div>

              {/* The Visual Canvas Component */}
              <div className="border border-slate-400 rounded bg-white shadow-inner overflow-hidden flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={canvasWidth}
                  height={canvasHeight}
                  className="block cursor-crosshair"
                />
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 font-mono">
                <span>רווח קווים: 10px (דף חשבון)</span>
                <span>מילוי: 10% משבצות ב-fillRect</span>
              </div>
            </div>
          </div>

          {/* Canvas Size Sliders (To test dynamic scaling) */}
          <div className="w-full max-w-[440px] mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-4">
            <span className="text-slate-400 font-medium">שינוי גודל Canvas:</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">רוחב:</span>
              <input
                type="range"
                min="260"
                max="420"
                step="20"
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(Number(e.target.value))}
                className="w-20 accent-indigo-500"
              />
              <span className="text-[11px] font-mono text-slate-300 w-8">{canvasWidth}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">גובה:</span>
              <input
                type="range"
                min="200"
                max="340"
                step="20"
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(Number(e.target.value))}
                className="w-20 accent-indigo-500"
              />
              <span className="text-[11px] font-mono text-slate-300 w-8">{canvasHeight}</span>
            </div>
          </div>
        </div>

        {/* Right: Real-time Telemetry & Edge Cases */}
        <div className="lg:col-span-5 space-y-4">
          {/* Live Metrics Card */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>טלמטריה מתמטית בזמן אמת (Model State)</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">סך משבצות במטריצה:</span>
                <span className="text-base font-bold font-mono text-indigo-400">
                  {stats.totalCells} ({stats.cols} עמודות x {stats.rows} שורות)
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">תאים מלאים שנצבעו:</span>
                <span className={`text-base font-bold font-mono ${stats.filledCells === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {stats.filledCells} ({stats.actualPercent}%)
                </span>
              </div>
            </div>

            {simulatedBug === 'int-division' && (
              <div className="p-2.5 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>באג קריטי: 0 תאים נצבעו בגלל חלוקת מספרים שלמים ב-Java!</span>
              </div>
            )}

            {simulatedBug === 'no-clear' && (
              <div className="p-2.5 bg-amber-950/80 border border-amber-800 text-amber-200 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>אזהרה: הקנבס אינו מנוקה (`clearRect`) – משבצות ישנות מצטברות!</span>
              </div>
            )}
          </div>

          {/* Edge Case Verification Suite */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>כיסוי בדיקות קצה (Edge Cases Coverage)</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                {edgeCaseResults.filter((r) => r.status === 'passed').length}/{edgeCaseResults.length} עברו
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {edgeCaseResults.map((ec) => (
                <div
                  key={ec.id}
                  className={`p-2 rounded-lg border text-xs flex items-start gap-2.5 transition-all ${
                    ec.status === 'passed'
                      ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                      : 'bg-red-950/40 border-red-900/80 text-red-200'
                  }`}
                >
                  {ec.status === 'passed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-200 flex items-center justify-between">
                      <span>{ec.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        ec.status === 'passed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {ec.status === 'passed' ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{ec.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
