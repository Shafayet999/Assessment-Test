import { AssessmentStatus, Difficulty, QuestionType } from "../../../generated/prisma/enums";


export interface ICreateQuestion {
  title: string;
  description: string;
  type: QuestionType;
  difficulty: Difficulty;
  options?: string[];
  correctAnswer?: string;
  marks?: number;
}

export interface ICreateAssessment {
  title: string;
  description?: string;
  durationMinutes: number;
  totalMarks?: number;
  passMarks?: number;
  questionIds?: string[]; // অ্যাসেসমেন্ট তৈরির সাথে সাথেই প্রশ্ন লিংক করার জন্য
}

export interface IAssessmentFilterRequest {
  searchTerm?: string;
  status?: AssessmentStatus;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}