import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  AlertCircle, 
  CheckCircle2,
  X
} from 'lucide-react';

interface TimedExamBannerProps {
  isExamMode: boolean;
  onToggleExamMode: () => void;
  onTimeExpired: () => void;
}

export const TimedExamBanner: React.FC<TimedExamBannerProps> = ({
  isExamMode,
  onToggleExamMode,
  onTimeExpired,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5400); // 90 minutes
  const [tabSwitchesCount, setTabSwitchesCount] = useState<number>(0);
  const [showWarning, setShowWarning] = useState<boolean>(false);

  // Countdown timer when exam mode is active
  useEffect(() => {
    if (!isExamMode) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExamMode, onTimeExpired]);

  // Tab switch detection (Academic Integrity proctoring)
  useEffect(() => {
    if (!isExamMode) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchesCount((prev) => prev + 1);
        setShowWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isExamMode]);

  if (!isExamMode) return null;

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalDuration = 5400;
  const progressPct = ((totalDuration - secondsRemaining) / totalDuration) * 100;

  return (
    <div className="space-y-2 mb-6 animate-in slide-in-from-top duration-300">
      {/* Integrity Warning if user switched tabs */}
      {showWarning && (
        <div className="p-3 bg-red-950/80 border border-red-700 rounded-xl text-red-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>אזהרת משגיח:</strong> זוהתה עזיבה של חלון המבחן ({tabSwitchesCount} פעמים). האירוע נרשם ביומן הבחינה האקדמי.
            </span>
          </div>
          <button onClick={() => setShowWarning(false)} className="p-1 text-red-300 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Exam Status Strip */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/90 via-slate-900 to-red-950/90 border border-red-800 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center animate-pulse">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">מצב בחינה מוגבל בזמן (Timed Exam Active)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/30 text-red-200 border border-red-500/40">
                נעול להגשה
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              בוחן אמצע סמסטר: מבוא למערכות הפעלה · ההגשה תוגש אוטומטית עם תום הזמן
            </p>
          </div>
        </div>

        {/* Big Countdown Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-red-800/80 px-4 py-2 rounded-xl font-mono">
            <Clock className="w-4 h-4 text-red-400 animate-spin" />
            <span className="text-xl font-extrabold text-red-400 tracking-wider">
              {formattedTime}
            </span>
          </div>

          <button
            onClick={onToggleExamMode}
            className="text-xs px-3 py-2 rounded-xl border border-red-700 bg-red-900/40 hover:bg-red-900/60 text-red-200 transition-colors"
          >
            יציאה ממצב בחינה
          </button>
        </div>
      </div>
    </div>
  );
};
