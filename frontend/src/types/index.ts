export type Role = 'user' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
  bio: string;
  targetRole: string;
  isEmailVerified: boolean;
  stats: {
    totalInterviews: number;
    averageScore: number;
    completionRate: number;
    strongTopics: string[];
    weakTopics: string[];
  };
  createdAt: string;
}

export type InterviewCategory =
  | 'HR'
  | 'Technical'
  | 'DSA'
  | 'Behavioral'
  | 'System Design'
  | 'Mixed'
  | 'Company-specific'
  | 'OOP'
  | 'DBMS'
  | 'OS'
  | 'CN'
  | 'Resume Based';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Adaptive';
export type InterviewMode = 'Voice' | 'Text' | 'Camera';
export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'abandoned';
export type InterviewType =
  | 'standard'
  | 'coding'
  | 'system_design'
  | 'behavioral'
  | 'comprehensive'
  | 'live_ai';

export type InterviewerPersona =
  | 'Professional'
  | 'Conversational'
  | 'Technical'
  | 'Strict'
  | 'HR';

export type SessionState =
  | 'SETUP'
  | 'LOBBY'
  | 'ACTIVE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'ASKING_NEXT'
  | 'SUBMITTING'
  | 'EVALUATING'
  | 'COMPLETED'
  | 'ABANDONED';

export interface TestCase {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  isHidden?: boolean;
  explanation?: string;
  passed?: boolean;
}

export interface ExecutionResults {
  passed: boolean;
  testsPassed: number;
  totalTests: number;
  runtimeMs: number;
  stdout: string;
  stderr: string;
  testResults?: {
    testIndex: number;
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    isHidden: boolean;
  }[];
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  isOptimal: boolean;
  correctness?: string;
  codeQuality?: string;
  optimizationChallenge?: string;
  suggestions: string[];
}

export interface ConversationTurn {
  sender: 'interviewer' | 'candidate';
  message: string;
  timestamp: string | Date;
}

export interface Question {
  _id: string;
  interview: string;
  order: number;
  spokenIntro?: string;
  text: string;
  topic: string;
  difficulty: Difficulty;
  questionType?: 'conceptual' | 'cross_question' | 'deep_dive' | 'coding' | 'scenario' | 'system_design';
  claimChallenged?: string;
  hints: string[];
  expectedAnswer: string;
  idealAnswerConcepts?: string[];
  idealAnswerStructure?: string;
  starterCode?: string;
  codeLanguage?: string;
  testCases?: TestCase[];
  candidateCode?: string;
  executionResults?: ExecutionResults;
  complexityAnalysis?: ComplexityAnalysis;
  turns?: ConversationTurn[];
  followUpQuestions: string[];
  userAnswer: string;
  timeTakenSeconds: number;
  evaluation?: {
    score: number;
    correctnessScore?: number;
    depthScore?: number;
    communicationScore?: number;
    confidence: number;
    communication: number;
    technicalAccuracy: number;
    problemSolving: number;
    dsaScore?: number;
    codeQualityScore?: number;
    feedback: string;
    strengths?: string[];
    weaknesses?: string[];
    improvementSuggestions: string[];
  };
  isBookmarked: boolean;
  isFavorite: boolean;
}

export interface JobProfile {
  _id: string;
  title: string;
  company: string;
  experienceLevel: string;
  rawText: string;
  extracted: {
    requiredSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
    technologies: string[];
    domain: string;
    roleExpectations: string[];
  };
  matchAnalysis?: {
    matchedSkills: string[];
    missingSkills: string[];
    criticalGaps?: string[];
    matchScore: number;
    recommendations: string[];
  };
  createdAt: string;
}

export interface IntegritySignals {
  tabSwitches: number;
  focusLoss: number;
  copyEvents: number;
  status: 'Normal' | 'Review Recommended' | 'Irregular';
  events?: { type: string; timestamp: Date; detail?: string }[];
}

export interface Interview {
  _id: string;
  category: InterviewCategory;
  topic: string;
  difficulty: Difficulty;
  numQuestions: number;
  mode: InterviewMode;
  interviewType: InterviewType;
  interviewerPersona?: InterviewerPersona;
  durationMinutes?: number;
  sessionState?: SessionState;
  candidatePerformanceScore?: number;
  isLiveInterview?: boolean;
  experienceLevel?: 'Junior' | 'Mid-Level' | 'Senior' | 'Staff / Lead';
  preferredSkill?: string;
  targetRole?: string;
  company: string;
  resume?: any;
  jobProfile?: JobProfile;
  integritySignals?: IntegritySignals;
  currentDifficulty?: Difficulty;
  difficultyPath?: Difficulty[];
  status: InterviewStatus;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  durationSeconds: number;
  questions: Question[] | string[];
  result?: Result | string;
  createdAt: string;
}

export interface EvidenceQuote {
  dimension: string;
  quote: string;
  analysis: string;
  isPositive: boolean;
}

export interface SkillGap {
  skill: string;
  category: string;
  currentScore: number;
  priority: 'High' | 'Medium' | 'Low';
  learningPathId?: string;
}

export interface CategoryScores {
  technicalKnowledge: number;
  problemSolving: number;
  communication: number;
  answerAccuracy: number;
  depthOfKnowledge: number;
  confidence: number;
  behavioralSkills: number;
  timeManagement: number;
}

export interface KeyInsight {
  mainImprovement: string;
  recommendations: string[];
}

export interface Result {
  _id: string;
  interview: string | Interview;
  overallScore: number;
  confidence: number;
  communication: number;
  technicalAccuracy: number;
  problemSolving: number;
  dsaScore?: number;
  codeQualityScore?: number;
  systemDesignScore?: number;
  fundamentalsScore?: number;
  claimDefenseScore?: number;
  categoryScores?: CategoryScores;
  keyInsight?: KeyInsight;
  topicsToRevise?: string[];
  recommendedQuestions?: string[];
  personalizedPlan?: string[];
  interviewSummary?: string;
  strongAreas: string[];
  weakAreas: string[];
  suggestions: string[];
  topicBreakdown: {
    topic: string;
    accuracy: number;
    classification?: 'Strong' | 'Developing' | 'Weak' | 'Critical Gap';
  }[];
  evidenceQuotes?: EvidenceQuote[];
  skillGaps?: SkillGap[];
  integrityReport?: {
    score: number;
    status: string;
    tabSwitches: number;
    focusLoss: number;
    copyEvents: number;
    reviewRecommended: boolean;
  };
  timeTakenSeconds: number;
  pdfUrl?: string;
  createdAt: string;
}

export interface TopicHeatmapItem {
  topic: string;
  code: string;
  accuracy: number;
  status: 'Strong' | 'Average' | 'Needs Improvement';
  tone: 'green' | 'yellow' | 'red';
}

export interface ReadinessData {
  readinessScore: number;
  averageScore: number;
  streak: number;
  totalCompleted: number;
  summaryMessage: string;
  heatmap: TopicHeatmapItem[];
  weakestTopics: string[];
  strongestTopics: string[];
}

export interface ScheduledInterviewItem {
  _id: string;
  category: InterviewCategory;
  topic: string;
  company: string;
  targetRole: string;
  difficulty: Difficulty;
  interviewerPersona: InterviewerPersona;
  durationMinutes: number;
  scheduledAt: string;
  status: InterviewStatus;
}

export interface InterviewHistoryItem {
  _id: string;
  category: InterviewCategory;
  company: string;
  targetRole: string;
  difficulty: Difficulty;
  durationMinutes: number;
  durationSeconds: number;
  status: InterviewStatus;
  createdAt: string;
  completedAt?: string;
  questionCount: number;
  overallScore: number;
  interviewerPersona: InterviewerPersona;
  topics: string[];
  resultId?: string;
}


export interface SkillNode {
  _id?: string;
  skillName: string;
  category: 'Backend' | 'Frontend' | 'DSA' | 'System Design' | 'DevOps' | 'Database' | 'CS Fundamentals' | 'Behavioral';
  mastery: number;
  classification: 'Strong' | 'Developing' | 'Weak' | 'Critical Gap';
  attemptsCount: number;
  lastAssessedAt?: string;
}

export interface SkillProfile {
  _id: string;
  user: string;
  skills: SkillNode[];
  overview: {
    technical: number;
    dsa: number;
    systemDesign: number;
    communication: number;
    backend: number;
    fundamentals: number;
  };
  topGaps: string[];
  topStrengths: string[];
}

export interface LearningModule {
  _id?: string;
  title: string;
  description: string;
  concepts: string[];
  learningObjectives: string[];
  scenarioQuestions: {
    question: string;
    explanation: string;
    keyTakeaway: string;
  }[];
  isCompleted: boolean;
  completedAt?: string;
}

export interface LearningPath {
  _id: string;
  user: string;
  targetSkill: string;
  category: string;
  summary: string;
  difficulty: string;
  estimatedHours: number;
  modules: LearningModule[];
  progress: number;
  isCompleted: boolean;
  createdAt: string;
}

export interface PracticeQuestion {
  _id?: string;
  questionType: 'quiz' | 'scenario' | 'code_challenge' | 'conceptual';
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  modelExplanation: string;
  userAnswer?: string;
  isCorrect?: boolean;
  score?: number;
}

export interface PracticeSession {
  _id: string;
  user: string;
  skillName: string;
  category: string;
  difficulty: Difficulty;
  status: 'in_progress' | 'completed';
  questions: PracticeQuestion[];
  score: number;
  masteryGain: number;
  completedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { total: number; page: number; limit: number };
}
