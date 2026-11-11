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
    { id: 'act-4', studentName: 'שירה רז', action: 'הגישה מטלה 2 (Java)', time: 'לפני שעתיים', grade: 91 },
    { id: 'act-5', studentName: 'עמית שפירא', action: 'הגיש מטלה 1 (C)', time: 'לפני 3 שעות', grade: 68 },
  ],
};
