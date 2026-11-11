export type Language = 'c' | 'java';

export type SubmissionStatus = 'pending' | 'evaluating' | 'graded';

export interface LogicalFlaw {
  line?: number;
  title: string;
  socraticQuestion: string;
  conceptualHint: string;
  severity: 'high' | 'medium' | 'low';
}

export interface PedagogicalFeedback {
  summary: string;
  logicalFlaws: LogicalFlaw[];
  codeStyleNotes: string[];
  nextSteps: string[];
}

export interface AgentLogEntry {
  agentName: 'StaticAnalyzerAgent' | 'DockerSandboxAgent' | 'SocraticMentorAgent';
  timestamp: string;
  action: string;
  reasoning: string;
  verdict: string;
}

export interface Submission {
  id: string;
  studentName: string;
  studentId: string;
  assignmentId: string;
  assignmentTitle: string;
  language: Language;
  fileName: string;
  code: string;
  submittedAt: string;
  status: SubmissionStatus;
  grade: number;
  testPassed: number;
  testTotal: number;
  staticAnalysis: {
    warningsCount: number;
    errorsCount: number;
    rawOutput: string;
  };
  compilerOutput: {
    command: string;
    exitCode: number;
    stdout: string;
    stderr: string;
  };
  valgrindOutput: {
    leaksDetected: boolean;
    bytesLeaked: number;
    rawOutput: string;
  };
  pedagogicalFeedback: PedagogicalFeedback;
  agentLogs: AgentLogEntry[];
}

export interface Assignment {
  id: string;
  title: string;
  course: string;
  language: Language;
  dueDate: string;
  description: string;
  keyTopics: string[];
  sampleFiles: {
    name: string;
    description: string;
    code: string;
  }[];
}

export interface PipelineStep {
  id: 1 | 2 | 3;
  name: string;
  subtitle: string;
  agentName: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  details: string;
}

export interface AnalyticsData {
  totalSubmissions: number;
  averageGrade: number;
  passRate: number;
  commonErrors: {
    type: string;
    percentage: number;
    count: number;
    color: string;
  }[];
  gradeDistribution: {
    range: string;
    count: number;
  }[];
  recentActivity: {
    id: string;
    studentName: string;
    action: string;
    time: string;
    grade?: number;
  }[];
}

export interface PlagiarismPair {
  id: string;
  studentA: { name: string; id: string; submissionId: string };
  studentB: { name: string; id: string; submissionId: string };
  similarityScore: number; // percentage, e.g. 89%
  aiGeneratedProbability: number; // e.g. 78% ChatGPT/Copilot probability
  matchedLinesCount: number;
  assignmentTitle: string;
  detectionDetails: string;
  codeSnippetA: string;
  codeSnippetB: string;
  verdict: 'flagged' | 'suspicious' | 'clean';
}

export interface ExamSession {
  isActive: boolean;
  timeRemainingSeconds: number;
  totalDurationSeconds: number;
  examTitle: string;
  studentId: string;
  isLocked: boolean;
}

export interface RunnerResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryPeakKb: number;
  status: 'success' | 'runtime_error' | 'timeout';
}

