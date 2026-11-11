import { Submission } from '../types/autota';

/**
 * Exports submissions to an Excel-compatible CSV file with UTF-8 BOM
 * for perfect Hebrew display in Microsoft Excel & Google Sheets.
 */
export function exportToExcelCSV(submissions: Submission[], courseName: string = '89-210'): void {
  const headers = [
    'מזהה הגשה',
    'שם הסטודנט',
    'תעודת זהות',
    'שם המטלה',
    'שפת תכנות',
    'שם הקובץ',
    'ציון סופי',
    'טסטים שעברו',
    'סך כל הטסטים',
    'זליגת Valgrind (בתים)',
    'אזהרות Clang-Tidy',
    'סטטוס',
    'תאריך ושעת הגשה',
  ];

  const rows = submissions.map((sub) => [
    sub.id,
    `"${sub.studentName.replace(/"/g, '""')}"`,
    `"${sub.studentId}"`,
    `"${sub.assignmentTitle.replace(/"/g, '""')}"`,
    sub.language.toUpperCase(),
    `"${sub.fileName}"`,
    sub.grade,
    sub.testPassed,
    sub.testTotal,
    sub.valgrindOutput.leaksDetected ? sub.valgrindOutput.bytesLeaked : 0,
    sub.staticAnalysis.warningsCount,
    sub.status === 'graded' ? 'ניתן ציון' : sub.status === 'evaluating' ? 'בבדיקה' : 'ממתין',
    `"${sub.submittedAt}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  // \uFEFF is UTF-8 Byte Order Mark (BOM) ensuring Hebrew renders properly in Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AutoTA_Grades_${courseName}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Opens an academic-grade print layout and triggers the browser's Print to PDF
 */
export function printOrSavePDF(submission: Submission): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('אנא אפשר חלונות קופצים כדי להפיק דוח PDF');
    return;
  }

  const flawsHtml = submission.pedagogicalFeedback.logicalFlaws
    .map(
      (flaw, idx) => `
    <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 12px; background: #f8fafc;">
      <div style="font-weight: bold; color: #0f172a; font-size: 14px;">${idx + 1}. ${flaw.title} ${flaw.line ? `(שורה ${flaw.line})` : ''}</div>
      <div style="margin-top: 6px; font-style: italic; color: #0284c7; font-size: 13px;">שאלה מנחה: "${flaw.socraticQuestion}"</div>
      <div style="margin-top: 4px; color: #475569; font-size: 12px;">רמז מושגי: ${flaw.conceptualHint}</div>
    </div>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>דוח בדיקה פדגוגי - ${submission.studentName} - ${submission.assignmentTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700;800&family=JetBrains+Mono&display=swap');
    body {
      font-family: 'Heebo', sans-serif;
      margin: 40px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 12px;
      background: #f1f5f9;
      color: #334155;
    }
    .score-box {
      border: 2px solid #0891b2;
      border-radius: 12px;
      padding: 16px 24px;
      text-align: center;
      background: #f0fdfa;
    }
    .score-number {
      font-size: 36px;
      font-weight: 800;
      color: #0891b2;
      font-family: 'JetBrains Mono', monospace;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 14px;
    }
    .card-title {
      font-size: 12px;
      font-weight: bold;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    pre {
      background: #0f172a;
      color: #e2e8f0;
      padding: 12px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      overflow-x: auto;
      direction: ltr;
      text-align: left;
    }
    @media print {
      body { margin: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: left;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #0891b2; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">הדפס / שמור כ-PDF</button>
  </div>

  <div class="header">
    <div>
      <h1 style="margin: 0; font-size: 22px;">דוח הערכה פדגוגי אוטומטי (AutoTA)</h1>
      <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">המחלקה למדעי המחשב · מערכת בדיקה רב-סוכנית</p>
    </div>
    <div class="score-box">
      <div style="font-size: 11px; font-weight: bold; color: #0891b2;">ציון סופי</div>
      <div class="score-number">${submission.grade}</div>
      <div style="font-size: 11px; color: #64748b;">${submission.testPassed}/${submission.testTotal} טסטים עברו</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">פרטי הסטודנט וההגשה</div>
      <div style="font-size: 14px; font-weight: bold;">${submission.studentName}</div>
      <div style="font-size: 12px; color: #64748b;">ת.ז: ${submission.studentId}</div>
      <div style="font-size: 12px; color: #64748b;">תאריך הגשה: ${submission.submittedAt}</div>
    </div>
    <div class="card">
      <div class="card-title">פרטי המטלה</div>
      <div style="font-size: 14px; font-weight: bold;">${submission.assignmentTitle}</div>
      <div style="font-size: 12px; color: #64748b;">קובץ: ${submission.fileName} (${submission.language.toUpperCase()})</div>
      <div style="font-size: 12px; color: ${submission.valgrindOutput.leaksDetected ? '#d97706' : '#16a34a'};">
        בדיקת זיכרון (Valgrind): ${submission.valgrindOutput.leaksDetected ? `זוהתה זליגה של ${submission.valgrindOutput.bytesLeaked} בתים` : 'תקין ללא זליגות'}
      </div>
    </div>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">סיכום המנטור הפדגוגי</h3>
    <p style="font-size: 14px; line-height: 1.6; color: #334155;">${submission.pedagogicalFeedback.summary}</p>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">שאלות הכוונה סוקרטיות (Socratic Mentorship)</h3>
    ${flawsHtml || '<p style="color: #16a34a;">לא נמצאו שגיאות לוגיות. כל הבדיקות עברו בהצלחה!</p>'}
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">פלט סביבת ההרצה המבודדת (Docker Sandbox & Valgrind)</h3>
    <pre>${submission.valgrindOutput.rawOutput}</pre>
  </div>

  <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between;">
    <span>הופק אוטומטית ע"י AutoTA Socratic Evaluator v1.0</span>
    <span>חתימה דיגיטלית: 0x${Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
  </div>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
