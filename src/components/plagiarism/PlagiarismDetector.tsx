import React, { useState } from 'react';
import { 
  ShieldAlert, 
  GitCompare, 
  Bot, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  FileCode, 
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { PlagiarismPair } from '../../types/autota';

const MOCK_PLAGIARISM_PAIRS: PlagiarismPair[] = [
  {
    id: 'plag-1',
    studentA: { name: 'דניאל אברמוב', id: '315891024', submissionId: 'sub-103' },
    studentB: { name: 'עמית שפירא', id: '208491823', submissionId: 'sub-105' },
    similarityScore: 88,
    aiGeneratedProbability: 18,
    matchedLinesCount: 24,
    assignmentTitle: 'מטלה 1: רשימה מקושרת וניהול זיכרון ב-C',
    detectionDetails: 'דמיון מבני עמוק בעץ ה-AST (Abstract Syntax Tree). זוהתה החלפה שטחית של שמות משתנים: "curr" הוחלף ב-"iterator", וסדר פונקציות העזר זהה ב-100%.',
    codeSnippetA: `void free_list(Node* head) {
    Node* curr = head;
    while (curr != NULL) {
        Node* next_temp = curr->next;
        free(curr);
        curr = next_temp;
    }
}`,
    codeSnippetB: `void free_list(Node* head) {
    Node* iterator = head;
    while (iterator != NULL) {
        Node* next_node = iterator->next;
        free(iterator);
        iterator = next_node;
    }
}`,
    verdict: 'flagged',
  },
  {
    id: 'plag-2',
    studentA: { name: 'רועי ברקוביץ', id: '319204817', submissionId: 'sub-108' },
    studentB: { name: 'פרומפט ChatGPT 4o', id: 'AI-MODEL', submissionId: 'gpt-ref' },
    similarityScore: 92,
    aiGeneratedProbability: 94,
    matchedLinesCount: 38,
    assignmentTitle: 'מטלה 2: עץ חיפוש בינארי ב-Java',
    detectionDetails: 'הקוד כולל הערות באנגלית ספרותית בסגנון מודל שפה, שימוש ב-Java Stream API מורכב שאינו נלמד בקורס, ותבניות טיפול בשגיאות זהות לפלט טיפוסי של ChatGPT.',
    codeSnippetA: `// Recursively search for element with null-safety and generic bounds
private boolean containsRec(Node current, T val) {
    return Optional.ofNullable(current)
        .map(n -> n.data.compareTo(val) == 0 || (n.data.compareTo(val) > 0 ? containsRec(n.left, val) : containsRec(n.right, val)))
        .orElse(false);
}`,
    codeSnippetB: `// ChatGPT 4o generated solution reference
private boolean containsRec(Node current, T val) {
    return Optional.ofNullable(current)
        .map(n -> n.data.compareTo(val) == 0 || (n.data.compareTo(val) > 0 ? containsRec(n.left, val) : containsRec(n.right, val)))
        .orElse(false);
}`,
    verdict: 'flagged',
  },
  {
    id: 'plag-3',
    studentA: { name: 'יונתן כהן', id: '318942105', submissionId: 'sub-101' },
    studentB: { name: 'מאיה לוי', id: '209384712', submissionId: 'sub-102' },
    similarityScore: 32,
    aiGeneratedProbability: 12,
    matchedLinesCount: 6,
    assignmentTitle: 'מטלה 1: רשימה מקושרת ב-C',
    detectionDetails: 'דמיון מקרי בחתימות פונקציות הסטנדרטיות הנדרשות במפרט המטלה. המימוש הפנימי שונה לחלוטין.',
    codeSnippetA: `Node* create_node(int val) {
    Node* n = (Node*)malloc(sizeof(Node));
    n->val = val;
    n->next = NULL;
    return n;
}`,
    codeSnippetB: `Node* create_node(int value) {
    if (value < 0) return NULL;
    Node* p = malloc(sizeof(*p));
    if (!p) exit(1);
    *p = (Node){ .val = value, .next = NULL };
    return p;
}`,
    verdict: 'clean',
  },
];

export const PlagiarismDetector: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<PlagiarismPair>(MOCK_PLAGIARISM_PAIRS[0]);
  const [filterVerdict, setFilterVerdict] = useState<string>('all');

  const filteredPairs = MOCK_PLAGIARISM_PAIRS.filter((p) =>
    filterVerdict === 'all' ? true : p.verdict === filterVerdict
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">
                זיהוי פלגיאט ודמיון קוד מבוסס AI (MOSS & LLM Detector)
              </h2>
              <span className="text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                AST Similarity Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              בדיקת הצלבה בין הגשות סטודנטים, זיהוי שינוי שמות משתנים שטחי, וסריקת סממני ChatGPT / Copilot
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-xs">
            <span className="text-amber-400 font-bold text-base">2</span> זוגות חשודים
            <div className="text-[10px] text-slate-400">מתוך 67 הגשות שנסרקו</div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>זיהוי דמיון בין סטודנטים (Peer MOSS)</span>
            <GitCompare className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            88% <span className="text-xs text-amber-500 font-sans font-normal">דמיון שיא</span>
          </div>
          <p className="text-[11px] text-slate-400">נמצאה התאמה במבנה ה-AST בין 2 הגשות</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>זיהוי פלט מחולל ע"י AI (ChatGPT)</span>
            <Bot className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
            94% <span className="text-xs text-slate-400 font-sans font-normal">הסתברות</span>
          </div>
          <p className="text-[11px] text-slate-400">הגשה אחת זוהתה כהעתקה ממודל שפה</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>שיעור טוהר אקדמי קורסי</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            95.5%
          </div>
          <p className="text-[11px] text-slate-400">64 מתוך 67 הגשות נקיות לחלוטין</p>
        </div>
      </div>

      {/* Main Grid: Pair List & Side-by-Side Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Suspicious Pairs List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 pb-1">
            <span>התאמות שזוהו במערכת:</span>
            <select
              value={filterVerdict}
              onChange={(e) => setFilterVerdict(e.target.value)}
              className="text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300"
            >
              <option value="all">הכל</option>
              <option value="flagged">חשודים בלבד</option>
              <option value="clean">תקין</option>
            </select>
          </div>

          <div className="space-y-2">
            {filteredPairs.map((pair) => {
              const isSelected = selectedPair.id === pair.id;
              const isHigh = pair.similarityScore >= 80 || pair.aiGeneratedProbability >= 80;

              return (
                <button
                  key={pair.id}
                  onClick={() => setSelectedPair(pair)}
                  className={`w-full text-right p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {pair.studentA.name} <span className="text-slate-400 font-normal">מול</span> {pair.studentB.name}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isHigh
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {pair.similarityScore}% דמיון
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {pair.assignmentTitle}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[10.5px] font-mono text-slate-400">
                    <span>{pair.matchedLinesCount} שורות חופפות</span>
                    {pair.aiGeneratedProbability > 50 && (
                      <span className="text-purple-500 font-semibold">
                        {pair.aiGeneratedProbability}% סבירות AI
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Comparison & Side-by-Side Diff */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  ניתוח ממצאי סוכן הבדיקה
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedPair.assignmentTitle}
                </p>
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                  selectedPair.verdict === 'flagged'
                    ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                    : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {selectedPair.verdict === 'flagged' ? 'חשד להעתקה / AI' : 'תקין'}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {selectedPair.detectionDetails}
            </p>

            {/* Side-by-side code blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Code A */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPair.studentA.name}</span>
                  <span>ת.ז {selectedPair.studentA.id}</span>
                </div>
                <div className="bg-slate-950 border border-amber-900/60 rounded-xl p-3 font-mono text-[11px] text-slate-200 overflow-x-auto text-left" dir="ltr">
                  <pre className="whitespace-pre">{selectedPair.codeSnippetA}</pre>
                </div>
              </div>

              {/* Code B */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPair.studentB.name}</span>
                  <span>ת.ז {selectedPair.studentB.id}</span>
                </div>
                <div className="bg-slate-950 border border-amber-900/60 rounded-xl p-3 font-mono text-[11px] text-slate-200 overflow-x-auto text-left" dir="ltr">
                  <pre className="whitespace-pre">{selectedPair.codeSnippetB}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
