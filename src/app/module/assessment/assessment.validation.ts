import { z } from "zod";

export const AssessmentValidation = {
  createAssessmentSchema: z.object({
    body: z.object({
      title: z.string({ message: "Title is required" }).min(1, "Title cannot be empty"),
      durationMinutes: z.number({ message: "Duration is required" }).positive("Duration must be positive"),
      totalMarks: z.number({ message: "Total marks is required" }).positive("Total marks must be positive"),
      passMarks: z.number({ message: "Pass marks is required" }).positive("Pass marks must be positive"),
      questionIds: z.array(z.string(), { message: "Question IDs are required" }).min(1, "At least one question is required"),
    }),
  }),
};