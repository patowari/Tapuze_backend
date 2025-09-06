export enum UserRole {
  Teacher = 'Teacher',
  Student = 'Student',
}

export type Language = 'en' | 'he';

export interface BilingualText {
  en: string;
  he: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AIError {
  error_type: 'minor_slip' | 'procedural_error' | 'conceptual_error';
  deduction: number;
  explanation: BilingualText;
  hint: BilingualText;
  boundingBox: BoundingBox;
}

export interface ProblemBreakdown {
  problem_description: BilingualText;
  score: number;
  max_score: number;
  feedback: BilingualText;
  teacher_recommendation: BilingualText;
  errors: AIError[];
}

export interface GradingResponse {
  overall_score: number;
  problem_breakdown: ProblemBreakdown[];
}

export interface Submission {
  id: string;
  studentId: string;
  fileData: string; // base64 encoded image of the submission
  fileName: string;
  submittedAt: string;
  evaluation?: GradingResponse | null;
  isGraded?: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  createdAt: string;
  submissions: Submission[];
}

export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  secretCode: string;
  assignments: Assignment[];
  studentIds: string[];
}