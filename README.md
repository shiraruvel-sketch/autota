# 🎓 AutoTA - AI Pedagogical Code Grader & Multi-Agent Pipeline

> **מערכת אוטומטית לבדיקת מטלות תכנות (C / Java) ומתן משוב פדגוגי סוקרטי מבוססת סוכני AI.**

AutoTA היא פלטפורמת Full-Stack אקדמית לבדיקה, הערכה וניטור של מטלות תכנות ומבחנים מקוונים. במקום להחזיר רק הודעת שגיאה טכנית יבשה, המערכת מפעילה ארכיטקטורה של 3 סוכני AI המייצרים **משוב סוקרטי מנחה** שמלמד את הסטודנט להבין את הטעות בעצמו ללא חשיפת פתרון ישיר.

---

## 🚀 תכונות עיקריות (Features)

1. **פורטל סטודנט (Student Portal)**:
   - העלאת קבצים (Drag & Drop) עם תמיכה בקבצי `.c`, `.java`, `.zip`.
   - עורך קוד חי עם דוגמאות מובנות (זליגות זיכרון Valgrind, חריגות NullPointer ב-Java, ועוד).
   - סביבת הרצה חיה אינטראקטיבית בדפדפן (Live Interactive Runner עם קלט `stdin` ופלט `stdout`).
   - דוח משוב פדגוגי סוקרטי מפורט עם הדגשת שורות קוד בעייתיות (Annotated Code).
   - צ'אט אינטראקטיבי חי עם מנטור ה-AI לשאלות הבנה.

2. **זרימת בדיקה רב-סוכנית מונפשת (3-Stage Pipeline)**:
   - **שלב 1: סורק קוד (Static Analysis)** – Clang-Tidy, SpotBugs וסריקת תחביר AST.
   - **שלב 2: סביבת הרצה מבודדת (Docker Sandbox)** – קומפילציית GCC/Javac, פרופיילר Valgrind וטסטים מבודדים.
   - **שלב 3: סינתוז משוב פדגוגי (Socratic AI Mentor)** – מניעת חשיפת פתרון קוד מוכן והמרת שגיאות לשאלות חקר.

3. **לוח בקרה למתרגל (TA Dashboard)**:
   - אנליטיקס קורסי: שיעורי הצלחה, ציון ממוצע, וזיהוי שגיאות נפוצות (42% Memory Leaks).
   - טבלת ניהול הגשות וסינון לפי שפה ומטלה, כולל עריכת ציון ידנית.
   - ייצוא גיליון ציונים ישירות ל-Excel (`.csv` תואם עברית עם BOM).

4. **זיהוי פלגיאט ודמיון קוד (MOSS & LLM Detector)**:
   - השוואת עץ תחביר AST בין הגשות סטודנטים לזיהוי שינויי שמות משתנים שטחיים.
   - אלגוריתם זיהוי קוד שנוצר ע"י מודלי שפה (ChatGPT / Copilot).
   - תצוגת השוואה זה-לצד-זה (Side-by-Side Diff) עם שורות חופפות.

5. **מערכת מבחנים ובחנים מוגבלים בזמן (Timed Exam Mode)**:
   - תמיכה במבחנים לפי מקצועות (תכנות מערכות ב-C, מבני נתונים ב-Java, ועוד).
   - שאלות אמריקאיות ושאלות קוד מעשיות.
   - שעון עצר רץ לאחור (טיימר 90 דקות).
   - מערכת השגחה (Proctoring) המזהה ומדווחת על יציאה מחלון הבחינה.
   - חישוב ציון ופירוט נקודות מיידי עם סיום המבחן.

6. **שלד שרת ב-Python FastAPI וסכמות PostgreSQL**:
   - מודלים מלאים של SQLAlchemy 2.0 Async (`Student`, `Assignment`, `Submission`, `AgentLog`).
   - סקריפט DDL מלא עבור PostgreSQL עם מפתחות זרים ואינדקסים.
   - ראוטרים של FastAPI להעלאת קבצים, הפעלת סוכנים וחישוב אנליטיקס.

---

## 🛠️ טכנולוגיות (Tech Stack)

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend (Node.js)**: Express Server עם אינטגרציית `@google/genai` (Gemini Flash).
- **Backend (Python Blueprint)**: FastAPI, SQLAlchemy 2.0 Async, Pydantic v2, PostgreSQL 16.
- **Testing & Sandbox Simulation**: GCC 11, Clang-Tidy, Valgrind Memcheck, OpenJDK, JUnit 5.

---

## 💻 התקנה והרצה מקומית (Local Setup)

```bash
# 1. שכפול המאגר
git clone https://github.com/YOUR_USERNAME/autota.git
cd autota

# 2. התקנת תלויות
npm install

# 3. הפעלת שרת הפיתוח
npm run dev
```

פתח את הדפדפן בכתובת: `http://localhost:3000`

---

## 📄 רישיון (License)

Apache License 2.0
