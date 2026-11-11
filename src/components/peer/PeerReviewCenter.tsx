import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Eye, 
  Award,
  Send,
  Code
} from 'lucide-react';

interface PeerSubmission {
  id: string;
  pseudonym: string;
  assignmentTitle: string;
  language: string;
  codeSnippet: string;
  scoreRange: string;
  reviewsCount: number;
  comments: {
    id: string;
    reviewer: string;
    text: string;
    upvotes: number;
    timestamp: string;
    isAiApproved: boolean;
  }[];
}

export const PeerReviewCenter: React.FC = () => {
  const [peerSubmissions, setPeerSubmissions] = useState<PeerSubmission[]>([
    {
      id: 'peer-1',
      pseudonym: 'סטודנט אלמוני #4812',
      assignmentTitle: 'מטלה 4: יישום JavaFX (שאלה 2)',
      language: 'Java',
      codeSnippet: `// MatrixController.java
public void drawGridAndCells() {
    GraphicsContext gc = canvas.getGraphicsContext2D();
    // האם נכון לשמור את ה-gc כמשתנה מקומי או שדה מחלקה?
    int cols = (int)(canvas.getWidth() / 10);
    int rows = (int)(canvas.getHeight() / 10);
    // חישוב 10%
    int filled = (int)(cols * rows * 0.10);
    ...
}`,
      scoreRange: '90-95',
      reviewsCount: 3,
      comments: [
        {
          id: 'c1',
          reviewer: 'עמית מבקר #102',
          text: 'חלוקה יפה מאוד למתודות! שים לב שכדאי להוסיף בדיקה שגודל הקנבס גדול מ-0 כדי למנוע חלוקה באפס בעת הקטנת החלון.',
          upvotes: 4,
          timestamp: 'לפני 25 דקות',
          isAiApproved: true,
        },
      ],
    },
    {
      id: 'peer-2',
      pseudonym: 'סטודנט אלמוני #9340',
      assignmentTitle: 'מטלה 1: רשימה מקושרת ב-C',
      language: 'C',
      codeSnippet: `void free_list(Node* head) {
    Node* curr = head;
    while (curr != NULL) {
        Node* next = curr->next;
        free(curr);
        curr = next;
    }
}`,
      scoreRange: '98-100',
      reviewsCount: 5,
      comments: [
        {
          id: 'c2',
          reviewer: 'עמית מבקר #554',
          text: 'שימוש מעולה במצביע זמני next_node לפני שחרור ה-curr ב-free(). מנעת לחלוטין זליגת זיכרון של Valgrind!',
          upvotes: 6,
          timestamp: 'לפני שעתיים',
          isAiApproved: true,
        },
      ],
    },
  ]);

  const [selectedPeer, setSelectedPeer] = useState<PeerSubmission>(peerSubmissions[0]);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [isAiGuiding, setIsAiGuiding] = useState<boolean>(true);

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;

    const newComment = {
      id: `c-${Date.now()}`,
      reviewer: 'אני (עמית אנונימי #318)',
      text: newCommentText,
      upvotes: 1,
      timestamp: 'עכשיו',
      isAiApproved: true,
    };

    setPeerSubmissions((prev) =>
      prev.map((p) =>
        p.id === selectedPeer.id
          ? { ...p, reviewsCount: p.reviewsCount + 1, comments: [newComment, ...p.comments] }
          : p
      )
    );
    setSelectedPeer((prev) => ({
      ...prev,
      reviewsCount: prev.reviewsCount + 1,
      comments: [newComment, ...prev.comments],
    }));
    setNewCommentText('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                מרכז ביקורת עמיתים אנונימית (Double-Blind Peer Review)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                Anonymous & Pedagogical
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              למידת עמיתים מעצימה: קריאת קוד של חברים לכיתה, השארת שאלות חקר ומשוב בונה ללא חשיפת זהויות
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800">
          <Lock className="w-3.5 h-3.5" />
          <span>חיסיון מלא: כל השמות והת"ז מוצפנים</span>
        </div>
      </div>

      {/* Peer Review Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submissions List */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            הגשות פתוחות לביקורת עמיתים:
          </h4>

          <div className="space-y-2">
            {peerSubmissions.map((peer) => (
              <div
                key={peer.id}
                onClick={() => setSelectedPeer(peer)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedPeer.id === peer.id
                    ? 'border-teal-500 bg-teal-50/30 dark:bg-teal-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-teal-500/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <span>{peer.pseudonym}</span>
                  <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                    טווח: {peer.scoreRange}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {peer.assignmentTitle}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                  <span>שפה: {peer.language}</span>
                  <span>{peer.reviewsCount} ביקורות עמיתים</span>
                </div>
              </div>
            ))}
          </div>

          {/* Socratic Coaching Card for Reviewers */}
          <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>כללי ה-AI למתן ביקורת עמיתים בונה:</span>
            </div>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
              <li>פתח בשבח על חלק שעבד יפה (למשל: הפרדת מחלקות או שחרור זיכרון).</li>
              <li>שאל שאלה מנחה במקום לתת פתרון קוד מוכן.</li>
              <li>התייחס לתנאי קצה שעשויים להפתיע את הקוד.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Code Snippet & Discussion */}
        <div className="lg:col-span-7 space-y-4">
          {/* Code Viewer */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs text-left" dir="ltr">
            <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/60 text-[11px] text-slate-400 flex justify-between items-center">
              <span className="text-teal-400 font-semibold">{selectedPeer.pseudonym} · Code Review Snippet</span>
              <span>Language: {selectedPeer.language}</span>
            </div>
            <pre className="p-4 text-slate-300 leading-relaxed overflow-x-auto selection:bg-teal-500/30">
              {selectedPeer.codeSnippet}
            </pre>
          </div>

          {/* Add Review Form */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-teal-500" />
              <span>הוסף הערה פדגוגית בונה לעמית:</span>
            </h4>
            <div className="flex gap-2">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="כתוב כאן משוב בונה לעמית (לדוגמה: 'שמתי לב שבשורה 5 מתבצעת חלוקה, מה יקרה אם...')"
                className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none h-20"
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all shadow-md shadow-teal-600/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>שלח</span>
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-2.5">
            {selectedPeer.comments.map((comment) => (
              <div
                key={comment.id}
                className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {comment.reviewer}
                    </span>
                    {comment.isAiApproved && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>אושר ע"י AI Mentor</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{comment.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {comment.text}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                  <button className="flex items-center gap-1 hover:text-teal-500 transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    <span>עזר לי ({comment.upvotes})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
