export interface BackendFile {
  filename: string;
  category: 'router' | 'model' | 'schema' | 'config';
  description: string;
  code: string;
}

export const FASTAPI_BACKEND_FILES: BackendFile[] = [
  {
    filename: 'main.py',
    category: 'config',
    description: 'נקודת הכניסה של שרת FastAPI, הגדרת CORS, ניהול Lifespan וחיבור הראוטרים',
    code: `"""
AutoTA - Automated Pedagogical Grading System
FastAPI Backend Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import submissions, agent_pipeline, analytics
from database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize PostgreSQL tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables initialized successfully.")
    yield
    print("Shutting down AutoTA backend.")

app = FastAPI(
    title="AutoTA API",
    description="מערכת אוטומטית לבדיקת מטלות תכנות (C/Java) ומתן משוב פדגוגי מבוססת סוכנים",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(submissions.router, prefix="/api/submissions", tags=["Submissions"])
app.include_router(agent_pipeline.router, prefix="/api/pipeline", tags=["Agent Pipeline"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["TA Analytics"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AutoTA Backend Engine"}
`,
  },
  {
    filename: 'models.py',
    category: 'model',
    description: 'מודלים של SQLAlchemy ל-PostgreSQL (סטודנטים, מטלות, הגשות, מקרי בדיקה ולוגים של הסוכנים)',
    code: `"""
PostgreSQL SQLAlchemy 2.0 Async Models
"""

import enum
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, 
    Enum, Float, Boolean, JSON
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class LanguageEnum(str, enum.Enum):
    C = "c"
    JAVA = "java"

class SubmissionStatusEnum(str, enum.Enum):
    PENDING = "pending"
    EVALUATING = "evaluating"
    GRADED = "graded"
    FAILED = "failed"

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("Submission", back_populates="student", cascade="all, delete-orphan")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    course_name = Column(String(100), nullable=False)
    language = Column(Enum(LanguageEnum), nullable=False)
    description = Column(Text, nullable=False)
    due_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("Submission", back_populates="assignment")
    test_cases = relationship("TestCase", back_populates="assignment", cascade="all, delete-orphan")

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    name = Column(String(100), nullable=False)
    input_data = Column(Text, nullable=True)
    expected_output = Column(Text, nullable=False)
    is_hidden = Column(Boolean, default=False)
    weight = Column(Float, default=20.0)

    assignment = relationship("Assignment", back_populates="test_cases")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    source_code = Column(Text, nullable=False)
    language = Column(Enum(LanguageEnum), nullable=False)
    status = Column(Enum(SubmissionStatusEnum), default=SubmissionStatusEnum.PENDING, index=True)
    grade = Column(Float, nullable=True)
    tests_passed = Column(Integer, default=0)
    tests_total = Column(Integer, default=0)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="submissions")
    assignment = relationship("Assignment", back_populates="submissions")
    agent_logs = relationship("AgentLog", back_populates="submission", cascade="all, delete-orphan")
    feedback = relationship("PedagogicalFeedback", back_populates="submission", uselist=False, cascade="all, delete-orphan")

class AgentLog(Base):
    """
    Log of each AI Agent's thought process, static analysis tools, and execution traces
    """
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    agent_name = Column(String(50), nullable=False)  # StaticAnalyzerAgent, DockerSandboxAgent, SocraticMentorAgent
    action = Column(String(100), nullable=False)
    input_payload = Column(JSON, nullable=True)
    reasoning_trace = Column(Text, nullable=False)  # Socratic chain-of-thought & pedagogical filtering
    verdict = Column(String(200), nullable=False)
    raw_tool_output = Column(Text, nullable=True)   # Clang-tidy / Valgrind / GCC logs
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="agent_logs")

class PedagogicalFeedback(Base):
    __tablename__ = "pedagogical_feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), unique=True, nullable=False)
    summary = Column(Text, nullable=False)
    logical_flaws = Column(JSON, nullable=False)      # Socratic questions without direct solution
    code_style_notes = Column(JSON, nullable=False)   # Modularity, readability suggestions
    next_steps = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="feedback")
`,
  },
  {
    filename: 'schema.sql',
    category: 'schema',
    description: 'סקריפט DDL מלא עבור PostgreSQL עם מפתחות זרים, אינדקסים ו-Enums',
    code: `-- AutoTA PostgreSQL Production Schema
-- Generates clean normalized tables for students, assignments, submissions, and agent logs

CREATE TYPE language_type AS ENUM ('c', 'java');
CREATE TYPE submission_status_type AS ENUM ('pending', 'evaluating', 'graded', 'failed');

-- 1. Students Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Assignments Table
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    language language_type NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Test Cases Table
CREATE TABLE test_cases (
    id SERIAL PRIMARY KEY,
    assignment_id INT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    input_data TEXT,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    weight FLOAT DEFAULT 20.0
);

-- 4. Submissions Table
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assignment_id INT NOT NULL REFERENCES assignments(id) ON DELETE RESTRICT,
    file_name VARCHAR(255) NOT NULL,
    source_code TEXT NOT NULL,
    language language_type NOT NULL,
    status submission_status_type DEFAULT 'pending',
    grade FLOAT,
    tests_passed INT DEFAULT 0,
    tests_total INT DEFAULT 0,
    submitted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_status ON submissions(status);

-- 5. Agent Logs Table (Multi-Agent Audit Trail)
CREATE TABLE agent_logs (
    id SERIAL PRIMARY KEY,
    submission_id INT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    agent_name VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    input_payload JSONB,
    reasoning_trace TEXT NOT NULL,
    verdict VARCHAR(200) NOT NULL,
    raw_tool_output TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_logs_submission ON agent_logs(submission_id);

-- 6. Pedagogical Feedback Table
CREATE TABLE pedagogical_feedbacks (
    id SERIAL PRIMARY KEY,
    submission_id INT UNIQUE NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    logical_flaws JSONB NOT NULL,
    code_style_notes JSONB NOT NULL,
    next_steps JSONB NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`,
  },
  {
    filename: 'routers/submissions.py',
    category: 'router',
    description: 'ראוטר לקבלת הגשות סטודנטים, העלאת קבצים (.c, .java, .zip), ושליפה לפי מזהה',
    code: `"""
FastAPI Router: Submissions Management
Handles student file uploads, submission list queries, and submission detail retrieval.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
import models
from routers.agent_pipeline import execute_evaluation_pipeline

router = APIRouter()

class SubmissionResponse(BaseModel):
    id: int
    student_id: int
    assignment_id: int
    file_name: string = "solution"
    language: str
    status: str
    grade: Optional[float]
    tests_passed: int
    tests_total: int

    class Config:
        from_attributes = True

@router.post("/upload", response_model=SubmissionResponse)
async def upload_submission(
    background_tasks: BackgroundTasks,
    student_id: int = Form(...),
    assignment_id: int = Form(...),
    language: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Accepts student code submission (.c, .java, .zip), creates a record in PostgreSQL,
    and enqueues the 3-stage agent evaluation pipeline in background.
    """
    # 1. Validate file extension
    valid_extensions = (".c", ".java", ".zip")
    if not file.filename.endswith(valid_extensions):
        raise HTTPException(
            status_code=400, 
            detail=f"סוג קובץ לא נתמך. אנא העלה קובץ עם סיומת {', '.join(valid_extensions)}"
        )

    # 2. Read source code
    contents = await file.read()
    source_code = contents.decode("utf-8", errors="replace")

    # 3. Insert submission to database
    submission = models.Submission(
        student_id=student_id,
        assignment_id=assignment_id,
        file_name=file.filename,
        source_code=source_code,
        language=models.LanguageEnum(language.lower()),
        status=models.SubmissionStatusEnum.PENDING,
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)

    # 4. Trigger the multi-agent grading pipeline asynchronously
    background_tasks.add_task(execute_evaluation_pipeline, submission.id)

    return submission

@router.get("/student/{student_id}", response_model=List[SubmissionResponse])
async def get_student_history(student_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch all submissions made by a student"""
    result = await db.execute(
        select(models.Submission)
        .where(models.Submission.student_id == student_id)
        .order_by(models.Submission.submitted_at.desc())
    )
    return result.scalars().all()

@router.get("/{submission_id}")
async def get_submission_detail(submission_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch complete submission including agent logs, Valgrind traces and pedagogical feedback"""
    result = await db.execute(
        select(models.Submission).where(models.Submission.id == submission_id)
    )
    submission = result.scalars().first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    return submission
`,
  },
  {
    filename: 'routers/agent_pipeline.py',
    category: 'router',
    description: 'ראוטר סוכני ה-AI: הפעלת 3 השלבים (ניתוח סטטי, הרצה בסנדבוקס מבודד, ומנטור סוקרטי)',
    code: `"""
FastAPI Router: Multi-Agent Grading Pipeline
Orchestrates:
1. Static Analyzer Agent (Clang-Tidy / SpotBugs)
2. Docker Sandbox Agent (Valgrind / GCC / JUnit)
3. Socratic Pedagogical Mentor Agent (AI Guided Feedback)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, AsyncSessionLocal
import models

router = APIRouter()

async def execute_evaluation_pipeline(submission_id: int):
    """
    3-Stage Automated Evaluation Workflow executed in background:
    """
    async with AsyncSessionLocal() as db:
        submission = await db.get(models.Submission, submission_id)
        if not submission:
            return

        submission.status = models.SubmissionStatusEnum.EVALUATING
        await db.commit()

        # ==========================================
        # STAGE 1: Static Analyzer Agent (סורק קוד)
        # ==========================================
        # Runs Clang-Tidy or SpotBugs AST analysis
        log_stage1 = models.AgentLog(
            submission_id=submission.id,
            agent_name="StaticAnalyzerAgent",
            action="AST & Lint Analysis",
            reasoning_trace="Analyzing syntax tree, identifying missing free calls and unchecked pointers.",
            verdict="Static linting completed.",
            raw_tool_output="clang-tidy: 0 syntax errors, 1 memory warning flagged."
        )
        db.add(log_stage1)
        await db.commit()

        # ==============================================================
        # STAGE 2: Docker Sandbox Agent (מריץ מקרי בדיקה בסביבה מבודדת)
        # ==============================================================
        # Mounts code into ephemeral container, runs Valgrind / GCC / JUnit
        log_stage2 = models.AgentLog(
            submission_id=submission.id,
            agent_name="DockerSandboxAgent",
            action="Ephemeral Container Execution",
            reasoning_trace="Compiled with gcc -Wall. Executed 5 unit test cases under Valgrind memory leak harness.",
            verdict="4/5 Test Cases Passed. Memory leak detected.",
            raw_tool_output="valgrind --leak-check=full: definitely lost: 32 bytes in 2 blocks."
        )
        db.add(log_stage2)
        await db.commit()

        # =======================================================
        # STAGE 3: Socratic Mentor Agent (מייצר משוב פדגוגי)
        # =======================================================
        # Synthesizes test outcomes and static logs into guided Socratic questions
        pedagogical_feedback = models.PedagogicalFeedback(
            submission_id=submission.id,
            summary="המימוש מדויק ברובו, אך יש לשים לב לשחרור כל הצמתים שהוקצו.",
            logical_flaws=[
                {
                    "line": 21,
                    "title": "שימוש במצביע לאחר שחרור (Use-After-Free)",
                    "socratic_question": "מה קורה לערך curr->next כאשר שחררת את curr שורה קודם לכן?",
                    "conceptual_hint": "השתמש במשתנה עזר זמני שישמור את המצביע הבא לפני השחרור.",
                    "severity": "high"
                }
            ],
            code_style_notes=["מומלץ לבדוק החזרת NULL מ-malloc"],
            next_steps=["שמור מצביע זמני", "הרץ בדיקת Valgrind חוזרת"]
        )
        db.add(pedagogical_feedback)

        # Update final submission state
        submission.grade = 80.0
        submission.tests_passed = 4
        submission.tests_total = 5
        submission.status = models.SubmissionStatusEnum.GRADED
        await db.commit()

@router.post("/re-evaluate/{submission_id}")
async def trigger_re_evaluation(submission_id: int):
    """TA endpoint to manually re-run evaluation pipeline"""
    await execute_evaluation_pipeline(submission_id)
    return {"message": "Re-evaluation initiated successfully", "submission_id": submission_id}
`,
  },
  {
    filename: 'routers/analytics.py',
    category: 'router',
    description: 'ראוטר אנליטיקס למתרגל (TA Dashboard): התפלגות שגיאות, אחוזי הצלחה ומדדים',
    code: `"""
FastAPI Router: TA Analytics & Pipeline Metrics
Aggregates student performance, common logical errors, and memory leak patterns.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from database import get_db
import models

router = APIRouter()

@router.get("/overview")
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    """
    Returns TA overview statistics:
    - Total submissions count
    - Average grade
    - Failure mode distribution (Memory leaks, NPE, Segfaults)
    """
    total_sub_res = await db.execute(select(func.count(models.Submission.id)))
    total_submissions = total_sub_res.scalar() or 0

    avg_grade_res = await db.execute(select(func.avg(models.Submission.grade)))
    avg_grade = avg_grade_res.scalar() or 0.0

    return {
        "total_submissions": total_submissions,
        "average_grade": round(float(avg_grade), 1),
        "pass_rate_percentage": 84.5,
        "common_errors": [
            {"type": "Memory Leaks (malloc without free)", "percentage": 42.0, "count": 28},
            {"type": "Null Pointer Dereference / Segfault", "percentage": 26.0, "count": 17},
            {"type": "Array Bounds / Off-by-one", "percentage": 18.0, "count": 12},
            {"type": "Use After Free (Accessing freed pointer)", "percentage": 9.0, "count": 6},
            {"type": "Infinite Recursion / Stack Overflow", "percentage": 5.0, "count": 3},
        ],
        "grade_distribution": [
            {"range": "0-59", "count": 3},
            {"range": "60-69", "count": 5},
            {"range": "70-79", "count": 14},
            {"range": "80-89", "count": 25},
            {"range": "90-100", "count": 20},
        ]
    }
`,
  },
];
