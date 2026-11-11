import { Assignment, AnalyticsData, Submission } from '../types/autota';

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-1',
    title: 'מטלה 1: רשימה מקושרת וניהול זיכרון ב-C',
    course: 'מבוא למערכות הפעלה ותכנות מערכות (89-210)',
    language: 'c',
    dueDate: '2026-11-20 23:59',
    description: 'מימוש רשימה מקושרת דינמית, הכנסה ממוינת, מחיקת איבר ושחרור מלא של כל הבלוקים שהוקצו. בדיקה מחמירה עם Valgrind לזליגות זיכרון.',
    keyTopics: ['Pointers & Structs', 'Dynamic Allocation (malloc/free)', 'Valgrind Hygiene', 'Pointer Manipulation'],
    sampleFiles: [
      {
        name: 'linked_list_with_leak.c',
        description: 'רשימה מקושרת עם שגיאת Use-After-Free וזליגת זיכרון',
        code: `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int val;
    struct Node* next;
} Node;

Node* create_node(int val) {
    Node* n = (Node*)malloc(sizeof(Node));
    if (!n) return NULL;
    n->val = val;
    n->next = NULL;
    return n;
}

void append(Node** head, int val) {
    Node* new_node = create_node(val);
    if (*head == NULL) {
        *head = new_node;
        return;
    }
    Node* curr = *head;
    while (curr->next != NULL) {
        curr = curr->next;
    }
    curr->next = new_node;
}

// BUGGY FUNCTION: Use after free & potential memory leak
void free_list(Node* head) {
    Node* curr = head;
    while (curr != NULL) {
        // שגיאה נפוצה: שחרור הזיכרון של curr לפני קריאת curr->next
        free(curr);
        curr = curr->next;
    }
}

int main() {
    Node* head = NULL;
    append(&head, 10);
    append(&head, 20);
    append(&head, 30);
    
    printf("List initialized successfully.\\n");
    free_list(head);
    return 0;
}
`,
      },
      {
        name: 'linked_list_perfect.c',
        description: 'פתרון תקני ומלא ללא זליגות זיכרון (100 נקודות)',
        code: `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int val;
    struct Node* next;
} Node;

Node* create_node(int val) {
    Node* n = (Node*)malloc(sizeof(Node));
    if (!n) return NULL;
    n->val = val;
    n->next = NULL;
    return n;
}

void append(Node** head, int val) {
    Node* new_node = create_node(val);
    if (!new_node) return;

    if (*head == NULL) {
        *head = new_node;
        return;
    }
    Node* curr = *head;
    while (curr->next != NULL) {
        curr = curr->next;
    }
    curr->next = new_node;
}

void free_list(Node* head) {
    Node* curr = head;
    while (curr != NULL) {
        Node* next_temp = curr->next;
        free(curr);
        curr = next_temp;
    }
}

int main() {
    Node* head = NULL;
    append(&head, 10);
    append(&head, 20);
    append(&head, 30);
    free_list(head);
    return 0;
}
`,
      },
    ],
  },
  {
    id: 'assign-2',
    title: 'מטלה 2: עץ חיפוש בינארי ו-Generics ב-Java',
    course: 'מבני נתונים ואלגוריתמים (89-120)',
    language: 'java',
    dueDate: '2026-11-25 23:59',
    description: 'מימוש עץ חיפוש בינארי גנרי (BST) התומך בהכנסה, חיפוש, מחיקה ומציאת גובה. בדיקות מקרי קצה עם עץ ריק ואיברים כפולים.',
    keyTopics: ['Generics <T extends Comparable<T>>', 'Binary Search Trees', 'Recursion & Base Cases', 'NullPointerException Safety'],
    sampleFiles: [
      {
        name: 'BinarySearchTree_Buggy.java',
        description: 'מימוש BST עם היעדר תנאי עצירה לחריגת NullPointerException',
        code: `public class BinarySearchTree<T extends Comparable<T>> {
    private class Node {
        T data;
        Node left;
        Node right;

        Node(T data) {
            this.data = data;
        }
    }

    private Node root;

    public void insert(T val) {
        root = insertRec(root, val);
    }

    private Node insertRec(Node current, T val) {
        if (current == null) {
            return new Node(val);
        }
        if (val.compareTo(current.data) < 0) {
            current.left = insertRec(current.left, val);
        } else if (val.compareTo(current.data) > 0) {
            current.right = insertRec(current.right, val);
        }
        return current;
    }

    public boolean contains(T val) {
        return containsRec(root, val);
    }

    // BUG: Missing check for current == null before calling compareTo!
    private boolean containsRec(Node current, T val) {
        // אם הצומת הוא null, השורה הבאה תזרוק NullPointerException!
        int cmp = val.compareTo(current.data);
        if (cmp == 0) return true;
        if (cmp < 0) return containsRec(current.left, val);
        return containsRec(current.right, val);
    }
}
`,
      },
      {
        name: 'BinarySearchTree_Fixed.java',
        description: 'מימוש BST תקין ועמיד למקרי קצה (100 נקודות)',
        code: `public class BinarySearchTree<T extends Comparable<T>> {
    private class Node {
        T data;
        Node left;
        Node right;

        Node(T data) {
            this.data = data;
        }
    }

    private Node root;

    public void insert(T val) {
        if (val == null) return;
        root = insertRec(root, val);
    }

    private Node insertRec(Node current, T val) {
        if (current == null) {
            return new Node(val);
        }
        int cmp = val.compareTo(current.data);
        if (cmp < 0) {
            current.left = insertRec(current.left, val);
        } else if (cmp > 0) {
            current.right = insertRec(current.right, val);
        }
        return current;
    }

    public boolean contains(T val) {
        if (val == null) return false;
        return containsRec(root, val);
    }

    private boolean containsRec(Node current, T val) {
        if (current == null) {
            return false;
        }
        int cmp = val.compareTo(current.data);
        if (cmp == 0) return true;
        return cmp < 0 ? containsRec(current.left, val) : containsRec(current.right, val);
    }
}
`,
      },
    ],
  },
  {
    id: 'assign-3',
    title: 'מטלה 3: מפענח פקודות Shell ומערכים דינמיים ב-C',
    course: 'מבוא למערכות הפעלה (89-310)',
    language: 'c',
    dueDate: '2026-12-05 23:59',
    description: 'בניית מיני-Shell המפענח פקודות משתמש עם fork() ו-execvp(), ניהול היסטוריה עם מערך דינמי שמוכפל בעת הצורך (Dynamic Array Realloc).',
    keyTopics: ['fork & execvp', 'realloc / buffer bounds', 'SIGINT handling', 'File Descriptors'],
    sampleFiles: [
      {
        name: 'mini_shell.c',
        description: 'שלד מפענח פקודות Shell עם בדיקת גבולות',
        code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_ARGS 16

char** parse_command(char* line) {
    char** args = (char**)malloc(MAX_ARGS * sizeof(char*));
    if (!args) return NULL;

    int i = 0;
    char* token = strtok(line, " \\t\\n");
    while (token != NULL && i < MAX_ARGS - 1) {
        args[i++] = token;
        token = strtok(NULL, " \\t\\n");
    }
    args[i] = NULL;
    return args;
}

int main() {
    char cmd[] = "ls -la /tmp";
    char** tokens = parse_command(cmd);
    if (tokens) {
        for (int i = 0; tokens[i] != NULL; i++) {
            printf("Arg[%d]: %s\\n", i, tokens[i]);
        }
        free(tokens);
    }
    return 0;
}
`,
      },
    ],
  },
  {
    id: 'assign-javafx',
    title: 'מטלה 4: יישום JavaFX - מטריצת קווי רשת ו-10% תאים רנדומליים (שאלה 2)',
    course: 'תכנות מונחה עצמים ו-JavaFX מתקדם (89-211)',
    language: 'java',
    dueDate: '2026-12-10 23:59',
    description: 'כתיבת יישום JavaFX מלא הכולל 3 מחלקות (MainApplication, Controller, Model) המציג Canvas עם קווי רשת במרווח 10px (כמו דף חשבון), כפתור בפינה השמאלית העליונה, ומילוי רנדומלי של בדיוק 10% מהתאים באמצעות GraphicsContext.fillRect.',
    keyTopics: ['JavaFX Application & Stage', 'Canvas & GraphicsContext', '10px Grid Math', 'Controller Event Handling', 'MVC Architecture', '10% Random Sampling'],
    isMultiFile: true,
    hasVisualSimulation: true,
    files: [
      {
        name: 'MainApplication.java',
        description: 'מחלקת כניסה (extends Application) המגדירה Stage, Scene ומטעינה את ה-Canvas וה-Controller',
        isMain: true,
        code: `package com.autota.javafx;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.canvas.Canvas;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

/**
 * שאלה 2: מחלקת כניסה ראשית ליישום JavaFX
 * מציגה חלון Application עם משטח Canvas וכפתור בפינה השמאלית העליונה
 */
public class MainApplication extends Application {
    private static final double DEFAULT_WIDTH = 400;
    private static final double DEFAULT_HEIGHT = 300;

    @Override
    public void start(Stage primaryStage) {
        BorderPane root = new BorderPane();
        
        // יצירת רכיב Canvas הממוקם בתוך חלון Application
        Canvas canvas = new Canvas(DEFAULT_WIDTH, DEFAULT_HEIGHT);
        
        // יצירת Controller ו-Model
        MatrixModel model = new MatrixModel();
        MatrixController controller = new MatrixController(canvas, model);
        
        // כפתור בפינה השמאלית העליונה
        Button randomizeBtn = new Button("סידור רנדומלי חדש (10%)");
        randomizeBtn.setOnAction(e -> controller.onRandomizeButtonClicked());
        
        VBox topBar = new VBox(8);
        topBar.setStyle("-fx-padding: 10; -fx-background-color: #f1f5f9;");
        topBar.getChildren().add(randomizeBtn);
        
        root.setTop(topBar);
        root.setCenter(canvas);
        
        // ציור ראשוני בעת עליית החלון
        controller.drawGridAndCells();
        
        // התאמה רספונסיבית לשינוי גודל החלון
        canvas.widthProperty().bind(root.widthProperty());
        canvas.heightProperty().bind(root.heightProperty().subtract(60));
        canvas.widthProperty().addListener((obs, oldV, newV) -> controller.drawGridAndCells());
        canvas.heightProperty().addListener((obs, oldV, newV) -> controller.drawGridAndCells());

        Scene scene = new Scene(root, DEFAULT_WIDTH + 20, DEFAULT_HEIGHT + 70);
        primaryStage.setTitle("שאלה 2: מטריצת JavaFX עם 10% משבצות רנדומליות");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
`,
      },
      {
        name: 'MatrixController.java',
        description: 'מחלקת Controller המגיבה ללחיצת הכפתור ומנהלת את הציור על ה-Canvas עם GraphicsContext',
        code: `package com.autota.javafx;

import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import java.util.List;

/**
 * Controller המנהל את תגובת הממשק ומצייר על גבי ה-Canvas
 */
public class MatrixController {
    public static final double GRID_STEP = 10.0; // מרווח מדויק של 10 פיקסלים (דף חשבון)
    
    private final Canvas canvas;
    private final MatrixModel model;

    public MatrixController(Canvas canvas, MatrixModel model) {
        this.canvas = canvas;
        this.model = model;
    }

    /**
     * מתודה המגיבה ללחיצת הכפתור בפינה השמאלית העליונה
     * בכל לחיצה יש להציג סידור רנדומלי חדש של התאים המלאים!
     */
    public void onRandomizeButtonClicked() {
        drawGridAndCells();
    }

    /**
     * ציור המטריצה והמשבצות המלאות
     */
    public void drawGridAndCells() {
        double width = canvas.getWidth();
        double height = canvas.getHeight();
        if (width <= 0 || height <= 0) return;

        GraphicsContext gc = canvas.getGraphicsContext2D();

        // 1. ניקוי משטח הציור לפני כל ציור מחדש
        gc.clearRect(0, 0, width, height);

        // רקע לבן דמוי דף חשבון
        gc.setFill(Color.WHITE);
        gc.fillRect(0, 0, width, height);

        int cols = (int) (width / GRID_STEP);
        int rows = (int) (height / GRID_STEP);

        // 2. מילוי רנדומלי של בדיוק 10% מהתאים (באמצעות Model)
        List<MatrixModel.CellCoordinate> filledCells = model.generateRandomCells(cols, rows, 0.10);

        gc.setFill(Color.web("#0f172a")); // צבע שחור/כהה לתאים מלאים
        for (MatrixModel.CellCoordinate cell : filledCells) {
            double x = cell.col() * GRID_STEP;
            double y = cell.row() * GRID_STEP;
            // מילוי ריבועים באמצעות המתודה fillRect של GraphicsContext!
            gc.fillRect(x, y, GRID_STEP, GRID_STEP);
        }

        // 3. ציור קווי המטריצה המתפרסים על פני כל משטח הציור
        gc.setStroke(Color.web("#94a3b8"));
        gc.setLineWidth(1.0);

        // קווים אנכיים עם מרווח של 10 פיקסלים
        for (double x = 0; x <= width; x += GRID_STEP) {
            gc.strokeLine(x, 0, x, height);
        }

        // קווים אופקיים עם מרווח של 10 פיקסלים
        for (double y = 0; y <= height; y += GRID_STEP) {
            gc.strokeLine(0, y, width, y);
        }
    }
}
`,
      },
      {
        name: 'MatrixModel.java',
        description: 'מחלקת Model המחשבת את סך התאים ומבצעת דגימה רנדומלית אחידה של בדיוק 10%',
        code: `package com.autota.javafx;

import java.util.*;

/**
 * מודל לוגי: חישוב מתמטי של מספר המשבצות ובחירה רנדומלית של 10% ללא חזרות
 */
public class MatrixModel {
    public record CellCoordinate(int col, int row) {}

    /**
     * מייצר רשימת קואורדינטות של בדיוק 10% מהתאים במטריצה
     * @param cols מספר העמודות
     * @param rows מספר השורות
     * @param ratio היחס (0.10 עבור 10%)
     */
    public List<CellCoordinate> generateRandomCells(int cols, int rows, double ratio) {
        int totalCells = cols * rows;
        if (totalCells <= 0) return Collections.emptyList();

        // חישוב מדויק של 10% מהתאים (נמנע משגיאת חלוקה בשלמים!)
        int targetFilled = (int) Math.round(totalCells * ratio);

        Set<Integer> selectedIndices = new HashSet<>();
        Random rng = new Random();

        // בחירת אינדקסים ייחודיים ללא כפילויות
        while (selectedIndices.size() < targetFilled && selectedIndices.size() < totalCells) {
            int randIndex = rng.nextInt(totalCells);
            selectedIndices.add(randIndex);
        }

        List<CellCoordinate> result = new ArrayList<>(selectedIndices.size());
        for (int idx : selectedIndices) {
            int col = idx % cols;
            int row = idx / cols;
            result.add(new CellCoordinate(col, row));
        }

        return result;
    }
}
`,
      },
    ],
    sampleFiles: [
      {
        name: 'JavaFX_Matrix_3Classes_Perfect.zip',
        description: 'פרויקט 3 מחלקות תקין ומלא (MainApplication, Controller, Model) - ציון 100',
        code: `// פרויקט JavaFX מלא הכולל 3 מחלקות: MainApplication.java, MatrixController.java, MatrixModel.java
// עומד בכל דרישות שאלה 2: מרווח 10px, מילוי 10% ב-fillRect, כפתור שמאל עליון, MVC מלא.`,
      },
      {
        name: 'JavaFX_Matrix_Buggy_IntegerDivision.zip',
        description: 'פרויקט עם באגים: שגיאת 10/100 בשלמים (0 תאים מלאים) והיעדר clearRect',
        code: `// באג נפוץ במטלה 2:
// int filled = (10 / 100) * total; // מחזיר תמיד 0 ב-Java!
// חסרה קריאה ל-gc.clearRect() ולכן המשבצות מצטברות מעבר ל-10% בכל לחיצה.`,
      },
    ],
  },
];

export const INITIAL_ANALYTICS: AnalyticsData = {
  totalSubmissions: 67,
  averageGrade: 83.4,
  passRate: 88.1,
  commonErrors: [
    { type: 'Memory Leaks (malloc without free)', percentage: 42, count: 28, color: '#f59e0b' },
    { type: 'Null Pointer Dereference / Segfault', percentage: 26, count: 17, color: '#ef4444' },
    { type: 'Array Bounds / Off-by-one', percentage: 18, count: 12, color: '#06b6d4' },
    { type: 'Use After Free (Freed pointer dereference)', percentage: 9, count: 6, color: '#8b5cf6' },
    { type: 'Deadlock / Unclosed File Descriptor', percentage: 5, count: 4, color: '#10b981' },
  ],
  gradeDistribution: [
    { range: '0-59 (נכשל)', count: 4 },
    { range: '60-69 (מספיק)', count: 6 },
    { range: '70-79 (טוב)', count: 15 },
    { range: '80-89 (טוב מאוד)', count: 24 },
    { range: '90-100 (מצוין)', count: 18 },
  ],
  recentActivity: [
    { id: 'act-1', studentName: 'יונתן כהן', action: 'הגיש מטלה 1 (C)', time: 'לפני 15 דקות', grade: 75 },
    { id: 'act-2', studentName: 'מאיה לוי', action: 'הגישה מטלה 2 (Java)', time: 'לפני 42 דקות', grade: 82 },
    { id: 'act-3', studentName: 'דניאל אברמוב', action: 'הגיש מטלה 1 (C)', time: 'לפני שעה', grade: 100 },
    { id: 'act-4', studentName: 'שירה רובל', action: 'הגישה מטלה 4 (JavaFX)', time: 'לפני שעתיים', grade: 100 },
    { id: 'act-5', studentName: 'עמית שפירא', action: 'הגיש מטלה 1 (C)', time: 'לפני 3 שעות', grade: 68 },
  ],
};

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-101',
    studentName: 'יונתן כהן',
    studentId: '318942105',
    assignmentId: 'assign-1',
    assignmentTitle: 'מטלה 1: רשימה מקושרת וניהול זיכרון ב-C',
    language: 'c',
    fileName: 'linked_list.c',
    code: `#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Node {\n    int val;\n    struct Node* next;\n} Node;\n\nNode* create_node(int val) {\n    Node* n = (Node*)malloc(sizeof(Node));\n    n->val = val;\n    n->next = NULL;\n    return n;\n}\n\nvoid free_list(Node* head) {\n    Node* curr = head;\n    while (curr != NULL) {\n        // BUG: Accessing curr->next after free(curr)\n        free(curr);\n        curr = curr->next;\n    }\n}`,
    submittedAt: '2026-11-11 11:20',
    status: 'graded',
    grade: 75,
    testPassed: 4,
    testTotal: 5,
    staticAnalysis: {
      warningsCount: 2,
      errorsCount: 0,
      rawOutput: "clang-tidy:\nlinked_list.c:21:9: warning: Use of memory after it is freed [clang-analyzer-cplusplus.NewDelete]\n        curr = curr->next;\n        ^",
    },
    compilerOutput: {
      command: 'gcc -Wall -Wextra -std=c11 -O2 linked_list.c -o solution',
      exitCode: 0,
      stdout: 'Compiled with 0 errors.',
      stderr: 'linked_list.c: In function ‘free_list’:\nlinked_list.c:20:9: warning: ‘curr’ is used after being freed',
    },
    valgrindOutput: {
      leaksDetected: true,
      bytesLeaked: 32,
      rawOutput: '==14298== HEAP SUMMARY:\n==14298==     in use at exit: 32 bytes in 2 blocks\n==14298==   total heap allocs: 5, frees: 3\n==14298== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)\n==14298== Invalid read of size 8\n==14298==    at 0x401189: free_list (linked_list.c:21)',
    },
    pedagogicalFeedback: {
      summary: 'המימוש הכללי של הרשימה המקושרת בנוי בצורה נקייה ומודולרית. עם זאת, התגלתה בעיה מהותית בשחרור הזיכרון (Use-After-Free).',
      logicalFlaws: [
        {
          line: 21,
          title: 'שימוש במצביע לאחר שחרור (Use After Free)',
          socraticQuestion: 'אם קראת ל-free(curr) בשורה 20, מה קורה לתוכן שעליו curr מצביע בשורה 21 כשאתה ניגש ל-curr->next?',
          conceptualHint: 'חשוב כיצד לשמור עותק זמני של המצביע לאיבר הבא לפני שמשחררים את הצומת הנוכחי.',
          severity: 'high',
        },
      ],
      codeStyleNotes: [
        'הגדרת ה-struct Node תקינה וברורה.',
        'מומלץ לבדוק האם malloc החזיר NULL לפני השמה לשדות הצומת.',
      ],
      nextSteps: [
        'שמור משתנה עזר Node* next_node לפני שחרור הצומת.',
        'הרץ את הבדיקה שוב ושים לב האם Valgrind מדווח על 0 שגיאות.',
      ],
    },
    agentLogs: [
      {
        agentName: 'StaticAnalyzerAgent',
        timestamp: '11:20:04',
        action: 'Clang-Tidy Scan',
        reasoning: 'זיהוי אזהרת שימוש בזיכרון משוחרר בשורות 20-21.',
        verdict: 'Warning flag detected: Use-After-Free',
      },
      {
        agentName: 'DockerSandboxAgent',
        timestamp: '11:20:08',
        action: 'Execute Valgrind & Unit Tests',
        reasoning: 'טסט 5 נכשל עקב גישה לא חוקית לזיכרון (SIGSEGV בתנאי קצה).',
        verdict: '4/5 Tests Passed. Memory leak detected.',
      },
      {
        agentName: 'SocraticMentorAgent',
        timestamp: '11:20:12',
        action: 'Pedagogical Synthesis',
        reasoning: 'הסוכן זיהה את התיקון הנדרש אך מחיל מסנן פדגוגי: אין לספק את הקוד המתקן אלא להציג שאלת הכוונה על סדר הפעולות.',
        verdict: 'Generated Socratic hint without revealing solution code.',
      },
    ],
  },
  {
    id: 'sub-102',
    studentName: 'שירה רובל',
    studentId: '318942109',
    assignmentId: 'assign-javafx',
    assignmentTitle: 'מטלה 4: יישום JavaFX (שאלה 2)',
    language: 'java',
    fileName: 'MainApplication.java',
    code: `// פרויקט JavaFX מלא הכולל 3 מחלקות: MainApplication.java, MatrixController.java, MatrixModel.java
// עומד בכל דרישות שאלה 2: מרווח 10px, מילוי 10% ב-fillRect, כפתור שמאל עליון, MVC מלא.`,
    submittedAt: '2026-11-11 12:45',
    status: 'graded',
    grade: 100,
    testPassed: 6,
    testTotal: 6,
    staticAnalysis: {
      warningsCount: 0,
      errorsCount: 0,
      rawOutput: 'SpotBugs & CheckStyle: 0 warnings. Architecture clean.',
    },
    compilerOutput: {
      command: 'javac -Xlint:all MainApplication.java MatrixController.java MatrixModel.java',
      exitCode: 0,
      stdout: 'JavaFX compilation succeeded.',
      stderr: '',
    },
    valgrindOutput: {
      leaksDetected: false,
      bytesLeaked: 0,
      rawOutput: 'JVM Garbage Collector healthy. 0 leaks.',
    },
    pedagogicalFeedback: {
      summary: 'עבודה מעולה! יישום ה-JavaFX עומד באופן מושלם בכל דרישות שאלה 2: מרווח קווים 10px, מילוי 10% ב-fillRect, כפתור עליון שמאל וחלוקת MVC ל-3 מחלקות.',
      logicalFlaws: [],
      codeStyleNotes: [
        'הפרדת אחריות מופתית בין Model, Controller ו-Application.',
        'שימוש מעולה ב-HashSet למניעת כפילויות תאים ב-O(1).',
      ],
      nextSteps: ['הפרויקט מושלם ומוכן להגשה סופית!'],
    },
    agentLogs: [
      {
        agentName: 'ArchitectureAgent',
        timestamp: '12:45:01',
        action: 'MVC Pattern Decoupling Audit',
        reasoning: 'חלוקה נקייה ל-3 מחלקות נפרדות.',
        verdict: 'MVC Architecture Clean',
      },
      {
        agentName: 'CanvasGridAgent',
        timestamp: '12:45:03',
        action: '10px Grid Step & GraphicsContext Verification',
        reasoning: 'מרווח 10px נמדד במדויק וקריאה ל-fillRect תקינה.',
        verdict: '10px Grid Spacing Verified',
      },
      {
        agentName: 'RandomDistributionAgent',
        timestamp: '12:45:05',
        action: '10% Cell Ratio Uniformity Check',
        reasoning: 'בדיקת כיסוי מדויק של 10% ללא כפילויות.',
        verdict: 'Passed (Exact 10% Fill)',
      },
      {
        agentName: 'EventThreadAgent',
        timestamp: '12:45:07',
        action: 'Top-Left Button Event Dispatch Audit',
        reasoning: 'אימות כפתור שמאל עליון ותגובתיות בלחיצה.',
        verdict: 'Event Handler Validated',
      },
      {
        agentName: 'EdgeCaseStressAgent',
        timestamp: '12:45:09',
        action: 'Canvas Resize & Stress Testing Simulation',
        reasoning: 'הקוד שורד שינויי גודל דינמיים של הקנבס ולחיצות מהירות ברצף.',
        verdict: 'Passed All 8 Edge Cases',
      },
      {
        agentName: 'SocraticMentorAgent',
        timestamp: '12:45:11',
        action: 'Pedagogical Socratic Feedback Synthesis',
        reasoning: 'ניסוח חיזוק חיובי על עבודה אקדמית למופת.',
        verdict: 'Final Grade: 100/100',
      },
    ],
  },
  {
    id: 'sub-103',
    studentName: 'מאיה לוי',
    studentId: '209384712',
    assignmentId: 'assign-2',
    assignmentTitle: 'מטלה 2: עץ חיפוש בינארי ו-Generics ב-Java',
    language: 'java',
    fileName: 'BinarySearchTree.java',
    code: `public class BinarySearchTree<T extends Comparable<T>> { ... }`,
    submittedAt: '2026-11-11 10:15',
    status: 'graded',
    grade: 82,
    testPassed: 4,
    testTotal: 5,
    staticAnalysis: {
      warningsCount: 1,
      errorsCount: 0,
      rawOutput: 'SpotBugs: Potential Null Dereference in recursion.',
    },
    compilerOutput: {
      command: 'javac -Xlint:all BinarySearchTree.java',
      exitCode: 0,
      stdout: 'Compiled.',
      stderr: '',
    },
    valgrindOutput: {
      leaksDetected: false,
      bytesLeaked: 0,
      rawOutput: 'JVM Managed memory.',
    },
    pedagogicalFeedback: {
      summary: 'העץ הבינארי הגנרי ממומש היטב, אך חסר תנאי עצירה למניעת NullPointerException בעלים ריקים.',
      logicalFlaws: [
        {
          line: 18,
          title: 'חריגת NullPointerException אפשרית ברקורסיה',
          socraticQuestion: 'מה קורה לפונקציה הרקורסיבית כשמגיעים לצומת null בעץ?',
          conceptualHint: 'יש להוסיף בדיקת current == null בראש המתודה.',
          severity: 'high',
        },
      ],
      codeStyleNotes: ['שימוש מעולה ב-Generics ו-Comparable.'],
      nextSteps: ['הוסף בדיקת null בראש הפונקציה.'],
    },
    agentLogs: [
      {
        agentName: 'StaticAnalyzerAgent',
        timestamp: '10:15:02',
        action: 'SpotBugs Scan',
        reasoning: 'חריגת NPE פוטנציאלית.',
        verdict: 'Flagged NPE',
      },
      {
        agentName: 'DockerSandboxAgent',
        timestamp: '10:15:05',
        action: 'JUnit 5 Run',
        reasoning: 'טסט 4 זרק NPE בחיפוש עלים ריקים.',
        verdict: '4/5 Tests Passed',
      },
      {
        agentName: 'SocraticMentorAgent',
        timestamp: '10:15:08',
        action: 'Mentor Guidance',
        reasoning: 'הכוונה לבדיקת תנאי עצירה.',
        verdict: 'Hint dispatched',
      },
    ],
  },
  {
    id: 'sub-104',
    studentName: 'דניאל אברמוב',
    studentId: '324195821',
    assignmentId: 'assign-1',
    assignmentTitle: 'מטלה 1: רשימה מקושרת וניהול זיכרון ב-C',
    language: 'c',
    fileName: 'linked_list_perfect.c',
    code: `// פתרון מלא ללא זליגות זיכרון`,
    submittedAt: '2026-11-11 09:30',
    status: 'graded',
    grade: 100,
    testPassed: 5,
    testTotal: 5,
    staticAnalysis: {
      warningsCount: 0,
      errorsCount: 0,
      rawOutput: 'Clang-Tidy: 0 warnings.',
    },
    compilerOutput: {
      command: 'gcc -Wall -Wextra linked_list_perfect.c -o solution',
      exitCode: 0,
      stdout: 'Compiled.',
      stderr: '',
    },
    valgrindOutput: {
      leaksDetected: false,
      bytesLeaked: 0,
      rawOutput: '==18920== All heap blocks were freed -- no leaks are possible (0 errors)',
    },
    pedagogicalFeedback: {
      summary: 'פתרון מושלם ללא שום זליגת זיכרון!',
      logicalFlaws: [],
      codeStyleNotes: ['קוד אלגנטי, שמירת next_node לפני free תקינה לחלוטין.'],
      nextSteps: ['ציון 100 מושלם!'],
    },
    agentLogs: [
      {
        agentName: 'StaticAnalyzerAgent',
        timestamp: '09:30:02',
        action: 'Clang Scan',
        reasoning: 'נקי מאזהרות.',
        verdict: 'Clean',
      },
      {
        agentName: 'DockerSandboxAgent',
        timestamp: '09:30:05',
        action: 'Valgrind Check',
        reasoning: '0 leaks detected.',
        verdict: '5/5 Passed',
      },
      {
        agentName: 'SocraticMentorAgent',
        timestamp: '09:30:08',
        action: 'Final Grade',
        reasoning: 'ציון 100.',
        verdict: 'Perfect',
      },
    ],
  },
  {
    id: 'sub-105',
    studentName: 'נועם פרידמן',
    studentId: '314589201',
    assignmentId: 'assign-javafx',
    assignmentTitle: 'מטלה 4: יישום JavaFX (שאלה 2)',
    language: 'java',
    fileName: 'MatrixController.java',
    code: `// int filled = (10 / 100) * total; // מחזיר 0 תאים בגלל חלוקת שלמים!`,
    submittedAt: '2026-11-11 08:10',
    status: 'graded',
    grade: 65,
    testPassed: 3,
    testTotal: 6,
    staticAnalysis: {
      warningsCount: 2,
      errorsCount: 0,
      rawOutput: 'SpotBugs: Integer division result cast to double/used in calculation.',
    },
    compilerOutput: {
      command: 'javac -Xlint:all MatrixController.java',
      exitCode: 0,
      stdout: 'Compiled.',
      stderr: '',
    },
    valgrindOutput: {
      leaksDetected: false,
      bytesLeaked: 0,
      rawOutput: 'JVM Managed memory.',
    },
    pedagogicalFeedback: {
      summary: 'זוהתה שגיאת חלוקה בשלמים בחישוב 10% משבצות (10/100=0), מה שגורם לכך שלא נצבעים תאים כלל.',
      logicalFlaws: [
        {
          line: 38,
          title: 'שגיאת חלוקה בשלמים (Integer Division)',
          socraticQuestion: 'מה התוצאה של 10 / 100 ב-Java כאשר שני המספרים מטיפוס int?',
          conceptualHint: 'השתמש ב-0.10 או ב-10.0 כדי לאפס חלוקה ממשית.',
          severity: 'high',
        },
      ],
      codeStyleNotes: ['יש להוסיף clearRect לניקוי הקנבס לפני ציור.'],
      nextSteps: ['תקן את חישוב האחוזים ל-double.'],
    },
    agentLogs: [
      {
        agentName: 'RandomDistributionAgent',
        timestamp: '08:10:04',
        action: 'Ratio Check',
        reasoning: '0 תאים נצבעו במקום 10%.',
        verdict: 'Failed 10% Ratio',
      },
      {
        agentName: 'CanvasGridAgent',
        timestamp: '08:10:06',
        action: 'Grid Check',
        reasoning: 'מרווח 10px תקין.',
        verdict: 'Passed',
      },
      {
        agentName: 'SocraticMentorAgent',
        timestamp: '08:10:09',
        action: 'Guidance',
        reasoning: 'שאלה מנחה על חלוקת שלמים.',
        verdict: 'Hint Dispatched',
      },
    ],
  },
];
