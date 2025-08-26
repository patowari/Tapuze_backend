
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ErrorType = 'minor_slip' | 'procedural_error' | 'conceptual_error';

export interface BilingualText {
    en: string;
    he: string;
}

export interface ErrorAnalysis {
    error_type: ErrorType;
    deduction: number;
    explanation: BilingualText;
    boundingBox: BoundingBox;
}

export interface ProblemAnalysis {
    problem_description: BilingualText;
    score: number;
    max_score: number;
    feedback: BilingualText; // General feedback for the student
    teacher_recommendation: BilingualText; // Recommendations for the teacher
    errors: ErrorAnalysis[];
}

export interface GradingResponse {
    overall_score: number;
    problem_breakdown: ProblemAnalysis[];
}