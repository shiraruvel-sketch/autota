# 🎓 AutoTA - AI Pedagogical Code Grader & Multi-Agent Swarm

> **פלטפורמת Full-Stack אקדמית מתקדמת לבדיקת מטלות תכנות (C / Java), הדמיית יישומי JavaFX, ומתן משוב פדגוגי סוקרטי מבוסס צי של 6 סוכני AI.**

AutoTA היא פלטפורמה אקדמית לבדיקה, הערכה וניטור של מטלות תכנות, פרויקטים מרובי-מחלקות ומבחנים מקוונים.  
במקום להחזיר רק הודעת שגיאה טכנית יבשה, המערכת מפעילה ארכיטקטורה מקבילית של **6 סוכני AI עצמאיים** המייצרים **משוב סוקרטי מנחה** שמלמד את הסטודנט להבין את הטעות בעצמו ללא חשיפת פתרון ישיר.

🌐 **אתר פעיל וחי (Production):** [AutoTA on Vercel](https://autota-er5mrrms3-shira-8770s-projects.vercel.app)

---

## 🚀 תכונות ויכולות מרכזיות (Key Features)

### 1. ☕ תמיכה בפרויקטי JavaFX מרובי-מחלקות (3 Classes MVC)
- **סרגל טאבים למחלקות:** תמיכה מלאה בפרויקטים מורכבים עם מעבר ועריכה חיה בין:
  - `MainApplication.java` (extends Application, Stage & Scene setup)
  - `MatrixController.java` (Canvas, GraphicsContext, strokeLine, fillRect & Event Handling)
  - `MatrixModel.java` (Logic & 10% Uniform Random Sampling)
- **הורדת פרויקט מוכן ל-IntelliJ IDEA (.zip):** ייצוא מלא בלחיצת כפתור אחת כולל קובץ `pom.xml` (Maven) ו-JavaFX 21 מוכן להרצה מיידית.

### 2. 🎨 סימולטור JavaFX חי ואינטראקטיבי בדפדפן (Visual Canvas Simulator)
- **הדמיית קנבס מדויקת (שאלה 2):** קווי רשת במרווח של 10 פיקסלים (דף חשבון).
- **כפתור עליון בפינה השמאלית:** לחיצה עליו מפעילה את ה-Controller ומערבבת מחדש בדיוק 10% משבצות רנדומליות באמצעות `GraphicsContext.fillRect`.
- **טלמטריה מתמטית בזמן אמת:** סך המשבצות, אחוז הכיסוי המדויק, מונה לחיצות ובוחן באגים מובנה (זיהוי שגיאת חלוקת שלמים `10/100=0` או חוסר ב-`clearRect`).

### 3. 🤖 צי מורחב של 6 סוכני AI עצמאיים (6-Agent Autonomous Swarm)
בכל הגשה מופעל תהליך מקבילי של 6 סוכנים:
1. 🏛️ **ArchitectureAgent:** בודק הפרדת רשויות ב-MVC (Application, Controller, Model).
2. 📏 **CanvasGridAgent:** מאמת מרווח קווי רשת בדיוק 10.0px ושימוש ב-`strokeLine` ו-`fillRect`.
3. 🎲 **RandomDistributionAgent:** מוודא דגימה של בדיוק 10% מהתאים ללא כפילויות.
4. ⚡ **EventThreadAgent:** בודק תגובתיות כפתור עליון ב-JavaFX Application Thread.
5. 🧪 **EdgeCaseStressAgent:** מריץ סימולציות קיצון (גדלי מסך 0x0, עיוותי יחס גובה-רוחב, לחיצות מהירות).
6. 🎓 **SocraticMentorAgent:** מסנתז את ממצאי כל הסוכנים למשוב פדגוגי מעצים ללא גילוי ישיר של הקוד.

### 4. 📈 מנתח סיבוכיות גרפי Big-O אינטראקטיבי (Complexity Visualizer)
- השוואת עקומות סיבוכיות ויזואליות: $O(1)$, $O(\log N)$, $O(N)$, $O(N \log N)$ ו-$O(N^2)$.
- סליידר דינמי לגודל הקלט $N$ עם חישוב מספר הפעולות בזמן אמת.
- ניתוח סיבוכיות מקום Stack מול Heap והמלצות אופטימיזציה אלגוריתמיות של ה-AI.

### 5. 🎙️ מנטור סוקרטי קולי (Voice AI Socratic Mentor)
- **Text-to-Speech:** האזנה קולית טבעית למשוב המנטור ולשאלות המנחות עם אנימציית גלי קול.
- **Speech-to-Text:** שאילת שאלות בקול באמצעות מיקרופון ותמלול ישיר לצ'אט הסוקרטי.

### 6. 👥 מרכז ביקורת עמיתים אנונימית (Double-Blind Peer Review)
- צפייה וביקורת קוד של סטודנטים אחרים תחת חיסיון שמות ות"ז מוחלט.
- מערכת הערות שורה עם הדרכת AI למשוב בונה והצבעות "עזר לי".

### 7. 🧪 מעבדת בדיקות יחידה אישית (JUnit 5 Test Suite Playground)
- הגדרת מקרי קיצון מותאמים אישית (גדלי קנבס קיצוניים, יחסי מילוי 5%-50%).
- הרצת סוויטת Assertions מבודדת ומדידת זמן ביצוע במילי-שניות (Latency).

### 8. 🏆 מרכז הישגים ותגים אקדמיים (Academic Mastery Badges)
- תגי הישג: "שריון Valgrind", "מאסטר JavaFX & MVC", "צייד מקרי קצה", "חסין NullPointer".
- מעקב רצף למידה יומי (Study Streak).

### 9. 🔍 זיהוי פלגיאט ודמיון קוד (MOSS & AI Detector)
- אלגוריתם השוואת עצי תחביר AST בין הגשות סטודנטים.
- זיהוי קוד שנכתב ע"י מודלי שפה (ChatGPT / Copilot) עם תצוגת Side-by-Side Diff.

### 10. 📝 מערכת מבחנים מתוזמנת ומפוקחת (Timed Exam Screen)
- בחירת מבחנים לפי מקצועות: מערכות הפעלה ב-C, מבני נתונים ב-Java, ארכיטקטורת מחשבים.
- שעון עצר רץ לאחור (90 דקות), השגחה לזיהוי עזיבת חלון הבחינה (Proctor Alerts) ושקלול ציון מיידי.

---

## 🛠️ טכנולוגיות (Tech Stack)

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion, JSZip.
- **Backend (Node.js):** Express Server עם אינטגרציית `@google/genai` (Gemini Flash).
- **Backend Blueprint (Python):** FastAPI, SQLAlchemy 2.0 Async, Pydantic v2, PostgreSQL 16.
- **Simulators & Compilers:** GCC 11, Clang-Tidy, Valgrind Memcheck, JavaFX 21, OpenJDK, JUnit 5.
- **Deployment:** Vercel (CI/CD Pipeline מחובר ישירות ל-GitHub).

---

## 💻 התקנה והרצה מקומית (Local Setup)

```bash
# 1. שכפול המאגר מ-GitHub
git clone https://github.com/shiraruvel-sketch/autota.git
cd autota

# 2. התקנת כל התלויות
npm install

# 3. הפעלת שרת הפיתוח
npm run dev
```

האפליקציה תיפתח בדפדפן בכתובת: `http://localhost:3000`

---

## 📄 רישיון (License)

Apache License 2.0
